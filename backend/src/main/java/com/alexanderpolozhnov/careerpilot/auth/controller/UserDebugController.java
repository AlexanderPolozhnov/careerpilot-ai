package com.alexanderpolozhnov.careerpilot.auth.controller;

import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Profile("dev")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserDebugController {

    private final AuthRepository authRepository;

    @GetMapping
    public List<UserDebugResponse> listUsers() {
        return authRepository.findAll().stream()
                .map(user -> new UserDebugResponse(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName()
                ))
                .toList();
    }

    public record UserDebugResponse(
            UUID id,
            String email,
            String fullName
    ) {
    }
}
