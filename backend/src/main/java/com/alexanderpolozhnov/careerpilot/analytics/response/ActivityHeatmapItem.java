package com.alexanderpolozhnov.careerpilot.analytics.response;

public record ActivityHeatmapItem(
        String date, // YYYY-MM-DD
        int count
) {}
