package com.alexanderpolozhnov.careerpilot.vacancy.service;
import com.alexanderpolozhnov.careerpilot.vacancy.request.VacancyRequest;
import com.alexanderpolozhnov.careerpilot.vacancy.response.VacancyResponse;

import java.util.List;
import java.util.UUID;

public interface VacancyService {
    VacancyResponse create(VacancyRequest request);

    List<VacancyResponse> list(int page, int size, String sortBy, String direction, String q);

    VacancyResponse getById(UUID id);

    VacancyResponse update(UUID id, VacancyRequest request);

    void delete(UUID id);
}
