package com.alexanderpolozhnov.careerpilot.application.request;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

/**
 * Запрос на создание или обновление заявки на вакансию.
 */
public record ApplicationRequest(
    @NotNull(message = "vacancyId is required")
    UUID vacancyId,

    ApplicationStatus status,

    String notes,

    Instant appliedAt,

    String resumeId
) {
}
