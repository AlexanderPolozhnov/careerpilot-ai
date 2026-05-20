package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationChannel;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.notification.repository.NotificationRepository;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationCreator {

    private final NotificationRepository notificationRepository;
    private final PreferencesRepository preferencesRepository;
    private final EmailService emailService;

    @Transactional
    public void createNotification(AuthEntity user, NotificationType type, String title, String message) {
        // Create and save notification entity
        NotificationEntity notification = new NotificationEntity();
        notification.setUser(user);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setStatus(com.alexanderpolozhnov.careerpilot.notification.entity.NotificationStatus.PENDING);
        notification.setRead(false);
        
        notificationRepository.save(notification);
        log.info("Created notification for user {}: type={}, title={}", user.getId(), type, title);

        // Check user preferences and send email if enabled
        Optional<PreferencesEntity> preferencesOpt = preferencesRepository.findByUserId(user.getId());
        if (preferencesOpt.isPresent()) {
            PreferencesEntity preferences = preferencesOpt.get();
            
            boolean shouldSendEmail = false;
            if (type == NotificationType.INTERVIEW_REMINDER && preferences.isInterviewReminders()) {
                shouldSendEmail = true;
            } else if (type == NotificationType.TASK_DUE && preferences.isTaskReminders()) {
                shouldSendEmail = true;
            }

            if (shouldSendEmail) {
                try {
                    emailService.sendReminderEmail(user.getEmail(), title, message);
                    log.info("Sent reminder email to user {} for type {}", user.getId(), type);
                } catch (Exception e) {
                    log.error("Failed to send reminder email to user {}", user.getId(), e);
                }
            }
        } else {
            log.warn("No preferences found for user {}, skipping email notification", user.getId());
        }
    }
}
