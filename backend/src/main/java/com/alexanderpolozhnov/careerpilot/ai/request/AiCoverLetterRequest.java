package com.alexanderpolozhnov.careerpilot.ai.request;

import java.util.UUID;

public record AiCoverLetterRequest(
    UUID vacancyId,
    String vacancyText,
    String resumeId,
    String resumeText,
    String tone,
    String additionalContext
) {
}
