package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class OpenAiLlmProvider implements LlmProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final FallbackLlmGenerator fallbackLlmGenerator;

    @Value("${openai.api-key:}")
    private String systemApiKey;

    public OpenAiLlmProvider(FallbackLlmGenerator fallbackLlmGenerator) {
        this.fallbackLlmGenerator = fallbackLlmGenerator;
    }

    @Override
    public LlmResponse generate(String prompt, PreferencesEntity preferences) {
        String apiKey;
        String model = "gpt-4o";

        if (preferences.getAiProviderMode() == AiProviderMode.BRING_YOUR_OWN_KEY) {
            apiKey = preferences.getOpenAiApiKey();
            if (preferences.getOpenAiModel() != null && !preferences.getOpenAiModel().isBlank()) {
                model = preferences.getOpenAiModel();
            }
        } else {
            apiKey = systemApiKey;
        }

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("OpenAI API key is empty, using fallback");
            return fallbackLlmGenerator.generateFallback(prompt);
        }

        try {
            String url = "https://api.openai.com/v1/chat/completions";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "model", model,
                    "messages", Map.of("role", "user", "content", prompt),
                    "temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                Object choices = responseBody.get("choices");
                if (choices instanceof java.util.List && !((java.util.List<?>) choices).isEmpty()) {
                    Map firstChoice = (Map) ((java.util.List<?>) choices).get(0);
                    Object message = firstChoice.get("message");
                    if (message instanceof Map) {
                        Object content = ((Map) message).get("content");
                        if (content != null) {
                            String text = content.toString();
                            Object usage = responseBody.get("usage");
                            Integer tokens = null;
                            if (usage instanceof Map) {
                                Object totalTokens = ((Map) usage).get("total_tokens");
                                if (totalTokens instanceof Number) {
                                    tokens = ((Number) totalTokens).intValue();
                                }
                            }
                            return new LlmResponse(text, tokens, null, null, false);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("OpenAI API error, using fallback: {}", e.getMessage());
        }

        return fallbackLlmGenerator.generateFallback(prompt);
    }
}
