package com.alexanderpolozhnov.careerpilot.application.service;
import com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest;
import com.alexanderpolozhnov.careerpilot.application.request.UpdateApplicationStatusRequest;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardItemResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ApplicationService {
    ApplicationResponse create(ApplicationRequest request);

    List<ApplicationResponse> list(int page, int size, String sortBy, String direction, String q);

    Map<String, List<ApplicationBoardItemResponse>> board();

    ApplicationResponse getById(UUID id);

    ApplicationResponse update(UUID id, ApplicationRequest request);

    ApplicationResponse updateStatus(UUID id, UpdateApplicationStatusRequest request);

    void delete(UUID id);
}
