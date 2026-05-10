package com.alexanderpolozhnov.careerpilot.ai.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AiCoverLetterRequest(
    UUID vacancyId,
    @Size(max = 20_000)
    String vacancyText,
    @Size(max = 255)
    String resumeId,
    @Size(max = 20_000)
    String resumeText,
    @Pattern(regexp = "PROFESSIONAL|FRIENDLY|ENTHUSIASTIC")
    String tone,
    @Size(max = 5_000)
    String additionalContext
) {
}
