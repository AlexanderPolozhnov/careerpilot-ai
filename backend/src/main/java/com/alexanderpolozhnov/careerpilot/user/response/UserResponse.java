package com.alexanderpolozhnov.careerpilot.user.response;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
    UUID id,
    String email,
    String name,
    String avatarUrl,
    String location,
    Instant createdAt
) {
}
