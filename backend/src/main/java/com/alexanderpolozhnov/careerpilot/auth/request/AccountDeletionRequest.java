package com.alexanderpolozhnov.careerpilot.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AccountDeletionRequest(
    String password,
    @NotBlank @Size(max = 255) String confirmation
) {}
