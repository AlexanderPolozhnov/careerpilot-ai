package com.alexanderpolozhnov.careerpilot.profile.repository;

import com.alexanderpolozhnov.careerpilot.profile.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<UserProfileEntity, UUID> {
    Optional<UserProfileEntity> findByUserId(UUID userId);
}
