package com.alexanderpolozhnov.careerpilot.application.response;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * Ответ с данными заявки. userId не возвращается наружу.
 */
public record ApplicationResponse(
    UUID id,
    UUID vacancyId,
    ApplicationStatus status,
    String notes,
    Instant appliedAt,
    String resumeId,
    Instant createdAt,
    Instant updatedAt
) {
}
