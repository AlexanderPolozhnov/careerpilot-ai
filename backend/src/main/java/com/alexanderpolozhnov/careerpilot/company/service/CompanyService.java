package com.alexanderpolozhnov.careerpilot.company.service;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.company.request.CompanyRequest;
import com.alexanderpolozhnov.careerpilot.company.response.CompanyResponse;

import java.util.UUID;

public interface CompanyService {
    CompanyResponse create(CompanyRequest request);

    PagedResponse<CompanyResponse> list(int page, int size, String sortBy, String direction, String search);

    CompanyResponse getById(UUID id);

    CompanyResponse update(UUID id, CompanyRequest request);

    void delete(UUID id);
}
