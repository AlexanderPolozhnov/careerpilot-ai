package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.DuplicateEmailException;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.auth.request.ForgotPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ResetPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
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
    @InjectMocks
    private AuthServiceImpl authService;

    private AuthEntity user;

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
    }

    @Test
    void registerSuccessful() {
        RegisterRequest request = new RegisterRequest("Alex User", "user@example.com", "secret123");
        when(authRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("hashed-password");
        when(authRepository.save(any(AuthEntity.class))).thenReturn(user);
        when(jwtService.generateToken("user@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.user().email()).isEqualTo("user@example.com");
        assertThat(response.user().name()).isEqualTo("Alex User");

        ArgumentCaptor<AuthEntity> captor = ArgumentCaptor.forClass(AuthEntity.class);
        verify(authRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("hashed-password");
    }

    @Test
    void registerDuplicateEmail() {
        when(authRepository.existsByEmail("user@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(new RegisterRequest("Alex User", "user@example.com", "secret123")))
                .isInstanceOf(DuplicateEmailException.class);
    }

    @Test
    void loginSuccessful() {
        when(authRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret123", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken("user@example.com")).thenReturn("jwt-token");

        AuthResponse response = authService.login(new LoginRequest("user@example.com", "secret123"));

        assertThat(response.accessToken()).isEqualTo("jwt-token");
        assertThat(response.user().id()).isEqualTo(user.getId());
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
}
