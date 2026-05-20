package com.alexanderpolozhnov.careerpilot.vacancy.dto;

import com.alexanderpolozhnov.careerpilot.vacancy.entity.EmploymentType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record UpdateVacancyDto(
                @Size(max = 255) String title,
                @Size(max = 36) String companyId,
                @Size(max = 2048) String url,
                @Size(max = 20_000) String description,
                @Size(max = 255) String location,
                RemoteType remote,
                @PositiveOrZero Integer salaryMin,
                @PositiveOrZero Integer salaryMax,
                @Size(max = 10) String salaryCurrency,
                EmploymentType contractType,
                List<String> tagIds,
                LocalDate deadline,
                VacancyStatus status) {
}
