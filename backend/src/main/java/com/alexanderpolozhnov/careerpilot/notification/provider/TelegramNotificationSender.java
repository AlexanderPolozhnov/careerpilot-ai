package com.alexanderpolozhnov.careerpilot.notification.provider;

import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.alexanderpolozhnov.careerpilot.telegram.service.TelegramBotHandler;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class TelegramNotificationSender implements NotificationSender {

    private final Optional<TelegramBotHandler> botHandlerOptional;

    @Override
    public NotificationProvider getProvider() {
        return NotificationProvider.TELEGRAM;
    }

    @Override
    public void send(String toAddressOrChatId, String title, String message) {
        if (botHandlerOptional.isEmpty()) {
            log.warn("Telegram bot is disabled. Notification not sent to chatId: {}", toAddressOrChatId);
            return;
        }

        try {
            String fullMessage = title + "\n\n" + message;
            SendMessage sendMessage = SendMessage.builder()
                    .chatId(toAddressOrChatId)
                    .text(fullMessage)
                    .build();

            botHandlerOptional.get().execute(sendMessage);
            log.info("Sent Telegram notification to chatId: {}", toAddressOrChatId);
        } catch (TelegramApiException e) {
            log.error("Failed to send Telegram notification to chatId: {}", toAddressOrChatId, e);
        }
    }
}
