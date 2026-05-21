package com.alexanderpolozhnov.careerpilot.ai.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record AiResumeGenerationRequest(
        UUID vacancyId,

        @Size(max = 65536) String vacancyText,

        UUID resumeId,

        @Size(min = 80, max = 65536) String resumeText,

        @Size(max = 2048) String additionalContext) {
}
