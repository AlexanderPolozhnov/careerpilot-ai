package com.alexanderpolozhnov.careerpilot.auth.service;

import com.alexanderpolozhnov.careerpilot.auth.request.AccountDeletionRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ForgotPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.LoginRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.RegisterRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.ResetPasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.request.UpdatePasswordRequest;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthUserResponse;

import com.alexanderpolozhnov.careerpilot.auth.request.TelegramWebAppAuthRequest;

public interface AuthService {
    AuthResult telegramWebAppAuth(TelegramWebAppAuthRequest request);
    AuthResult login(LoginRequest request);

    AuthResult register(RegisterRequest request);

    AuthUserResponse me();

    void forgotPassword(ForgotPasswordRequest request);

    void resetPassword(ResetPasswordRequest request);

    void updatePassword(UpdatePasswordRequest request);

    AuthResult refresh(String refreshToken);

    void logout(String refreshToken);

    void deleteAccount(AccountDeletionRequest request);
}
