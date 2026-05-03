package com.alexanderpolozhnov.careerpilot.preferences.request;

import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PreferencesRequest(
    boolean weeklyDigest,
    boolean interviewReminders,
    @NotNull AiProviderMode aiProviderMode,
    @NotBlank String language
) {
}
