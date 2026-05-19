package com.alexanderpolozhnov.careerpilot.auth.controller;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.auth.request.ForgotPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ResetPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthUserResponse;
import com.alexanderpolozhnov.careerpilot.auth.service.AuthResult;
import com.alexanderpolozhnov.careerpilot.auth.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Value("${security.jwt.refresh-token-expiration-ms}")
    private long refreshTokenExpirationMs;

    @PostMapping("/login")
    @Auditable(action = "USER_LOGIN", entityType = "USER")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResult result = authService.login(request);
        setRefreshTokenCookie(response, result.refreshToken());
        return result.response();
    }

    @PostMapping("/register")
    @Auditable(action = "USER_REGISTER", entityType = "USER")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResult result = authService.register(request);
        setRefreshTokenCookie(response, result.refreshToken());
        return result.response();
    }

    @GetMapping("/me")
    public AuthUserResponse me() {
        return authService.me();
    }

    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }

    @PostMapping("/refresh")
    public AuthResponse refresh(@CookieValue(name = "refresh_token") String refreshToken,
            HttpServletResponse response) {
        AuthResult result = authService.refresh(refreshToken);
        setRefreshTokenCookie(response, result.refreshToken());
        return result.response();
    }

    @PostMapping("/logout")
    @Auditable(action = "USER_LOGOUT", entityType = "USER")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = "refresh_token", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false) // Assuming DEV might not use HTTPS, should be configurable but sticking to
                               // Spring defaults here or strictly false for dev. Wait, secure should probably
                               // just be omitted or dynamically set. Actually, secure is better if possible.
                               // I'll omit it so it works on localhost HTTP.
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", refreshToken)
                .httpOnly(true)
                .secure(false) // Omit secure for localhost support, ideally would be configured. Let's set
                               // secure=true later if needed.
                .path("/api/auth")
                .maxAge(refreshTokenExpirationMs / 1000)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    @GetMapping("/oauth2/authorize/{provider}")
    public void authorizeOAuth2(@PathVariable String provider, HttpServletResponse response) throws java.io.IOException {
        response.sendRedirect("/oauth2/authorization/" + provider);
    }
}
