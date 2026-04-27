package com.alexanderpolozhnov.careerpilot.vacancy.dto;

import java.util.UUID;

public record VacancyCompanyDto(
        UUID id,
        String name
) {
}
