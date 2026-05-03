package com.alexanderpolozhnov.careerpilot.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record DashboardAiInsightDto(
    UUID id,
    String type,
    String prompt,
    String result,
    Instant createdAt
) {
}
