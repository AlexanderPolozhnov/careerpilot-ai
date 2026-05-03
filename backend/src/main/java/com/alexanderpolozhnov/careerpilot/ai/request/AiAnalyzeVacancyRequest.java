package com.alexanderpolozhnov.careerpilot.ai.request;

import java.util.UUID;

public record AiAnalyzeVacancyRequest(
    UUID vacancyId,
    String vacancyText
) {
}
