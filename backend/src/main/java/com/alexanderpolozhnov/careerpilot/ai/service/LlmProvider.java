package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;

public interface LlmProvider {
    LlmResponse generate(String prompt);
}
