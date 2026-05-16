package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;

public record AuthResult(
        AuthResponse response,
        String refreshToken
) {
}
