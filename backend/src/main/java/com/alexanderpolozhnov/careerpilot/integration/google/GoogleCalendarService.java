package com.alexanderpolozhnov.careerpilot.integration.google;

import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;

import java.util.UUID;

public interface GoogleCalendarService {
    String getAuthUrl(UUID userId);

    void handleCallback(String code, String state);

    void disconnect();

    String createEvent(InterviewEntity interview);
}
