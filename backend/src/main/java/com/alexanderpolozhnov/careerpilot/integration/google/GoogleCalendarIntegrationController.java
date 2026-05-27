package com.alexanderpolozhnov.careerpilot.integration.google;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/integrations/google-calendar")
public class GoogleCalendarIntegrationController {

    private final GoogleCalendarService googleCalendarService;
    private final AuthRepository authRepository;

    @Autowired
    public GoogleCalendarIntegrationController(GoogleCalendarService googleCalendarService, AuthRepository authRepository) {
        this.googleCalendarService = googleCalendarService;
        this.authRepository = authRepository;
    }

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @GetMapping("/auth-url")
    public Map<String, String> getAuthUrl() {
        AuthEntity user = currentUser();
        String url = googleCalendarService.getAuthUrl(user.getId());
        return Map.of("url", url);
    }

    @GetMapping("/callback")
    public ResponseEntity<Void> callback(@RequestParam String code, @RequestParam String state) {
        googleCalendarService.handleCallback(code, state);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "/app/settings#integrations"))
                .build();
    }

    @DeleteMapping
    @Auditable(action = "GOOGLE_CALENDAR_DISCONNECT", entityType = "PREFERENCES")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disconnect() {
        googleCalendarService.disconnect();
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
