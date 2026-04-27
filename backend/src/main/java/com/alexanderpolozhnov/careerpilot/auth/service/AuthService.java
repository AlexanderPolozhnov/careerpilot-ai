package com.alexanderpolozhnov.careerpilot.auth.service;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
public interface AuthService { AuthResponse login(LoginRequest request); AuthResponse register(RegisterRequest request); }
