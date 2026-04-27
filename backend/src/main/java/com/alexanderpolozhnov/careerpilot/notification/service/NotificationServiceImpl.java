package com.alexanderpolozhnov.careerpilot.notification.service;
import com.alexanderpolozhnov.careerpilot.notification.request.NotificationRequest;
import com.alexanderpolozhnov.careerpilot.notification.response.NotificationResponse;
import org.springframework.stereotype.Service;
@Service public class NotificationServiceImpl implements NotificationService { public NotificationResponse create(NotificationRequest request){ return new NotificationResponse(null); } }
