package com.alexanderpolozhnov.careerpilot.auth.response;

import java.time.Instant;
import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String name,
        String avatarUrl,
        Instant createdAt
) {
}
