package com.alexanderpolozhnov.careerpilot.integration.google;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeRequestUrl;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@Primary
public class GoogleCalendarServiceImpl implements GoogleCalendarService {

    private final PreferencesRepository preferencesRepository;
    private final AuthRepository authRepository;

    public GoogleCalendarServiceImpl(PreferencesRepository preferencesRepository, AuthRepository authRepository) {
        this.preferencesRepository = preferencesRepository;
        this.authRepository = authRepository;
    }

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${app.google.redirect-uri}")
    private String redirectUri;

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Override
    public String getAuthUrl(UUID userId) {
        GoogleAuthorizationCodeRequestUrl urlBuilder = new GoogleAuthorizationCodeRequestUrl(
                clientId,
                redirectUri,
                Collections.singletonList(CalendarScopes.CALENDAR_EVENTS)
        );
        urlBuilder.setAccessType("offline");
        urlBuilder.setApprovalPrompt("force"); // using setApprovalPrompt instead
        urlBuilder.setState(userId.toString());
        return urlBuilder.build();
    }

    @Override
    @Transactional
    public void handleCallback(String code, String state) {
        try {
            UUID userId = UUID.fromString(state);
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            
            GoogleAuthorizationCodeTokenRequest tokenRequest = new GoogleAuthorizationCodeTokenRequest(
                    httpTransport,
                    JSON_FACTORY,
                    "https://oauth2.googleapis.com/token",
                    clientId,
                    clientSecret,
                    code,
                    redirectUri
            );
            
            TokenResponse response = tokenRequest.execute();
            String refreshToken = response.getRefreshToken();
            
            if (refreshToken == null) {
                log.warn("Google didn't return a refresh token for user {}", userId);
                // In production, you might want to handle this better, e.g. force consent prompt again
            }

            PreferencesEntity prefs = preferencesRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        PreferencesEntity newPrefs = new PreferencesEntity();
                        newPrefs.setUserId(userId);
                        return newPrefs;
                    });

            if (refreshToken != null) {
                prefs.setGoogleCalendarRefreshToken(refreshToken);
            }
            prefs.setGoogleCalendarConnected(true);
            preferencesRepository.save(prefs);
            
            log.info("Successfully connected Google Calendar for user {}", userId);

        } catch (IOException | GeneralSecurityException e) {
            log.error("Error during Google OAuth callback", e);
            throw new RuntimeException("Failed to exchange code for tokens", e);
        }
    }

    @Override
    @Transactional
    public void disconnect() {
        AuthEntity user = currentUser();
        PreferencesEntity prefs = preferencesRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Preferences not found"));
                
        prefs.setGoogleCalendarRefreshToken(null);
        prefs.setGoogleCalendarConnected(false);
        preferencesRepository.save(prefs);
        log.info("Disconnected Google Calendar for user {}", user.getId());
    }

    @Override
    public String createEvent(InterviewEntity interview) {
        AuthEntity user = currentUser();
        PreferencesEntity prefs = preferencesRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Preferences not found"));
                
        if (!prefs.isGoogleCalendarConnected() || prefs.getGoogleCalendarRefreshToken() == null) {
            throw new IllegalStateException("Google Calendar is not connected");
        }

        try {
            HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            
            GoogleCredential credential = new GoogleCredential.Builder()
                .setTransport(httpTransport)
                .setJsonFactory(JSON_FACTORY)
                .setClientSecrets(clientId, clientSecret)
                .build()
                .setRefreshToken(prefs.getGoogleCalendarRefreshToken());
                
            Calendar service = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                .setApplicationName("CareerPilot AI")
                .build();
                
            String vacancyTitle = interview.getApplication().getVacancy().getTitle();
            String companyName = interview.getApplication().getVacancy().getCompany() != null
                    ? interview.getApplication().getVacancy().getCompany().getName()
                    : "No Company";

            String lang = prefs.getLanguage() != null ? prefs.getLanguage().toLowerCase() : "en";
            String tz = interview.getTimezone();
            if (tz == null || tz.isEmpty()) {
                tz = "UTC";
            }

            DateTimeFormatter timeFormatter;
            if ("ru".equals(lang)) {
                timeFormatter = DateTimeFormatter.ofPattern("HH:mm").withZone(ZoneId.of(tz));
            } else {
                timeFormatter = DateTimeFormatter.ofPattern("hh:mm a").withZone(ZoneId.of(tz));
            }
            String formattedTime = timeFormatter.format(interview.getScheduledAt());

            String summary;
            if ("ru".equals(lang)) {
                summary = "Собеседование [" + formattedTime + "]: " + vacancyTitle + " в " + companyName;
            } else {
                summary = "Interview [" + formattedTime + "]: " + vacancyTitle + " at " + companyName;
            }

            Event event = new Event()
                .setSummary(summary)
                .setDescription(interview.getNotes());

            if (interview.getMeetingLink() != null) {
                event.setLocation(interview.getMeetingLink());
            }

            DateTime startDateTime = new DateTime(interview.getScheduledAt().toEpochMilli());
            EventDateTime start = new EventDateTime()
                .setDateTime(startDateTime)
                .setTimeZone(tz);
            event.setStart(start);

            // Default to 1 hour duration
            DateTime endDateTime = new DateTime(interview.getScheduledAt().toEpochMilli() + 3600000);
            EventDateTime end = new EventDateTime()
                .setDateTime(endDateTime)
                .setTimeZone(tz);
            event.setEnd(end);

            Event createdEvent = service.events().insert("primary", event).execute();
            log.info("Created Google Calendar event {} for interview {} (user: {})", 
                createdEvent.getId(), interview.getId(), user.getEmail());
            return createdEvent.getId();
            
        } catch (IOException | GeneralSecurityException e) {
            log.error("Failed to create Google Calendar event for interview {}: {}", interview.getId(), e.getMessage());
            throw new RuntimeException("Google Calendar API error: " + e.getMessage(), e);
        }
    }
    
    private AuthEntity currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new InvalidCredentialsException("Unauthorized");
        }
        return authRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }
}
