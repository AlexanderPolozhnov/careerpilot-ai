package com.alexanderpolozhnov.careerpilot.notification.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);

    void sendReminderEmail(String to, String title, String message);
}
