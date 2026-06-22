package com.alexanderpolozhnov.careerpilot.integration.hh.service;

import com.alexanderpolozhnov.careerpilot.integration.hh.entity.HhIntegrationEntity;
import com.alexanderpolozhnov.careerpilot.integration.hh.repository.HhIntegrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class HhSyncServiceImpl implements HhSyncService {

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String HH_AUTH_URL = "https://hh.ru/oauth/authorize";
    private static final String HH_TOKEN_URL = "https://hh.ru/oauth/token";
    private static final String HH_API_BASE = "https://api.hh.ru";

    @Value("${hh.client-id:}")
    private String clientId;

    @Value("${hh.client-secret:}")
    private String clientSecret;

    @Value("${hh.redirect-uri:http://localhost:8080/api/integration/hh/callback}")
    private String redirectUri;

    private final HhIntegrationRepository hhIntegrationRepository;

    @Override
    public String buildAuthorizationUrl() {
        return HH_AUTH_URL +
                "?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri;
    }

    @Override
    @Transactional
    public void handleCallback(String code, UUID userId) {
        // Обмен кода на токены
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("code", code);
        body.add("redirect_uri", redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        Map<String, Object> tokenResponse = restTemplate.postForObject(HH_TOKEN_URL, request, Map.class);

        if (tokenResponse == null) {
            throw new IllegalStateException("Empty token response from hh.ru");
        }

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.getOrDefault("expires_in", 86400);

        // Получить hh_user_id из /me
        String hhUserId = fetchHhUserId(accessToken);

        // Сохраняем или обновляем интеграцию
        HhIntegrationEntity integration = hhIntegrationRepository.findByUserId(userId)
                .orElseGet(() -> {
                    HhIntegrationEntity e = new HhIntegrationEntity();
                    e.setUserId(userId);
                    return e;
                });

        integration.setAccessToken(accessToken);
        integration.setRefreshToken(refreshToken);
        integration.setHhUserId(hhUserId);
        integration.setExpiresAt(Instant.now().plusSeconds(expiresIn));

        hhIntegrationRepository.save(integration);
        log.info("hh.ru integration saved for userId={}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getResumePreview(UUID userId) {
        HhIntegrationEntity integration = hhIntegrationRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalStateException("hh.ru not connected for user: " + userId));

        String accessToken = integration.getAccessToken();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("HH-User-Agent", "CareerPilot AI/1.0 (contact@careerpilot-ai.ru)");
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Получаем список резюме пользователя
        @SuppressWarnings("unchecked")
        ResponseEntity<Map> response = restTemplate.exchange(
                HH_API_BASE + "/resumes/mine",
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map<String, Object> body = response.getBody();
        if (body == null) return Collections.emptyMap();

        // Возвращаем данные первого резюме для предпросмотра
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.getOrDefault("items", List.of());
        if (items.isEmpty()) return Collections.emptyMap();

        Map<String, Object> firstResume = items.get(0);
        return extractPreviewFields(firstResume);
    }

    @Override
    @Transactional
    public void syncSelectedFields(UUID userId, List<String> fieldsToSync) {
        // Получаем данные с hh.ru
        Map<String, Object> preview = getResumePreview(userId);

        // Применяем только выбранные поля
        // Логика обновления Profile пользователя реализуется через ProfileService
        // Здесь логируем для трассируемости
        log.info("Syncing fields {} from hh.ru for userId={}", fieldsToSync, userId);
        log.info("hh.ru data to sync: {}", preview);

        // TODO: при наличии ProfileService — вызвать метод обновления с выбранными полями
    }

    @Override
    @Transactional
    public void disconnect(UUID userId) {
        hhIntegrationRepository.deleteByUserId(userId);
        log.info("hh.ru integration disconnected for userId={}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isConnected(UUID userId) {
        return hhIntegrationRepository.existsByUserId(userId);
    }

    // ─── Приватные вспомогательные методы ────────────────────────────────────

    private String fetchHhUserId(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("HH-User-Agent", "CareerPilot AI/1.0 (contact@careerpilot-ai.ru)");
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.exchange(
                    HH_API_BASE + "/me",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<String, Object> me = response.getBody();
            return me != null ? (String) me.get("id") : null;
        } catch (Exception e) {
            log.warn("Failed to fetch hh user id: {}", e.getMessage());
            return null;
        }
    }

    private Map<String, Object> extractPreviewFields(Map<String, Object> resumeData) {
        Map<String, Object> preview = new LinkedHashMap<>();

        // Имя
        @SuppressWarnings("unchecked")
        Map<String, Object> firstName = (Map<String, Object>) resumeData.get("first_name");
        @SuppressWarnings("unchecked")
        Map<String, Object> lastName = (Map<String, Object>) resumeData.get("last_name");
        if (firstName != null && lastName != null) {
            preview.put("name", firstName + " " + lastName);
        }

        // Город / локация
        @SuppressWarnings("unchecked")
        Map<String, Object> area = (Map<String, Object>) resumeData.get("area");
        if (area != null) {
            preview.put("location", area.get("name"));
        }

        // Навыки
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> skillSet = (List<Map<String, Object>>) resumeData.get("skill_set");
        if (skillSet != null) {
            List<String> skills = skillSet.stream()
                    .map(s -> (String) s.get("name"))
                    .filter(Objects::nonNull)
                    .toList();
            preview.put("skills", skills);
        }

        // Опыт работы (кол-во лет)
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> experience = (List<Map<String, Object>>) resumeData.get("experience");
        if (experience != null) {
            int months = experience.stream()
                    .mapToInt(e -> {
                        Integer m = (Integer) e.get("months");
                        return m != null ? m : 0;
                    })
                    .sum();
            preview.put("yearsOfExperience", months / 12);
        }

        // Заголовок / должность
        Object title = resumeData.get("title");
        if (title != null) {
            preview.put("headline", title);
        }

        return preview;
    }
}
