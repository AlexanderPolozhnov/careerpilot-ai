package com.alexanderpolozhnov.careerpilot.interview.service;
import com.alexanderpolozhnov.careerpilot.interview.request.InterviewRequest;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;

import java.util.List;
import java.util.UUID;

public interface InterviewService {
    InterviewResponse create(InterviewRequest request);

    List<InterviewResponse> list(int page, int size, String sortBy, String direction, String q);

    InterviewResponse getById(UUID id);

    InterviewResponse update(UUID id, InterviewRequest request);

    void delete(UUID id);
}
