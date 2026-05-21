package com.alexanderpolozhnov.careerpilot.preferences.response;

public record PreferencesResponse(
                boolean weeklyDigest,
                boolean interviewReminders,
                boolean taskReminders,
                boolean applicationStatusNotifications,
                String aiProviderMode,
                String language) {
}
