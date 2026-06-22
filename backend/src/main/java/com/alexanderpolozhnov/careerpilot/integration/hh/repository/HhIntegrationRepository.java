package com.alexanderpolozhnov.careerpilot.integration.hh.repository;

import com.alexanderpolozhnov.careerpilot.integration.hh.entity.HhIntegrationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HhIntegrationRepository extends JpaRepository<HhIntegrationEntity, UUID> {

    Optional<HhIntegrationEntity> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
