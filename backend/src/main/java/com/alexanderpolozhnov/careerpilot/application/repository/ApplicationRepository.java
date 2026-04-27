package com.alexanderpolozhnov.careerpilot.application.repository;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<ApplicationEntity, UUID> {
    List<ApplicationEntity> findAllByUserId(UUID userId);
    List<ApplicationEntity> findAllByUserIdAndStatus(UUID userId, ApplicationStatus status);
    Optional<ApplicationEntity> findByUserIdAndVacancyId(UUID userId, UUID vacancyId);
    List<ApplicationEntity> findAllByNextFollowUpAtBeforeAndStatusNot(Instant time, ApplicationStatus status);
}
