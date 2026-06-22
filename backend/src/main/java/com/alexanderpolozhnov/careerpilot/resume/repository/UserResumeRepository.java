package com.alexanderpolozhnov.careerpilot.resume.repository;

import com.alexanderpolozhnov.careerpilot.resume.entity.UserResumeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserResumeRepository extends JpaRepository<UserResumeEntity, UUID> {
    Optional<UserResumeEntity> findByUserId(UUID userId);
}
