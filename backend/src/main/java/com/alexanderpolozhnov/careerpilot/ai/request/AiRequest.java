package com.alexanderpolozhnov.careerpilot.ai.request;

import jakarta.validation.constraints.NotBlank;

public record AiRequest(@NotBlank String prompt) {
}
