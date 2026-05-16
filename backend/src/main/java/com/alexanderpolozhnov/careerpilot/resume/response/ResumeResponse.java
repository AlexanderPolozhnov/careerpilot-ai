package com.alexanderpolozhnov.careerpilot.resume.response;

import java.time.Instant;
import java.util.UUID;

public record ResumeResponse(
        UUID id,
        UUID userId,
        String name,
        String fileUrl,
        String textContent,
        Boolean isDefault,
        Instant createdAt,
        Instant updatedAt
) {
}
