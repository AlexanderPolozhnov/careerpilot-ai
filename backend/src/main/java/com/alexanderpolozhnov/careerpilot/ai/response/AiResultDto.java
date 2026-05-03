package com.alexanderpolozhnov.careerpilot.ai.response;

import java.time.Instant;
import java.util.UUID;

public record AiResultDto(
    UUID id,
    UUID userId,
    String type,
    String prompt,
    String result,
    UUID vacancyId,
    Instant createdAt,
    Integer tokensUsed
) {
}
