package com.alexanderpolozhnov.careerpilot.analytics.service;
import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
import org.springframework.stereotype.Service;
@Service public class AnalyticsServiceImpl implements AnalyticsService { public AnalyticsResponse create(AnalyticsRequest request){ return new AnalyticsResponse(null); } }
