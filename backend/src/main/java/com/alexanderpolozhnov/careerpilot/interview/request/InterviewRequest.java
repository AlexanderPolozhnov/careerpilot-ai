package com.alexanderpolozhnov.careerpilot.interview.request;

import jakarta.validation.constraints.NotBlank;

public record InterviewRequest(@NotBlank String payload) {
}
