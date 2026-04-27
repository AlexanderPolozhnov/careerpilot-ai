package com.alexanderpolozhnov.careerpilot.vacancy.dto;

import com.alexanderpolozhnov.careerpilot.vacancy.entity.EmploymentType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.Instant;
import java.util.List;

public record CreateVacancyDto(
        @NotBlank String title,
        String companyId,
        String url,
        String description,
        String location,
        RemoteType remote,
        @PositiveOrZero Integer salaryMin,
        @PositiveOrZero Integer salaryMax,
        String salaryCurrency,
        EmploymentType contractType,
        List<String> tagIds,
        Instant deadline
) {
}
