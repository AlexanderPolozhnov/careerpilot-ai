package com.alexanderpolozhnov.careerpilot.monitoring.service;

import com.alexanderpolozhnov.careerpilot.monitoring.request.VacancyFilterRequest;
import com.alexanderpolozhnov.careerpilot.monitoring.response.VacancyFilterResponse;

import java.util.List;
import java.util.UUID;

public interface VacancyFilterService {
    List<VacancyFilterResponse> getFilters();
    VacancyFilterResponse createFilter(VacancyFilterRequest request);
    VacancyFilterResponse updateFilter(UUID id, VacancyFilterRequest request);
    void deleteFilter(UUID id);
}
