package com.alexanderpolozhnov.careerpilot.auth.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePasswordRequest(
    String currentPassword,
    @NotBlank @Size(min = 6, max = 100) String newPassword
) {}
