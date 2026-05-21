package com.alexanderpolozhnov.careerpilot.preferences.request;

import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PreferencesRequest(
                boolean weeklyDigest,
                boolean interviewReminders,
                boolean taskReminders,
                boolean applicationStatusNotifications,
                @NotNull AiProviderMode aiProviderMode,
                @NotBlank String language) {
}
