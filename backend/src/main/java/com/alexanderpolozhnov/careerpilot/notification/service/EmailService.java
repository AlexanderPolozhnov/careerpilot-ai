package com.alexanderpolozhnov.careerpilot.notification.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String token);
}
