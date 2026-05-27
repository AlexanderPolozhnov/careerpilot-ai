package com.alexanderpolozhnov.careerpilot.preferences.response;

public record PreferencesResponse(
        boolean weeklyDigest,
        boolean interviewReminders,
        boolean taskReminders,
        boolean applicationStatusNotifications,
        String aiProviderMode,
        String language,
        String openAiApiKey,
        String openAiModel,
        String ollamaUrl,
        String ollamaModel,
        String customAiProvider,
        String geminiApiKey,
        String geminiModel,
        String notificationProvider,
        boolean telegramConnected,
        boolean googleCalendarConnected) {
}
