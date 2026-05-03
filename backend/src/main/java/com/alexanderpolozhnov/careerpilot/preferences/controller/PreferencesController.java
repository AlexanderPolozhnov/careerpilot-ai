package com.alexanderpolozhnov.careerpilot.preferences.controller;

import com.alexanderpolozhnov.careerpilot.preferences.request.PreferencesRequest;
import com.alexanderpolozhnov.careerpilot.preferences.response.PreferencesResponse;
import com.alexanderpolozhnov.careerpilot.preferences.service.PreferencesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class PreferencesController {

    private final PreferencesService preferencesService;

    @GetMapping
    public PreferencesResponse getPreferences() {
        return preferencesService.getPreferences();
    }

    @PutMapping
    public PreferencesResponse updatePreferences(@Valid @RequestBody PreferencesRequest request) {
        return preferencesService.updatePreferences(request);
    }
}
