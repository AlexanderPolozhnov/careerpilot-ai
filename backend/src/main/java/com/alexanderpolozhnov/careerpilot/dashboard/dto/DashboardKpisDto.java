package com.alexanderpolozhnov.careerpilot.dashboard.dto;

public record DashboardKpisDto(
    long activeVacancies,
    long activeApplications,
    long interviewsScheduled,
    long aiInsightsThisWeek
) {
}
