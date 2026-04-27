package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.UserRole;
import com.alexanderpolozhnov.careerpilot.auth.exception.DuplicateEmailException;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final JwtService jwtService;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(LoginRequest request) {
        AuthEntity user = authRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
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

        return buildAuthResponse(savedUser);
    }

    @Override
    public AuthUserResponse me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new InvalidCredentialsException("Unauthorized");
        }
        String email = authentication.getName();
        AuthEntity user = authRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return toUserResponse(user);
    }

    private AuthResponse buildAuthResponse(AuthEntity user) {
        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, toUserResponse(user));
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
