package com.alexanderpolozhnov.careerpilot.notification.dto;

import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    UUID userId,
    NotificationType type,
    String title,
    String body,
    boolean read,
    Instant createdAt
) {
}
