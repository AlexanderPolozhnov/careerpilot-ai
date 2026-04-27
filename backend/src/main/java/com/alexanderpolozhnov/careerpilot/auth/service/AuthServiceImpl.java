package com.alexanderpolozhnov.careerpilot.auth.service;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor
public class AuthServiceImpl implements AuthService { private final JwtService jwtService; public AuthResponse login(LoginRequest request){ return new AuthResponse(jwtService.generateToken(request.email())); } public AuthResponse register(RegisterRequest request){ return new AuthResponse(jwtService.generateToken(request.email())); }}
