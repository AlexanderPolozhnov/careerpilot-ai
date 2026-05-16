package com.alexanderpolozhnov.careerpilot.auth.repository;

import com.alexanderpolozhnov.careerpilot.auth.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, UUID> {
    Optional<RefreshTokenEntity> findByToken(String token);
    void deleteByUser_Id(UUID userId);
}
