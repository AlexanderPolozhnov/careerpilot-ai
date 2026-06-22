package com.alexanderpolozhnov.careerpilot.resume.response;

import java.time.Instant;
import java.util.UUID;

public record UserResumeResponse(
        UUID id,
        UUID userId,
        String rawText,
        String coverLetterTemplate,
        Instant createdAt,
        Instant updatedAt
) {
}
