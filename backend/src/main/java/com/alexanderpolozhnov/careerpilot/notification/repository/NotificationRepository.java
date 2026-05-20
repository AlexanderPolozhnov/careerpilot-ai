package com.alexanderpolozhnov.careerpilot.notification.repository;

import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<NotificationEntity, UUID> {

    List<NotificationEntity> findAllByUserId(UUID userId);

    Page<NotificationEntity> findAllByUserId(UUID userId, Pageable pageable);

    Page<NotificationEntity> findAllByUserIdAndRead(UUID userId, boolean read, Pageable pageable);

    long countByUserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.read = true WHERE n.referenceId = :refId AND n.referenceType = :refType AND n.read = false")
    void markAsReadByReference(@Param("refId") UUID refId, @Param("refType") String refType);
}
