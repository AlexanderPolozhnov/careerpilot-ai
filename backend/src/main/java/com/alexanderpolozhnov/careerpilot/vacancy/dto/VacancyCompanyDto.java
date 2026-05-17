package com.alexanderpolozhnov.careerpilot.vacancy.dto;

import com.alexanderpolozhnov.careerpilot.company.entity.CompanySize;
import java.util.UUID;

public record VacancyCompanyDto(
        UUID id,
        String name,
        String industry,
        CompanySize size,
        String website,
        String logoUrl,
        String description,
        String location
) {
}
