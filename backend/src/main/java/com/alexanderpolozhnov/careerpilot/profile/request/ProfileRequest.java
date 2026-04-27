package com.alexanderpolozhnov.careerpilot.profile.request;

import jakarta.validation.constraints.NotBlank;

public record ProfileRequest(@NotBlank String payload) {
}
