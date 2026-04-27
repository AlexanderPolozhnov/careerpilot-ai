package com.alexanderpolozhnov.careerpilot.notification.service;
import com.alexanderpolozhnov.careerpilot.notification.request.NotificationRequest;
import com.alexanderpolozhnov.careerpilot.notification.response.NotificationResponse;
public interface NotificationService { NotificationResponse create(NotificationRequest request); }
