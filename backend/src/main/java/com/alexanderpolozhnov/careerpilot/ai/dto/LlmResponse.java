package com.alexanderpolozhnov.careerpilot.ai.dto;

public record LlmResponse(
    String text,
    Integer tokens,
    Long latencyMs,
    String errorMessage
) {}
