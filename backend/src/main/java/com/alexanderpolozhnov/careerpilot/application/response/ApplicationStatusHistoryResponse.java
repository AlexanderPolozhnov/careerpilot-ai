package com.alexanderpolozhnov.careerpilot.application.response;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;

import java.time.Instant;
import java.util.UUID;

public record ApplicationStatusHistoryResponse(
        UUID id,
        ApplicationStatus fromStatus,
        ApplicationStatus toStatus,
        String notes,
        Instant createdAt) {
}
