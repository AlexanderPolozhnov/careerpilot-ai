package com.alexanderpolozhnov.careerpilot.analytics.service;
import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsSummaryResponse;

public interface AnalyticsService {
    AnalyticsResponse create(AnalyticsRequest request);

    AnalyticsSummaryResponse summary();
}
