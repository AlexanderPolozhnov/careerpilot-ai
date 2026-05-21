package com.alexanderpolozhnov.careerpilot.application.repository;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatusHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationStatusHistoryRepository extends JpaRepository<ApplicationStatusHistoryEntity, UUID> {

    List<ApplicationStatusHistoryEntity> findAllByApplicationIdOrderByCreatedAtDesc(UUID applicationId);
}
