package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class GeminiLlmProvider implements LlmProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final FallbackLlmGenerator fallbackLlmGenerator;

    public GeminiLlmProvider(FallbackLlmGenerator fallbackLlmGenerator) {
        this.fallbackLlmGenerator = fallbackLlmGenerator;
    }

    @Override
    public LlmResponse generate(String prompt, PreferencesEntity preferences) {
        String apiKey = preferences.getGeminiApiKey();
        String model = preferences.getGeminiModel() != null && !preferences.getGeminiModel().isBlank()
                ? preferences.getGeminiModel()
                : "gemini-1.5-flash";

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is empty, using fallback");
            return fallbackLlmGenerator.generateFallback(prompt);
        }

        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = Map.of(
                    "contents", Map.of(
                            "parts", Map.of(
                                    "text", prompt
                            )
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map responseBody = response.getBody();
                Object candidates = responseBody.get("candidates");
                if (candidates instanceof java.util.List && !((java.util.List<?>) candidates).isEmpty()) {
                    Map firstCandidate = (Map) ((java.util.List<?>) candidates).get(0);
                    Object content = firstCandidate.get("content");
                    if (content instanceof Map) {
                        Object parts = ((Map) content).get("parts");
                        if (parts instanceof java.util.List && !((java.util.List<?>) parts).isEmpty()) {
                            Map firstPart = (Map) ((java.util.List<?>) parts).get(0);
                            Object text = firstPart.get("text");
                            if (text != null) {
                                String textContent = text.toString();
                                Object usageMetadata = responseBody.get("usageMetadata");
                                Integer tokens = null;
                                if (usageMetadata instanceof Map) {
                                    Object totalTokenCount = ((Map) usageMetadata).get("totalTokenCount");
                                    if (totalTokenCount instanceof Number) {
                                        tokens = ((Number) totalTokenCount).intValue();
                                    }
                                }
                                return new LlmResponse(textContent, tokens, null, null, false);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API error, using fallback: {}", e.getMessage());
        }

        return fallbackLlmGenerator.generateFallback(prompt);
    }

    @Override
    public java.util.List<String> getAvailableModels(PreferencesEntity preferences) {
        String apiKey = preferences.getGeminiApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return java.util.Collections.emptyList();
        }
        try {
            String url = "https://generativelanguage.googleapis.com/v1beta/models?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object models = response.getBody().get("models");
                if (models instanceof java.util.List) {
                    return ((java.util.List<?>) models).stream()
                            .filter(item -> item instanceof Map)
                            .map(item -> ((Map<?, ?>) item).get("name"))
                            .filter(name -> name != null)
                            .map(Object::toString)
                            .map(name -> name.replaceFirst("^models/", ""))
                            .filter(name -> name.startsWith("gemini"))
                            .sorted()
                            .toList();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Gemini models: {}", e.getMessage());
        }
        return java.util.Collections.emptyList();
    }
}
