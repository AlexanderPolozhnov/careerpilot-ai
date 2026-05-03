package com.alexanderpolozhnov.careerpilot.user.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @NotBlank @Size(min = 2, max = 255) String name,
    @NotBlank @Email String email,
    String location
) {
}
