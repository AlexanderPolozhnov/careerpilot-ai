package com.alexanderpolozhnov.careerpilot.application.request;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Запрос на создание или обновление заявки на вакансию.
 */
public record ApplicationRequest(
        @NotNull(message = "vacancyId is required") UUID vacancyId,

        ApplicationStatus status,

        @Size(max = 10_000) String notes,

        LocalDate appliedAt,

        @Size(max = 255) String resumeId) {
}
