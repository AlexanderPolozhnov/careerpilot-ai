package com.alexanderpolozhnov.careerpilot.preferences.controller;

import com.alexanderpolozhnov.careerpilot.preferences.request.PreferencesRequest;
import com.alexanderpolozhnov.careerpilot.preferences.response.PreferencesResponse;
import com.alexanderpolozhnov.careerpilot.preferences.service.PreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class PreferencesController {

    private final PreferencesService preferencesService;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @GetMapping
    public PreferencesResponse getPreferences() {
        return preferencesService.getPreferences();
    }

    @PutMapping
    public PreferencesResponse updatePreferences(@Valid @RequestBody PreferencesRequest request) {
        return preferencesService.updatePreferences(request);
    }

    @GetMapping("/telegram-link")
    public Map<String, String> generateTelegramLink() {
        String token = preferencesService.generateTelegramConnectToken();
        String link = "https://t.me/" + botUsername + "?start=" + token;
        return Map.of("link", link);
    }
}
