package com.alexanderpolozhnov.careerpilot.notification.repository;

import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {

    List<NotificationEntity> findAllByUserId(UUID userId);

    Page<NotificationEntity> findAllByUserId(UUID userId, Pageable pageable);

    Page<NotificationEntity> findAllByUserIdAndRead(UUID userId, boolean read, Pageable pageable);
}
