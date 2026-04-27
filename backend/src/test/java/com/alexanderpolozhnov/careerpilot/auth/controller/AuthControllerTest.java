package com.alexanderpolozhnov.careerpilot.auth.controller;

import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthUserResponse;
import com.alexanderpolozhnov.careerpilot.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    @Mock
    private AuthService authService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(authService)).build();
    }

    @Test
    void registerHappyPath() throws Exception {
        AuthUserResponse user = new AuthUserResponse(UUID.randomUUID(), "user@example.com", "Alex", null, Instant.now());
        when(authService.register(any())).thenReturn(new AuthResponse("jwt-token", user));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RegisterBody("Alex", "user@example.com", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"))
                .andExpect(jsonPath("$.user.email").value("user@example.com"));
    }

    @Test
    void loginHappyPath() throws Exception {
        AuthUserResponse user = new AuthUserResponse(UUID.randomUUID(), "user@example.com", "Alex", null, Instant.now());
        when(authService.login(any())).thenReturn(new AuthResponse("jwt-token", user));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginBody("user@example.com", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt-token"));
    }

    @Test
    @Disabled("TODO: добавить интеграционный security-тест с реальным SecurityFilterChain")
    void meUnauthorizedWithoutToken() {
    }

    @Test
    @Disabled("TODO: добавить интеграционный security-тест с JWT filter и SecurityContext")
    void meAuthorizedWithToken() {
    }

    @Test
    void meHappyPath() throws Exception {
        AuthUserResponse user = new AuthUserResponse(UUID.randomUUID(), "user@example.com", "Alex", null, Instant.now());
        when(authService.me()).thenReturn(user);

        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));
    }

    private record RegisterBody(String name, String email, String password) {
    }

    private record LoginBody(String email, String password) {
    }
}
