package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import org.springframework.stereotype.Component;

@Component
public class LlmProviderFactory {

    private final OllamaLlmProvider ollamaLlmProvider;
    private final OpenAiLlmProvider openAiLlmProvider;

    public LlmProviderFactory(OllamaLlmProvider ollamaLlmProvider, OpenAiLlmProvider openAiLlmProvider) {
        this.ollamaLlmProvider = ollamaLlmProvider;
        this.openAiLlmProvider = openAiLlmProvider;
    }

    public LlmProvider getProvider(AiProviderMode mode) {
        return switch (mode) {
            case LOCAL -> ollamaLlmProvider;
            case CLOUD, BRING_YOUR_OWN_KEY -> openAiLlmProvider;
        };
    }
}
