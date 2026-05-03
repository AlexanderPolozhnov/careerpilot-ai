package com.alexanderpolozhnov.careerpilot.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record DashboardInterviewDto(
    UUID id,
    String type,
    Instant scheduledAt,
    String meetingLink,
    String companyName,
    String vacancyTitle
) {
}
