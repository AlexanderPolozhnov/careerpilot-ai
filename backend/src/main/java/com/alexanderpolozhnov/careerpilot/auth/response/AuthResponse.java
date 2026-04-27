package com.alexanderpolozhnov.careerpilot.auth.response;

public record AuthResponse(
        String accessToken,
        AuthUserResponse user
) {
}
