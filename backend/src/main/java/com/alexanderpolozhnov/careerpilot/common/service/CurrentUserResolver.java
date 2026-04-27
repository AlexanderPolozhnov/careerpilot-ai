package com.alexanderpolozhnov.careerpilot.common.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserResolver {

    private static final String DEV_EMAIL = "dev@careerpilot.local";

    private final AuthRepository authRepository;

    public AuthEntity resolveOrCreate() {
        return authRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> authRepository.save(createDevUser()));
    }

    private AuthEntity createDevUser() {
        AuthEntity user = new AuthEntity();
        user.setEmail(DEV_EMAIL);
        user.setPasswordHash("dev-password-hash");
        user.setFullName("CareerPilot Dev User");
        return user;
    }
}
