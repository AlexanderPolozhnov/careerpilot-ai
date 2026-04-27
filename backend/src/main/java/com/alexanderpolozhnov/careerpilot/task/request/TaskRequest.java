package com.alexanderpolozhnov.careerpilot.task.request;

import jakarta.validation.constraints.NotBlank;

public record TaskRequest(@NotBlank String payload) {
}
