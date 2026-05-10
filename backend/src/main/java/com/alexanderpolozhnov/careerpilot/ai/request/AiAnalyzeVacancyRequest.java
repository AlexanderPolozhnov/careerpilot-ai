package com.alexanderpolozhnov.careerpilot.ai.request;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AiAnalyzeVacancyRequest(
    UUID vacancyId,
    @Size(max = 20_000)
    String vacancyText
) {
}
