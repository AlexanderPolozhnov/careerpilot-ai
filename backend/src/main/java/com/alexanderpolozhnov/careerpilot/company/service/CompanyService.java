package com.alexanderpolozhnov.careerpilot.company.service;
import com.alexanderpolozhnov.careerpilot.company.request.CompanyRequest;
import com.alexanderpolozhnov.careerpilot.company.response.CompanyResponse;

import java.util.List;
import java.util.UUID;

public interface CompanyService {
    CompanyResponse create(CompanyRequest request);

    List<CompanyResponse> list(int page, int size, String sortBy, String direction, String q);

    CompanyResponse getById(UUID id);

    CompanyResponse update(UUID id, CompanyRequest request);

    void delete(UUID id);
}
