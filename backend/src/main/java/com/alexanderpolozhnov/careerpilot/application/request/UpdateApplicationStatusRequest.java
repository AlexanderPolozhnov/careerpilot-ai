package com.alexanderpolozhnov.careerpilot.application.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateApplicationStatusRequest(@NotBlank String status) {
}
