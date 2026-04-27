package com.alexanderpolozhnov.careerpilot.vacancy.dto;

import com.alexanderpolozhnov.careerpilot.vacancy.entity.EmploymentType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record VacancyDto(
        UUID id,
        String title,
        String companyId,
        VacancyCompanyDto company,
        String url,
        String description,
        String location,
        RemoteType remote,
        Integer salaryMin,
        Integer salaryMax,
        String salaryCurrency,
        EmploymentType contractType,
        List<VacancyTagDto> tags,
        VacancyStatus status,
        Integer matchScore,
        String aiSummary,
        Instant createdAt,
        Instant updatedAt,
        Instant deadline
) {
}
