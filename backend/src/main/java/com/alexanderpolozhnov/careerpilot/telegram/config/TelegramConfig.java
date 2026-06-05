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
@Slf4j
public class TelegramConfig {
    // Configuration left empty for future use, TelegramBotsApi removed since we use Webhooks now.
}
