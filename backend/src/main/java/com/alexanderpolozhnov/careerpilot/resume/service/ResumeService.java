package com.alexanderpolozhnov.careerpilot.resume.service;

import com.alexanderpolozhnov.careerpilot.resume.request.ResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;

import java.util.List;
import java.util.UUID;

public interface ResumeService {
    List<ResumeResponse> list();
    ResumeResponse create(ResumeRequest request);
    ResumeResponse getById(UUID id);
    ResumeResponse update(UUID id, ResumeRequest request);
    ResumeResponse setAsDefault(UUID id);
    void delete(UUID id);
}
