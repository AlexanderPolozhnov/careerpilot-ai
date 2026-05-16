package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.RefreshTokenEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.AuthException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    @Value("${security.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthRepository authRepository;

    @Transactional
    public RefreshTokenEntity createRefreshToken(UUID userId) {
        AuthEntity user = authRepository.findById(userId)
                .orElseThrow(() -> new AuthException("User not found"));

        RefreshTokenEntity refreshToken = new RefreshTokenEntity();
        refreshToken.setUser(user);
        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiresAt(OffsetDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000L));

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshTokenEntity verifyExpiration(RefreshTokenEntity token) {
        if (token.getExpiresAt().isBefore(OffsetDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new AuthException("Refresh token was expired. Please make a new signin request");
        }
        return token;
    }

    public Optional<RefreshTokenEntity> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public void deleteByUserId(UUID userId) {
        refreshTokenRepository.deleteByUser_Id(userId);
    }
}
