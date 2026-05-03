package com.alexanderpolozhnov.careerpilot.dashboard.dto;

import java.util.List;

public record DashboardSummaryDto(
    DashboardKpisDto kpis,
    List<DashboardInterviewDto> upcomingInterviews,
    List<DashboardTaskDto> tasks,
    List<DashboardAiInsightDto> aiInsights,
    List<DashboardNotificationDto> notifications
) {
}
