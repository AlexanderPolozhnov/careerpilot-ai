package com.alexanderpolozhnov.careerpilot.notification.provider;

import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.DefaultAbsSender;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramNotificationSender extends TelegramLongPollingBot implements NotificationSender {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Override
    public NotificationProvider getProvider() {
        return NotificationProvider.TELEGRAM;
    }

    @Override
    public void send(String toAddressOrChatId, String title, String message) {
        try {
            String fullMessage = title + "\n\n" + message;
            SendMessage sendMessage = SendMessage.builder()
                    .chatId(toAddressOrChatId)
                    .text(fullMessage)
                    .build();

            execute(sendMessage);
            log.info("Sent Telegram notification to chatId: {}", toAddressOrChatId);
        } catch (TelegramApiException e) {
            log.error("Failed to send Telegram notification to chatId: {}", toAddressOrChatId, e);
        }
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public void onUpdateReceived(Update update) {
        // Handle updates if needed
    }
}
