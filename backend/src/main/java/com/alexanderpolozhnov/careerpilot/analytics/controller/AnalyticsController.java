package com.alexanderpolozhnov.careerpilot.analytics.controller;

import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
import com.alexanderpolozhnov.careerpilot.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService service;

    @PostMapping
    public AnalyticsResponse create(@Valid @RequestBody AnalyticsRequest request) {
        return service.create(request);
    }
}
