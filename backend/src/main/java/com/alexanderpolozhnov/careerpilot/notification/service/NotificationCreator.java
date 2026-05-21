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
        createNotification(user, type, title, message, null, null, false);
    }

    @Transactional
    public void createNotification(AuthEntity user, NotificationType type, String title, String message,
            UUID referenceId, String referenceType, boolean read) {
        // Create and save notification entity
        NotificationEntity notification = new NotificationEntity();
        notification.setUser(user);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setStatus(com.alexanderpolozhnov.careerpilot.notification.entity.NotificationStatus.PENDING);
        notification.setRead(read);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);

        notificationRepository.save(notification);
        log.info("Created notification for user {}: type={}, title={}, reference={}:{}",
                user.getId(), type, title, referenceType, referenceId);

        // Check user preferences and send email if enabled
        Optional<PreferencesEntity> preferencesOpt = preferencesRepository.findByUserId(user.getId());
        if (preferencesOpt.isPresent()) {
            PreferencesEntity preferences = preferencesOpt.get();

            boolean shouldSendEmail = false;
            // Emails are only sent for "active" reminders, not for "missed/overdue" history
            // items if they are marked as read
            if (!read) {
                if (type == NotificationType.INTERVIEW_REMINDER && preferences.isInterviewReminders()) {
                    shouldSendEmail = true;
                } else if (type == NotificationType.TASK_DUE && preferences.isTaskReminders()) {
                    shouldSendEmail = true;
                } else if (type == NotificationType.APPLICATION_STATUS
                        && preferences.isApplicationStatusNotifications()) {
                    shouldSendEmail = true;
                }
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
