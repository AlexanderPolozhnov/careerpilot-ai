package com.alexanderpolozhnov.careerpilot.user.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.user.request.UpdateUserRequest;
import com.alexanderpolozhnov.careerpilot.user.response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final AuthRepository authRepository;

    @Override
    public UserResponse getMe() {
        return toResponse(currentUser());
    }

    @Override
    @Transactional
    public UserResponse updateMe(UpdateUserRequest request) {
        AuthEntity user = currentUser();
        String name = request.name().trim();
        user.setFullName(name);
        String[] parts = name.split("\\s+", 2);
        user.setFirstName(parts[0]);
        user.setLastName(parts.length > 1 ? parts[1] : null);
        String normalizedEmail = request.email().trim().toLowerCase();
        if (!user.getEmail().equals(normalizedEmail)) {
            if (authRepository.existsByEmail(normalizedEmail)) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(normalizedEmail);
        }
        user.setLocation(request.location());
        return toResponse(authRepository.save(user));
    }

    private AuthEntity currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new InvalidCredentialsException("Unauthorized");
        }
        return authRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    private UserResponse toResponse(AuthEntity user) {
        String name = resolveDisplayName(user);
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            name,
            null,
            user.getLocation(),
            user.getCreatedAt()
        );
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
