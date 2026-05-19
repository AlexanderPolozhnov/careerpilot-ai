package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.RefreshTokenEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.UserRole;
import com.alexanderpolozhnov.careerpilot.auth.exception.AuthException;
import com.alexanderpolozhnov.careerpilot.auth.exception.DuplicateEmailException;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.auth.request.ForgotPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ResetPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthUserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public AuthResult login(LoginRequest request) {
        AuthEntity user = authRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return buildAuthResult(user);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        authRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordExpiresAt(OffsetDateTime.now().plusHours(24));
            authRepository.save(user);

            log.info("Password reset requested for email: {}. Reset token: {}", email, token);
            // In a real application, send email here
        });

        // If user not found, we still return success to prevent email enumeration
        if (!authRepository.existsByEmail(email)) {
            log.info("Password reset requested for non-existent email: {}", email);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        AuthEntity user = authRepository.findByResetPasswordToken(request.token())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));

        if (user.getResetPasswordExpiresAt() == null || user.getResetPasswordExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new InvalidCredentialsException("Invalid or expired reset token");
        }

        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        authRepository.save(user);

        log.info("Password successfully reset for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public AuthResult register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (authRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateEmailException("User with this email already exists");
        }

        AuthEntity user = new AuthEntity();
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        String name = request.name().trim();
        user.setFullName(name);
        applyNameParts(user, name);
        user.setRole(UserRole.USER);
        AuthEntity savedUser = authRepository.save(user);

        return buildAuthResult(savedUser);
    }

    @Override
    public AuthUserResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            throw new InvalidCredentialsException("Unauthorized");
        }
        String email = authentication.getName();
        AuthEntity user = authRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return toUserResponse(user);
    }

    @Override
    @Transactional
    public AuthResult refresh(String token) {
        RefreshTokenEntity refreshTokenEntity = refreshTokenService.findByToken(token)
                .map(refreshTokenService::verifyExpiration)
                .orElseThrow(() -> new AuthException("Refresh token is not in database!"));

        AuthEntity user = refreshTokenEntity.getUser();
        refreshTokenService.deleteByUserId(user.getId());
        return buildAuthResult(user);
    }

    @Override
    @Transactional
    public void logout(String token) {
        if (token != null && !token.isBlank()) {
            refreshTokenService.findByToken(token)
                    .ifPresent(rt -> refreshTokenService.deleteByUserId(rt.getUser().getId()));
        }
    }

    private AuthResult buildAuthResult(AuthEntity user) {
        String accessToken = jwtService.generateToken(user.getEmail());
        RefreshTokenEntity refreshToken = refreshTokenService.createRefreshToken(user.getId());
        AuthResponse response = new AuthResponse(accessToken, toUserResponse(user));
        return new AuthResult(response, refreshToken.getToken());
    }

    private AuthUserResponse toUserResponse(AuthEntity user) {
        return new AuthUserResponse(
                user.getId(),
                user.getEmail(),
                resolveDisplayName(user),
                null,
                user.getCreatedAt()
        );
    }

    private void applyNameParts(AuthEntity user, String name) {
        String[] parts = name.split("\\s+", 2);
        user.setFirstName(parts[0]);
        user.setLastName(parts.length > 1 ? parts[1] : null);
    }

    private String resolveDisplayName(AuthEntity user) {
        if (user.getFirstName() != null && !user.getFirstName().isBlank()) {
            if (user.getLastName() != null && !user.getLastName().isBlank()) {
                return user.getFirstName().trim() + " " + user.getLastName().trim();
            }
            return user.getFirstName().trim();
        }
        return user.getFullName();
    }
}
