package com.alexanderpolozhnov.careerpilot.preferences.request;

import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import com.alexanderpolozhnov.careerpilot.preferences.entity.CustomAiProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PreferencesRequest(
                boolean weeklyDigest,
                boolean interviewReminders,
                boolean taskReminders,
                boolean applicationStatusNotifications,
                @NotNull AiProviderMode aiProviderMode,
                @NotBlank String language,
                @Size(max = 255) String openAiApiKey,
                @Size(max = 50) String openAiModel,
                @Size(max = 255) String ollamaUrl,
                @Size(max = 50) String ollamaModel,
                CustomAiProvider customAiProvider,
                @Size(max = 255) String geminiApiKey,
                @Size(max = 50) String geminiModel) {
}
