package com.alexanderpolozhnov.careerpilot.auth.repository;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthRepository extends JpaRepository<AuthEntity, UUID> {
    Optional<AuthEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<AuthEntity> findByResetPasswordToken(String token);
}
