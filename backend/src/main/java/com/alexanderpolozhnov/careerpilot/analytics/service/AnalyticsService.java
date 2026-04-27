package com.alexanderpolozhnov.careerpilot.analytics.service;
import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
public interface AnalyticsService { AnalyticsResponse create(AnalyticsRequest request); }
