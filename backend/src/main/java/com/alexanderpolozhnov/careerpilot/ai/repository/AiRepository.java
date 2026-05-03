package com.alexanderpolozhnov.careerpilot.ai.repository;

import com.alexanderpolozhnov.careerpilot.ai.entity.AiEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AiRepository extends JpaRepository<AiEntity, UUID> {

    List<AiEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<AiEntity> findAllByUserIdAndTypeOrderByCreatedAtDesc(UUID userId, String type);

    Optional<AiEntity> findByIdAndUserId(UUID id, UUID userId);

    Optional<AiEntity> findTopByUserIdAndTypeAndInputHashOrderByCreatedAtDesc(UUID userId, String type,
                                                                              String inputHash);

    void deleteByExpiresAtBefore(Instant expiresAt);
}
