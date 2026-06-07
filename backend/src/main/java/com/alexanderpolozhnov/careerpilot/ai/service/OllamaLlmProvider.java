package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OllamaLlmProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(OllamaLlmProvider.class);
    private final RestTemplate restTemplate = new RestTemplate();
    private final FallbackLlmGenerator fallbackLlmGenerator;

    public OllamaLlmProvider(FallbackLlmGenerator fallbackLlmGenerator) {
        this.fallbackLlmGenerator = fallbackLlmGenerator;
    }

    @Override
    public LlmResponse generate(String prompt, PreferencesEntity preferences) {
        String ollamaBaseUrl = (preferences.getOllamaUrl() != null && !preferences.getOllamaUrl().isBlank())
                ? preferences.getOllamaUrl()
                : "http://localhost:11434";
        String ollamaModel = (preferences.getOllamaModel() != null && !preferences.getOllamaModel().isBlank())
                ? preferences.getOllamaModel()
                : "llama3";

        try {
            String url = ollamaBaseUrl + "/api/generate";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                    "model", ollamaModel,
                    "prompt", prompt,
                    "stream", false);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object responseText = response.getBody().get("response");
                if (responseText != null) {
                    String text = responseText.toString();
                    Integer tokens = extractTokens(response.getBody());
                    Long latencyMs = extractLatency(response.getBody());
                    return new LlmResponse(text, tokens, latencyMs, null, false);
                }
            }
        } catch (Exception e) {
            log.warn("Ollama unavailable, using fallback: {}", e.getMessage());
        }
        return fallbackLlmGenerator.generateFallback(prompt);
    }

    private Integer extractTokens(Map responseBody) {
        try {
            Object promptEvalCount = responseBody.get("prompt_eval_count");
            Object evalCount = responseBody.get("eval_count");
            int tokens = 0;
            if (promptEvalCount instanceof Number) {
                tokens += ((Number) promptEvalCount).intValue();
            }
            if (evalCount instanceof Number) {
                tokens += ((Number) evalCount).intValue();
            }
            return tokens > 0 ? tokens : null;
        } catch (Exception e) {
            log.debug("Failed to extract tokens from Ollama response: {}", e.getMessage());
            return null;
        }
    }

    private Long extractLatency(Map responseBody) {
        try {
            Object totalDuration = responseBody.get("total_duration");
            if (totalDuration instanceof Number) {
                long nanos = ((Number) totalDuration).longValue();
                return nanos / 1_000_000; // Convert nanoseconds to milliseconds
            }
        } catch (Exception e) {
            log.debug("Failed to extract latency from Ollama response: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public java.util.List<String> getAvailableModels(PreferencesEntity preferences) {
        String ollamaBaseUrl = (preferences.getOllamaUrl() != null && !preferences.getOllamaUrl().isBlank())
                ? preferences.getOllamaUrl() : "http://localhost:11434";
        try {
            String url = ollamaBaseUrl + "/api/tags";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object models = response.getBody().get("models");
                if (models instanceof java.util.List) {
                    return ((java.util.List<?>) models).stream()
                            .filter(item -> item instanceof Map)
                            .map(item -> ((Map<?, ?>) item).get("name"))
                            .filter(name -> name != null)
                            .map(Object::toString)
                            .sorted()
                            .toList();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch Ollama models: {}", e.getMessage());
            throw new RuntimeException("Failed to connect to Ollama: " + e.getMessage());
        }
        throw new RuntimeException("Failed to fetch Ollama models: invalid response format");
    }
}
