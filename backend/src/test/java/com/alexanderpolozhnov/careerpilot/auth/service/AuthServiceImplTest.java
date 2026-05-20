package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.RefreshTokenEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.DuplicateEmailException;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.auth.request.AccountDeletionRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ForgotPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ResetPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.UpdatePasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.exception.AuthException;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.notification.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthRepository authRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RefreshTokenService refreshTokenService;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @Mock
    private EmailService emailService;
    @InjectMocks
    private AuthServiceImpl authService;

    private AuthEntity user;
    private RefreshTokenEntity refreshTokenEntity;

    @BeforeEach
    void setUp() {
        user = new AuthEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");
        user.setFullName("Alex User");
        user.setFirstName("Alex");
        user.setLastName("User");
        user.setCreatedAt(Instant.parse("2026-04-27T10:00:00Z"));
        user.setPasswordHash("hashed-password");

        refreshTokenEntity = new RefreshTokenEntity();
        refreshTokenEntity.setToken("refresh-token");
    }

    @Test
    void registerSuccessful() {
        RegisterRequest request = new RegisterRequest("Alex User", "user@example.com", "secret123");
        when(authRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-password");
        when(authRepository.save(any(AuthEntity.class))).thenReturn(user);
        when(jwtService.generateToken("user@example.com")).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken(user.getId())).thenReturn(refreshTokenEntity);

        AuthResult result = authService.register(request);

        assertThat(result.response().accessToken()).isEqualTo("jwt-token");
        assertThat(result.response().user().email()).isEqualTo("user@example.com");
        assertThat(result.response().user().name()).isEqualTo("Alex User");
        assertThat(result.refreshToken()).isEqualTo("refresh-token");

        ArgumentCaptor<AuthEntity> captor = ArgumentCaptor.forClass(AuthEntity.class);
        verify(authRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("hashed-password");
    }

    @Test
    void registerDuplicateEmail() {
        when(authRepository.existsByEmail("user@example.com")).thenReturn(true);

        assertThatThrownBy(
                () -> authService.register(new RegisterRequest("Alex User", "user@example.com", "secret123")))
                .isInstanceOf(DuplicateEmailException.class);
    }

    @Test
    void loginSuccessful() {
        when(authRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken("user@example.com")).thenReturn("jwt-token");
        when(refreshTokenService.createRefreshToken(user.getId())).thenReturn(refreshTokenEntity);

        AuthResult result = authService.login(new LoginRequest("user@example.com", "secret123"));

        assertThat(result.response().accessToken()).isEqualTo("jwt-token");
        assertThat(result.response().user().id()).isEqualTo(user.getId());
        assertThat(result.refreshToken()).isEqualTo("refresh-token");
    }

    @Test
    void loginInvalidCredentials() {
        when(authRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(new LoginRequest("user@example.com", "wrong")))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void forgotPasswordExistingEmail() {
        when(authRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        authService.forgotPassword(new ForgotPasswordRequest("user@example.com"));

        verify(authRepository).save(user);
        assertThat(user.getResetPasswordToken()).isNotNull();
        assertThat(user.getResetPasswordExpiresAt()).isAfter(OffsetDateTime.now());
        verify(emailService).sendPasswordResetEmail("user@example.com", user.getResetPasswordToken());
    }

    @Test
    void forgotPasswordNonExistentEmail() {
        when(authRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());
        when(authRepository.existsByEmail("nonexistent@example.com")).thenReturn(false);

        authService.forgotPassword(new ForgotPasswordRequest("nonexistent@example.com"));

        verify(authRepository, never()).save(any());
    }

    @Test
    void resetPasswordSuccessful() {
        user.setResetPasswordToken("valid-token");
        user.setResetPasswordExpiresAt(OffsetDateTime.now().plusHours(1));
        when(authRepository.findByResetPasswordToken("valid-token")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("new-secret")).thenReturn("new-hashed-password");

        authService.resetPassword(new ResetPasswordRequest("valid-token", "new-secret"));

        verify(authRepository).save(user);
        assertThat(user.getPasswordHash()).isEqualTo("new-hashed-password");
        assertThat(user.getResetPasswordToken()).isNull();
        assertThat(user.getResetPasswordExpiresAt()).isNull();
    }

    @Test
    void resetPasswordExpiredToken() {
        user.setResetPasswordToken("expired-token");
        user.setResetPasswordExpiresAt(OffsetDateTime.now().minusHours(1));
        when(authRepository.findByResetPasswordToken("expired-token")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.resetPassword(new ResetPasswordRequest("expired-token", "new-secret")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid or expired reset token");
    }

    @Test
    void resetPasswordInvalidToken() {
        when(authRepository.findByResetPasswordToken("invalid-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword(new ResetPasswordRequest("invalid-token", "new-secret")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid or expired reset token");
    }

    @Test
    void updatePasswordWithExistingPasswordSuccess() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(passwordEncoder.matches("old-password", "hashed-password")).thenReturn(true);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hashed-password");
        when(authRepository.save(any(AuthEntity.class))).thenReturn(user);

        authService.updatePassword(new UpdatePasswordRequest("old-password", "new-password"));

        verify(authRepository).save(user);
        assertThat(user.getPasswordHash()).isEqualTo("new-hashed-password");
    }

    @Test
    void updatePasswordOAuth2UserSuccess() {
        user.setPasswordHash(null);
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(passwordEncoder.encode("new-password")).thenReturn("new-hashed-password");
        when(authRepository.save(any(AuthEntity.class))).thenReturn(user);

        authService.updatePassword(new UpdatePasswordRequest(null, "new-password"));

        verify(authRepository).save(user);
        assertThat(user.getPasswordHash()).isEqualTo("new-hashed-password");
    }

    @Test
    void updatePasswordInvalidCurrentPasswordThrowsException() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThatThrownBy(
                () -> authService.updatePassword(new UpdatePasswordRequest("wrong-password", "new-password")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Неверный текущий пароль");
    }

    @Test
    void updatePasswordMissingCurrentPasswordThrowsException() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);

        assertThatThrownBy(() -> authService.updatePassword(new UpdatePasswordRequest(null, "new-password")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Текущий пароль обязателен");
    }

    @Test
    void deleteAccountWithWrongPasswordThrowsException() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        assertThatThrownBy(
                () -> authService.deleteAccount(new AccountDeletionRequest("wrong-password", "user@example.com")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Неверный пароль");
    }

    @Test
    void deleteAccountWithMissingPasswordThrowsException() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);

        assertThatThrownBy(
                () -> authService.deleteAccount(new AccountDeletionRequest(null, "user@example.com")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Пароль обязателен для удаления аккаунта");
    }

    @Test
    void deleteAccountWithWrongConfirmationThrowsException() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(passwordEncoder.matches("secret123", "hashed-password")).thenReturn(true);

        assertThatThrownBy(
                () -> authService.deleteAccount(new AccountDeletionRequest("secret123", "wrong@example.com")))
                .isInstanceOf(AuthException.class)
                .hasMessage("Email подтверждения не совпадает с email аккаунта");
    }

    @Test
    void deleteAccountWithCorrectPasswordAndConfirmationSucceeds() {
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(passwordEncoder.matches("secret123", "hashed-password")).thenReturn(true);

        authService.deleteAccount(new AccountDeletionRequest("secret123", "user@example.com"));

        verify(authRepository).delete(user);
    }

    @Test
    void deleteAccountOAuth2UserWithoutPasswordSucceeds() {
        user.setPasswordHash(null);
        when(currentUserResolver.resolveRequired()).thenReturn(user);

        authService.deleteAccount(new AccountDeletionRequest(null, "user@example.com"));

        verify(authRepository).delete(user);
    }
}
