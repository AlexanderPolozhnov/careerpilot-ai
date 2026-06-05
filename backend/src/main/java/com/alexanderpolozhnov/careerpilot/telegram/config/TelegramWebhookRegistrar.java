package com.alexanderpolozhnov.careerpilot.telegram.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramWebhookRegistrar {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.webhook-url:}")
    private String configuredWebhookUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @PostConstruct
    public void registerWebhook() {
        if (botToken == null || botToken.isEmpty() || botToken.equals("placeholder")) {
            log.warn("Telegram bot token is not set. Skipping webhook registration.");
            return;
        }

        String webhookUrl = configuredWebhookUrl;
        if (webhookUrl == null || webhookUrl.isBlank()) {
            webhookUrl = frontendUrl + "/api/telegram/webhook";
        }

        if (webhookUrl.contains("localhost")) {
            log.warn("Webhook URL contains localhost ({}). Telegram Webhooks require a public URL. Please set TELEGRAM_WEBHOOK_URL.", webhookUrl);
            return;
        }

        String telegramApiUrl = "https://api.telegram.org/bot" + botToken + "/setWebhook?url=" + webhookUrl;
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(telegramApiUrl, String.class);
            log.info("Telegram Webhook successfully registered to URL: {}. Response: {}", webhookUrl, response);
        } catch (Exception e) {
            log.error("Failed to register Telegram Webhook to URL: {}", webhookUrl, e);
        }
    }
}
