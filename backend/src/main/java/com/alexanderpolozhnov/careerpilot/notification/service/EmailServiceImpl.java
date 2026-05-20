package com.alexanderpolozhnov.careerpilot.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    private final JavaMailSender mailSender;
    
    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    @Override
    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/auth/reset-password?token=" + token;
        log.info("---------------------------------------------------------");
        log.info("PASSWORD RESET REQUEST for: {}", to);
        log.info("RESET LINK: {}", resetLink);
        log.info("---------------------------------------------------------");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            String htmlContent = buildResetPasswordHtml(resetLink);

            helper.setFrom("no-reply@careerpilot.ai", "CareerPilot AI");
            helper.setTo(to);
            helper.setSubject("Сброс пароля — CareerPilot AI");
            helper.setText(htmlContent, true); // true = HTML content

            log.info("Connecting to SMTP server and sending HTML email...");
            mailSender.send(message);
            log.info("SUCCESS: HTML Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("CRITICAL ERROR: Failed to SEND HTML email to {}.", to);
            log.error("SMTP Error Message: {}", e.getMessage());
        }
    }

    private String buildResetPasswordHtml(String resetLink) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Onest', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0b; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
                .container { max-width: 600px; margin: 40px auto; background-color: #111113; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; }
                .header { padding: 40px 40px 20px; text-align: left; }
                .logo { display: inline-flex; align-items: center; }
                .logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #7c3aed 0%%, #6d28d9 100%%); border-radius: 10px; display: inline-block; vertical-align: middle; text-align: center; line-height: 36px; }
                .logo-text { color: #e8eaed; font-size: 18px; font-weight: 600; margin-left: 12px; display: inline-block; vertical-align: middle; }
                .content { padding: 0 40px 40px; }
                h1 { color: #e8eaed; font-size: 24px; font-weight: 600; margin-bottom: 16px; letter-spacing: -0.02em; }
                p { color: #8b8fa3; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
                .button-container { margin: 32px 0; }
                .button { background: linear-gradient(to right, #7c3aed, #6d28d9); color: #ffffff !important; padding: 14px 32px; border-radius: 12px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.25); }
                .footer { padding: 32px 40px; background-color: #0d0d0f; border-top: 1px solid rgba(255,255,255,0.06); }
                .footer-text { color: #4a4e5a; font-size: 13px; text-align: left; }
                .divider { height: 1px; background-color: rgba(255,255,255,0.06); margin: 32px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">
                        <div class="logo-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-top: -2px;">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <span class="logo-text">CareerPilot</span>
                    </div>
                </div>
                <div class="content">
                    <h1>Восстановление доступа</h1>
                    <p>Привет! Мы получили запрос на сброс пароля для вашего аккаунта CareerPilot AI. Если это были вы, нажмите на кнопку ниже, чтобы установить новый пароль:</p>
                    
                    <div class="button-container">
                        <a href="%s" class="button">Сбросить пароль</a>
                    </div>

                    <p style="font-size: 13px; color: #4a4e5a;">Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
                    <a href="%s" style="color: #7c3aed; text-decoration: none;">%s</a></p>
                    
                    <div class="divider"></div>
                    
                    <p style="margin-bottom: 0;">Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо. Ваш пароль останется прежним.</p>
                </div>
                <div class="footer">
                    <div class="footer-text">
                        &copy; 2026 CareerPilot AI. Intelligent career management.<br>
                        Secure &middot; Private &middot; AI Powered
                    </div>
                </div>
            </div>
        </body>
        </html>
        """.formatted(resetLink, resetLink, resetLink);
    }
}
