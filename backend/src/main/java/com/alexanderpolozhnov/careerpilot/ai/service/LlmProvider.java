package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;

public interface LlmProvider {
    LlmResponse generate(String prompt, PreferencesEntity preferences);
}
