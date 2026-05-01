package com.alexanderpolozhnov.careerpilot.analytics.response;

import java.util.List;

public record AnalyticsSummaryResponse(
        int totalApplications,
        int activeApplications,
        double interviewRate,
        double offerRate,
        double responseRate,
        double avgTimeToInterview,
        List<ApplicationFunnelItem> funnel,
        List<WeeklyActivityItem> weeklyActivity,
        List<SkillGapItem> topSkillGaps
) {
    public record ApplicationFunnelItem(
            String status,
            int count,
            double percentage
    ) {
    }

    public record WeeklyActivityItem(
            String week,
            int applied,
            int interviews,
            int offers
    ) {
    }

    public record SkillGapItem(
            String skill,
            int frequency,
            boolean hasSkill
    ) {
    }
}
