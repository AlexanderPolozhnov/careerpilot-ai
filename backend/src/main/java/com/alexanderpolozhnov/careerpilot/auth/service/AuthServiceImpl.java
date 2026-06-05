package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.RefreshTokenEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.UserRole;
import com.alexanderpolozhnov.careerpilot.auth.exception.AuthException;
import com.alexanderpolozhnov.careerpilot.auth.exception.DuplicateEmailException;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.auth.request.AccountDeletionRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ForgotPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ResetPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.UpdatePasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthUserResponse;
import com.alexanderpolozhnov.careerpilot.auth.request.TelegramWebAppAuthRequest;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.notification.service.EmailService;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final CurrentUserResolver currentUserResolver;
    private final EmailService emailService;
    private final PreferencesRepository preferencesRepository;
    private final ObjectMapper objectMapper;

    @Value("${telegram.bot.token}")
    private String telegramBotToken;

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
    public AuthResult telegramWebAppAuth(TelegramWebAppAuthRequest request) {
        String initData = request.getInitData();
        
        try {
            Map<String, String> dataMap = Arrays.stream(initData.split("&"))
                .map(pair -> {
                    int idx = pair.indexOf("=");
                    String key = pair.substring(0, idx);
                    String value = URLDecoder.decode(pair.substring(idx + 1), StandardCharsets.UTF_8);
                    return Map.entry(key, value);
                })
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            String hash = dataMap.remove("hash");
            if (hash == null) {
                throw new InvalidCredentialsException("Invalid initData: no hash found");
            }
            
            // Telegram recently added 'signature' to the initData payload for WebApps.
            // According to Telegram docs, we must exclude it (along with hash) from dataCheckString.
            dataMap.remove("signature");

            String dataCheckString = dataMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("\n"));

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec("WebAppData".getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] secretKey = mac.doFinal(telegramBotToken.getBytes(StandardCharsets.UTF_8));

            mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec hashKeySpec = new SecretKeySpec(secretKey, "HmacSHA256");
            mac.init(hashKeySpec);
            byte[] calculatedHashBytes = mac.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8));

            StringBuilder calculatedHashHex = new StringBuilder();
            for (byte b : calculatedHashBytes) {
                calculatedHashHex.append(String.format("%02x", b));
            }

            if (!calculatedHashHex.toString().equalsIgnoreCase(hash)) {
                throw new InvalidCredentialsException("Invalid initData: hash mismatch");
            }

            long authDate = Long.parseLong(dataMap.get("auth_date"));
            long now = System.currentTimeMillis() / 1000;
            if (now - authDate > 300) {
                throw new InvalidCredentialsException("Invalid initData: expired");
            }

            String userJson = dataMap.get("user");
            JsonNode userNode = objectMapper.readTree(userJson);
            String telegramUserId = userNode.get("id").asText();

            PreferencesEntity preferences = preferencesRepository.findByTelegramChatId(telegramUserId)
                .orElseThrow(() -> new AuthException("Telegram аккаунт не привязан. Пожалуйста, привяжите его в настройках веб-версии."));

            AuthEntity user = authRepository.findById(preferences.getUserId())
                .orElseThrow(() -> new AuthException("User not found"));

            return buildAuthResult(user);

        } catch (AuthException | InvalidCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error validating Telegram WebApp initData", e);
            throw new InvalidCredentialsException("Invalid initData format: " + e.getMessage());
        }
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

            emailService.sendPasswordResetEmail(email, token);
        });

        // If user not found, we still return success to prevent email enumeration
        if (!authRepository.existsByEmail(email)) {
            log.warn("PASSWORD RESET FAILED: Email '{}' not found in database. No email sent.", email);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        AuthEntity user = authRepository.findByResetPasswordToken(request.token())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid or expired reset token"));

        if (user.getResetPasswordExpiresAt() == null
                || user.getResetPasswordExpiresAt().isBefore(OffsetDateTime.now())) {
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
        if (authentication == null || authentication.getName() == null
                || "anonymousUser".equals(authentication.getName())) {
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

    @Override
    @Transactional
    public void updatePassword(UpdatePasswordRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();

        if (user.getPasswordHash() != null) {
            if (request.currentPassword() == null || request.currentPassword().isBlank()) {
                throw new AuthException("Текущий пароль обязателен");
            }
            if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
                throw new AuthException("Неверный текущий пароль");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        authRepository.save(user);

        log.info("Password updated for user: {}", user.getEmail());
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
                user.getCreatedAt(),
                user.getPasswordHash() != null);
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

    @Override
    @Transactional
    public void deleteAccount(AccountDeletionRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();

        // Verify password if user has one (local auth)
        if (user.getPasswordHash() != null) {
            if (request.password() == null || request.password().isBlank()) {
                throw new AuthException("Пароль обязателен для удаления аккаунта");
            }
            if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                throw new InvalidCredentialsException("Неверный пароль");
            }
        }

        // Verify confirmation matches user email (case-insensitive)
        String confirmation = request.confirmation().trim().toLowerCase();
        String userEmail = user.getEmail().toLowerCase();
        if (!confirmation.equals(userEmail)) {
            throw new AuthException("Email подтверждения не совпадает с email аккаунта");
        }

        // Delete user (CASCADE will delete all related data)
        authRepository.delete(user);

        log.info("Account deleted for user: {}", user.getEmail());
    }
}
