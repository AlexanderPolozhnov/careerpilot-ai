package com.alexanderpolozhnov.careerpilot.analytics.response;

import java.util.UUID;

public record CompanyAnalyticsItem(
    UUID companyId,
    String companyName,
    String logoUrl,
    int applicationCount,
    int interviewCount,
    int offerCount,
    double responseRate,
    double avgTimeToInterview
) {}
