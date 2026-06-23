package com.alexanderpolozhnov.careerpilot.monitoring.response;

import java.time.Instant;
import java.util.UUID;

public record VacancyFilterResponse(
        UUID id,
        UUID userId,
        String searchQuery,
        Integer targetSalary,
        Boolean isActive,
        Instant lastPolledAt,
        Instant createdAt,
        Instant updatedAt,
        String experience,
        String employment,
        String schedule,
        String area,
        Boolean onlyWithSalary,
        Integer pollingInterval
) {
}
