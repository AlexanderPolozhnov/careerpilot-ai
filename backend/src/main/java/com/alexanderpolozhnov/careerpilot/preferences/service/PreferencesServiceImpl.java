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
        try {
            AuthEntity user = currentUser();
            PreferencesEntity prefs = preferencesRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        PreferencesEntity newPrefs = new PreferencesEntity();
                        newPrefs.setUserId(user.getId());
                        return newPrefs;
                    });
            
            prefs.setWeeklyDigest(request.weeklyDigest());
            prefs.setInterviewReminders(request.interviewReminders());
            prefs.setTaskReminders(request.taskReminders());
            prefs.setApplicationStatusNotifications(request.applicationStatusNotifications());
            
            if (request.aiProviderMode() != null) {
                prefs.setAiProviderMode(request.aiProviderMode());
            }
            
            if (request.language() != null && !request.language().isBlank()) {
                prefs.setLanguage(request.language());
            }

            // Защита от перезаписи маски: если пришло значение с "...", это маска от фронтенда
            if (request.openAiApiKey() == null || request.openAiApiKey().isEmpty()) {
                prefs.setOpenAiApiKey(null);
            } else if (!request.openAiApiKey().contains("...")) {
                prefs.setOpenAiApiKey(request.openAiApiKey());
            }

            prefs.setOpenAiModel(request.openAiModel());
            prefs.setOllamaUrl(request.ollamaUrl());
            prefs.setOllamaModel(request.ollamaModel());

            // Custom AI Provider settings
            if (request.customAiProvider() != null) {
                prefs.setCustomAiProvider(request.customAiProvider());
            }

            // Защита от перезаписи маски для Gemini API key
            if (request.geminiApiKey() == null || request.geminiApiKey().isEmpty()) {
                prefs.setGeminiApiKey(null);
            } else if (!request.geminiApiKey().contains("...")) {
                prefs.setGeminiApiKey(request.geminiApiKey());
            }

            if (request.geminiModel() != null) {
                prefs.setGeminiModel(request.geminiModel());
            }

            PreferencesEntity saved = preferencesRepository.save(prefs);
            return toResponse(saved);
        } catch (Exception e) {
            System.err.println("Error updating preferences: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private PreferencesEntity createDefaults(java.util.UUID userId) {
        PreferencesEntity prefs = new PreferencesEntity();
        prefs.setUserId(userId);
        prefs.setOllamaUrl("http://localhost:11434");
        prefs.setOllamaModel("llama3");
        prefs.setCustomAiProvider(com.alexanderpolozhnov.careerpilot.preferences.entity.CustomAiProvider.OPENAI);
        prefs.setGeminiModel("gemini-1.5-flash");
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
        String maskedApiKey = maskApiKey(prefs.getOpenAiApiKey());
        String maskedGeminiApiKey = maskApiKey(prefs.getGeminiApiKey());
        return new PreferencesResponse(
                prefs.isWeeklyDigest(),
                prefs.isInterviewReminders(),
                prefs.isTaskReminders(),
                prefs.isApplicationStatusNotifications(),
                prefs.getAiProviderMode().name(),
                prefs.getLanguage(),
                maskedApiKey,
                prefs.getOpenAiModel(),
                prefs.getOllamaUrl(),
                prefs.getOllamaModel(),
                prefs.getCustomAiProvider() != null ? prefs.getCustomAiProvider().name() : null,
                maskedGeminiApiKey,
                prefs.getGeminiModel());
    }

    private String maskApiKey(String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            return null;
        }
        if (apiKey.length() < 7) {
            return "***";
        }
        return apiKey.substring(0, 3) + "..." + apiKey.substring(apiKey.length() - 4);
    }
}
