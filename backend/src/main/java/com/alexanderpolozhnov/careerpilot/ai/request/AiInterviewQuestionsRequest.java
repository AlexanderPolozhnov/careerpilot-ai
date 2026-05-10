package com.alexanderpolozhnov.careerpilot.ai.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AiInterviewQuestionsRequest(
    UUID vacancyId,
    @Size(max = 20_000)
    String vacancyText,
    @Size(max = 255)
    String focusArea,
    @Min(3)
    @Max(15)
    Integer count
) {
}
