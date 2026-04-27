package com.alexanderpolozhnov.careerpilot.application.request;

import jakarta.validation.constraints.NotBlank;

public record ApplicationRequest(@NotBlank String payload) {
}
