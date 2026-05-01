package com.alexanderpolozhnov.careerpilot.application.response;

import java.time.Instant;
import java.util.UUID;

public record ApplicationBoardItemResponse(
        UUID id,
        String vacancyId,
        ApplicationBoardVacancyResponse vacancy,
        String status,
        Instant appliedAt,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
}
