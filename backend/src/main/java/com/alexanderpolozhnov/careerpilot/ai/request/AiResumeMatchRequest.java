package com.alexanderpolozhnov.careerpilot.ai.request;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AiResumeMatchRequest(
    UUID vacancyId,
    @Size(max = 20_000)
    String vacancyText,
    @Size(max = 255)
    String resumeId,
    @Size(max = 20_000)
    String resumeText
) {
}
