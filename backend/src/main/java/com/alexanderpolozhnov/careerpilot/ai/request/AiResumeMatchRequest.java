package com.alexanderpolozhnov.careerpilot.ai.request;

import java.util.UUID;

public record AiResumeMatchRequest(
    UUID vacancyId,
    String vacancyText,
    String resumeId,
    String resumeText
) {
}
