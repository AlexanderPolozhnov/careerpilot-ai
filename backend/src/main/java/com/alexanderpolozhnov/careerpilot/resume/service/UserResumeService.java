package com.alexanderpolozhnov.careerpilot.resume.service;

import com.alexanderpolozhnov.careerpilot.resume.request.UserResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.UserResumeResponse;

public interface UserResumeService {
    UserResumeResponse getMyResume();
    UserResumeResponse updateMyResume(UserResumeRequest request);
}
