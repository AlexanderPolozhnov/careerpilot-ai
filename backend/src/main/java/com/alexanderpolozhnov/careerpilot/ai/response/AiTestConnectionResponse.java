package com.alexanderpolozhnov.careerpilot.ai.response;

public record AiTestConnectionResponse(
    boolean success,
    String message,
    Long latencyMs
) {
}
