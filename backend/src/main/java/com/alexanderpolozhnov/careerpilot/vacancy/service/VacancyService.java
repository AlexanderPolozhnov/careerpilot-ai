package com.alexanderpolozhnov.careerpilot.vacancy.service;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.CreateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.UpdateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyDto;

import java.util.UUID;

public interface VacancyService {
    VacancyDto create(CreateVacancyDto request);

    PagedResponse<VacancyDto> list(
            int page,
            int size,
            String sort,
            String direction,
            String search,
            String status,
            String remote,
            String companyId,
            String tag
    );

    VacancyDto getById(UUID id);

    VacancyDto update(UUID id, UpdateVacancyDto request);

    void delete(UUID id);
}
