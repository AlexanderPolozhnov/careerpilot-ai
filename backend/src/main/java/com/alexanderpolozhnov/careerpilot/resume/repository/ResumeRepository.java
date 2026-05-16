package com.alexanderpolozhnov.careerpilot.resume.repository;

import com.alexanderpolozhnov.careerpilot.resume.entity.ResumeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeRepository extends JpaRepository<ResumeEntity, UUID> {
    List<ResumeEntity> findAllByUserId(UUID userId);
    Optional<ResumeEntity> findByIdAndUserId(UUID id, UUID userId);
    List<ResumeEntity> findByUserIdAndIsDefaultTrue(UUID userId);
}
