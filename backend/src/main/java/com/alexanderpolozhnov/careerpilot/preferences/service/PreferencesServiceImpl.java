package com.alexanderpolozhnov.careerpilot.preferences.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.preferences.request.PreferencesRequest;
import com.alexanderpolozhnov.careerpilot.preferences.response.PreferencesResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PreferencesServiceImpl implements PreferencesService {

    private final PreferencesRepository preferencesRepository;
    private final AuthRepository authRepository;

    @Override
    public PreferencesResponse getPreferences() {
        AuthEntity user = currentUser();
        PreferencesEntity prefs = preferencesRepository.findByUserId(user.getId())
            .orElseGet(() -> createDefaults(user.getId()));
        return toResponse(prefs);
    }

    @Override
    @Transactional
    public PreferencesResponse updatePreferences(PreferencesRequest request) {
        AuthEntity user = currentUser();
        PreferencesEntity prefs = preferencesRepository.findByUserId(user.getId())
            .orElseGet(() -> createDefaults(user.getId()));
        prefs.setWeeklyDigest(request.weeklyDigest());
        prefs.setInterviewReminders(request.interviewReminders());
        prefs.setAiProviderMode(request.aiProviderMode());
        prefs.setLanguage(request.language());
        return toResponse(preferencesRepository.save(prefs));
    }

    private PreferencesEntity createDefaults(java.util.UUID userId) {
        PreferencesEntity prefs = new PreferencesEntity();
        prefs.setUserId(userId);
        return preferencesRepository.save(prefs);
    }

    private AuthEntity currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new InvalidCredentialsException("Unauthorized");
        }
        return authRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private PreferencesResponse toResponse(PreferencesEntity prefs) {
        return new PreferencesResponse(
            prefs.isWeeklyDigest(),
            prefs.isInterviewReminders(),
            prefs.getAiProviderMode().name(),
            prefs.getLanguage()
        );
    }
}
