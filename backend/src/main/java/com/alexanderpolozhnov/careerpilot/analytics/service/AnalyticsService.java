package com.alexanderpolozhnov.careerpilot.analytics.service;

import com.alexanderpolozhnov.careerpilot.analytics.response.ActivityHeatmapItem;
import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsSummaryResponse;
import com.alexanderpolozhnov.careerpilot.analytics.response.CompanyAnalyticsItem;

import java.util.List;

public interface AnalyticsService {
    AnalyticsResponse create(AnalyticsRequest request);

    AnalyticsSummaryResponse summary();

    List<CompanyAnalyticsItem> getCompanyAnalytics();

    List<ActivityHeatmapItem> getActivityHeatmap();
}
