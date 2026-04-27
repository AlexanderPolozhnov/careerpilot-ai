package com.alexanderpolozhnov.careerpilot.vacancy.request;

import jakarta.validation.constraints.NotBlank;

public record VacancyRequest(@NotBlank String payload) {
}
