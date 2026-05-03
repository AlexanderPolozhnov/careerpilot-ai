package com.alexanderpolozhnov.careerpilot.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record DashboardNotificationDto(
    UUID id,
    String title,
    String message,
    String status,
    Instant createdAt
) {
}
