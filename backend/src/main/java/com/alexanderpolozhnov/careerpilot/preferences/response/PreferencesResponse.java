package com.alexanderpolozhnov.careerpilot.preferences.response;

public record PreferencesResponse(
        boolean weeklyDigest,
        boolean interviewReminders,
        boolean taskReminders,
        String aiProviderMode,
        String language) {
}
