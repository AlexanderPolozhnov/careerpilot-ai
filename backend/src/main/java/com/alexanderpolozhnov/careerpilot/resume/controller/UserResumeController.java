package com.alexanderpolozhnov.careerpilot.resume.controller;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.resume.request.UserResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.UserResumeResponse;
import com.alexanderpolozhnov.careerpilot.resume.service.UserResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resumes/mine")
@Validated
@RequiredArgsConstructor
public class UserResumeController {

    private final UserResumeService userResumeService;

    @GetMapping
    public UserResumeResponse getMyResume() {
        return userResumeService.getMyResume();
    }

    @PutMapping
    @Auditable(action = "USER_RESUME_UPDATE", entityType = "USER_RESUME")
    public UserResumeResponse updateMyResume(@Valid @RequestBody UserResumeRequest request) {
        return userResumeService.updateMyResume(request);
    }
}
