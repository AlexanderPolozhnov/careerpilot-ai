package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import com.alexanderpolozhnov.careerpilot.preferences.entity.CustomAiProvider;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import org.springframework.stereotype.Component;

@Component
public class LlmProviderFactory {

    private final OllamaLlmProvider ollamaLlmProvider;
    private final OpenAiLlmProvider openAiLlmProvider;
    private final GeminiLlmProvider geminiLlmProvider;

    public LlmProviderFactory(OllamaLlmProvider ollamaLlmProvider, OpenAiLlmProvider openAiLlmProvider,
            GeminiLlmProvider geminiLlmProvider) {
        this.ollamaLlmProvider = ollamaLlmProvider;
        this.openAiLlmProvider = openAiLlmProvider;
        this.geminiLlmProvider = geminiLlmProvider;
    }

    public LlmProvider getProvider(PreferencesEntity preferences) {
        if (preferences.getAiProviderMode() == AiProviderMode.LOCAL) {
            return ollamaLlmProvider;
        }
        if (preferences.getAiProviderMode() == AiProviderMode.BRING_YOUR_OWN_KEY) {
            CustomAiProvider customProvider = preferences.getCustomAiProvider();
            if (customProvider == CustomAiProvider.GEMINI) {
                return geminiLlmProvider;
            }
            return openAiLlmProvider;
        }
        return openAiLlmProvider; // CLOUD defaults to OpenAI
    }
}
