package com.alexanderpolozhnov.careerpilot.integration.hh.controller;

import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.integration.hh.service.HhSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/integration/hh")
@RequiredArgsConstructor
public class HhOAuthController {

    private final HhSyncService hhSyncService;
    private final CurrentUserResolver currentUserResolver;

    /**
     * GET /api/integration/hh/auth-url
     * Возвращает URL для перехода на страницу OAuth2-авторизации hh.ru.
     */
    @GetMapping("/auth-url")
    public ResponseEntity<Map<String, String>> getAuthUrl() {
        String url = hhSyncService.buildAuthorizationUrl();
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * GET /api/integration/hh/callback
     * Принимает авторизационный code от hh.ru, обменивает на токены и сохраняет интеграцию.
     */
    @GetMapping("/callback")
    public ResponseEntity<Map<String, String>> handleCallback(@RequestParam("code") String code) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        hhSyncService.handleCallback(code, userId);
        return ResponseEntity.ok(Map.of("status", "connected"));
    }

    /**
     * GET /api/integration/hh/preview
     * Возвращает данные с hh.ru для предпросмотра перед синхронизацией в профиль.
     */
    @GetMapping("/preview")
    public ResponseEntity<Map<String, Object>> getPreview() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        Map<String, Object> preview = hhSyncService.getResumePreview(userId);
        return ResponseEntity.ok(preview);
    }

    /**
     * POST /api/integration/hh/sync
     * Синхронизирует выбранные поля из hh.ru в профиль пользователя.
     */
    @PostMapping("/sync")
    public ResponseEntity<Void> syncProfile(@RequestBody Map<String, List<String>> body) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        List<String> fields = body.getOrDefault("fields", List.of());
        hhSyncService.syncSelectedFields(userId, fields);
        return ResponseEntity.noContent().build();
    }

    /**
     * DELETE /api/integration/hh
     * Отключает интеграцию с hh.ru (удаляет токены).
     */
    @DeleteMapping
    public ResponseEntity<Void> disconnect() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        hhSyncService.disconnect(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/integration/hh/status
     * Проверяет, подключена ли интеграция hh.ru.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        boolean connected = hhSyncService.isConnected(userId);
        return ResponseEntity.ok(Map.of("connected", connected));
    }
}
