package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationChannel;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.notification.provider.NotificationSender;
import com.alexanderpolozhnov.careerpilot.notification.provider.NotificationSenderFactory;
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
    private final NotificationSenderFactory notificationSenderFactory;

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

        // Check user preferences and send notification if enabled
        Optional<PreferencesEntity> preferencesOpt = preferencesRepository.findByUserId(user.getId());
        if (preferencesOpt.isPresent()) {
            PreferencesEntity preferences = preferencesOpt.get();

            boolean shouldSend = false;
            // Notifications are only sent for "active" reminders, not for "missed/overdue"
            // history
            // items if they are marked as read
            if (!read) {
                if (type == NotificationType.INTERVIEW_REMINDER && preferences.isInterviewReminders()) {
                    shouldSend = true;
                } else if (type == NotificationType.TASK_DUE && preferences.isTaskReminders()) {
                    shouldSend = true;
                } else if (type == NotificationType.APPLICATION_STATUS
                        && preferences.isApplicationStatusNotifications()) {
                    shouldSend = true;
                }
            }

            if (shouldSend) {
                try {
                    NotificationSender sender = notificationSenderFactory
                            .getSender(preferences.getNotificationProvider());
                    String toAddress;

                    if (preferences
                            .getNotificationProvider() == com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider.EMAIL) {
                        toAddress = user.getEmail();
                    } else if (preferences
                            .getNotificationProvider() == com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider.TELEGRAM) {
                        toAddress = preferences.getTelegramChatId();
                        if (toAddress == null) {
                            log.warn("Telegram chat ID not set for user {}, skipping notification", user.getId());
                            return;
                        }
                    } else {
                        log.warn("Unsupported notification provider for user {}", user.getId());
                        return;
                    }

                    sender.send(toAddress, title, message);
                    log.info("Sent {} notification to user {} for type {}", preferences.getNotificationProvider(),
                            user.getId(), type);
                } catch (Exception e) {
                    log.error("Failed to send notification to user {}", user.getId(), e);
                }
            }
        } else {
            log.warn("No preferences found for user {}, skipping notification", user.getId());
        }
    }
}
