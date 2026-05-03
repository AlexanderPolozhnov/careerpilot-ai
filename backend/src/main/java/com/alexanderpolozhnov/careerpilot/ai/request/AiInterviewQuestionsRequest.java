package com.alexanderpolozhnov.careerpilot.ai.request;

import java.util.UUID;

public record AiInterviewQuestionsRequest(
    UUID vacancyId,
    String vacancyText,
    String focusArea,
    Integer count
) {
}
