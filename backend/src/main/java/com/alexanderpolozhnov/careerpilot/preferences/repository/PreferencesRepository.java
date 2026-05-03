package com.alexanderpolozhnov.careerpilot.preferences.repository;

import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PreferencesRepository extends JpaRepository<PreferencesEntity, UUID> {
    Optional<PreferencesEntity> findByUserId(UUID userId);
}
