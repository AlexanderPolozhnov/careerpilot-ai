package com.alexanderpolozhnov.careerpilot.preferences.response;

public record PreferencesResponse(
    boolean weeklyDigest,
    boolean interviewReminders,
    String aiProviderMode,
    String language
) {
}
