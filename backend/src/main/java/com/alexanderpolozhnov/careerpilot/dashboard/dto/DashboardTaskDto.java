package com.alexanderpolozhnov.careerpilot.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record DashboardTaskDto(
    UUID id,
    String title,
    String priority,
    boolean done,
    Instant dueAt
) {
}
