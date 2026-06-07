package com.alexanderpolozhnov.careerpilot.ai.request;

import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import com.alexanderpolozhnov.careerpilot.preferences.entity.CustomAiProvider;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AiProviderConfigRequest(
    @NotNull AiProviderMode aiProviderMode,
    CustomAiProvider customAiProvider,
    @Size(max = 255) String openAiApiKey,
    @Size(max = 50) String openAiModel,
    @Size(max = 255) String ollamaUrl,
    @Size(max = 50) String ollamaModel,
    @Size(max = 255) String geminiApiKey,
    @Size(max = 50) String geminiModel
) {
}
