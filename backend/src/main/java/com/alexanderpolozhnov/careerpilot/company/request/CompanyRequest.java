package com.alexanderpolozhnov.careerpilot.company.request;

import jakarta.validation.constraints.NotBlank;

public record CompanyRequest(@NotBlank String payload) {
}
