package com.alexanderpolozhnov.careerpilot.telegram.config;

import com.alexanderpolozhnov.careerpilot.telegram.service.TelegramBotHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@Configuration
@ConditionalOnProperty(name = "telegram.bot.enabled", havingValue = "true", matchIfMissing = false)
@Slf4j
public class TelegramConfig {

    @Bean
    public TelegramBotsApi telegramBotsApi(TelegramBotHandler telegramBotHandler) throws TelegramApiException {
        TelegramBotsApi api = new TelegramBotsApi(DefaultBotSession.class);
        api.registerBot(telegramBotHandler);
        log.info("Telegram bot successfully registered and started polling.");
        return api;
    }
}
