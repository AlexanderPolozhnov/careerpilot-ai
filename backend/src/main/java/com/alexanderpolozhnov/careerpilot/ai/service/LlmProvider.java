package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;

import java.util.Collections;
import java.util.List;

public interface LlmProvider {
    LlmResponse generate(String prompt, PreferencesEntity preferences);

    default List<String> getAvailableModels(PreferencesEntity preferences) {
        return Collections.emptyList();
    }
}
