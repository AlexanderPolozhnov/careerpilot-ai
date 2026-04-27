package com.alexanderpolozhnov.careerpilot.notification.repository;

import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {
    List<NotificationEntity> findAllByUserId(UUID userId);
    List<NotificationEntity> findAllByStatus(NotificationStatus status);
}
