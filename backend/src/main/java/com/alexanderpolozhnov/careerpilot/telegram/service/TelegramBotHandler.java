package com.alexanderpolozhnov.careerpilot.telegram.service;

import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "telegram.bot.enabled", havingValue = "true", matchIfMissing = false)
public class TelegramBotHandler extends TelegramLongPollingBot {

    private static final String HELP_TEXT = "🚀 <b>CareerPilot AI</b> — ваш личный ассистент для поиска работы.\n\n" +
            "Этот бот отправляет уведомления:\n" +
            "• ⏰ Напоминания о предстоящих собеседованиях\n" +
            "• ✅ Оповещения о дедлайнах задач\n" +
            "• 📋 Изменения статусов откликов\n\n" +
            "<b>Доступные команды:</b>\n" +
            "/start — привязать Telegram к аккаунту CareerPilot AI\n" +
            "/help — показать эту справку\n\n" +
            "Для привязки перейдите в <b>Settings → Notifications</b> и выберите Telegram как провайдер уведомлений.";

    private final PreferencesRepository preferencesRepository;

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Override
    public void onUpdateReceived(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) {
            return;
        }

        String messageText = update.getMessage().getText().trim();
        Long chatId = update.getMessage().getChatId();

        if (messageText.startsWith("/start")) {
            handleStartCommand(messageText, chatId);
        } else if (messageText.equals("/help")) {
            handleHelpCommand(chatId);
        }
    }

    private void handleStartCommand(String messageText, Long chatId) {
        try {
            String[] parts = messageText.split(" ", 2);

            if (parts.length < 2 || parts[1].isBlank()) {
                if (preferencesRepository.existsByTelegramChatId(chatId.toString())) {
                    sendHtml(chatId,
                            "✅ <b>Ваш Telegram уже привязан</b> к аккаунту CareerPilot AI.\n\n" +
                                    "Уведомления будут приходить сюда. Используйте /help для справки.");
                } else {
                    sendHtml(chatId,
                            "👋 <b>Добро пожаловать в CareerPilot AI!</b>\n\n" +
                                    "Для привязки этого чата к вашему аккаунту:\n" +
                                    "1. Откройте CareerPilot AI\n" +
                                    "2. Перейдите в <b>Settings → Notifications</b>\n" +
                                    "3. Выберите <b>Telegram</b> и нажмите кнопку привязки\n\n" +
                                    "Используйте /help для получения справки.");
                }
                return;
            }

            String tokenString = parts[1].trim();
            UUID token;
            try {
                token = UUID.fromString(tokenString);
            } catch (IllegalArgumentException e) {
                sendHtml(chatId,
                        "❌ <b>Неверный токен привязки.</b>\n\n" +
                                "Пожалуйста, используйте ссылку из настроек CareerPilot AI.");
                return;
            }

            Optional<PreferencesEntity> prefsOpt = preferencesRepository.findByTelegramConnectToken(token);
            if (prefsOpt.isEmpty()) {
                sendHtml(chatId,
                        "⚠️ <b>Токен не найден или истёк.</b>\n\n" +
                                "Пожалуйста, получите новую ссылку в <b>Settings → Notifications</b>.");
                return;
            }

            PreferencesEntity prefs = prefsOpt.get();
            prefs.setTelegramChatId(chatId.toString());
            prefs.setTelegramConnectToken(null);
            prefs.setNotificationProvider(com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider.TELEGRAM);
            preferencesRepository.save(prefs);

            sendHtml(chatId,
                    "✅ <b>Telegram успешно привязан!</b>\n\n" +
                            "Теперь уведомления CareerPilot AI будут приходить сюда.\n" +
                            "Используйте /help для справки.");
            log.info("Telegram bot successfully linked for chatId: {}", chatId);

        } catch (Exception e) {
            log.error("Error handling /start command for chatId: {}", chatId, e);
            try {
                sendHtml(chatId, "❌ Произошла ошибка при привязке. Пожалуйста, попробуйте позже.");
            } catch (TelegramApiException ex) {
                log.error("Failed to send error message to chatId: {}", chatId, ex);
            }
        }
    }

    private void handleHelpCommand(Long chatId) {
        try {
            sendHtml(chatId, HELP_TEXT);
        } catch (TelegramApiException e) {
            log.error("Failed to send help message to chatId: {}", chatId, e);
        }
    }

    private void sendHtml(Long chatId, String html) throws TelegramApiException {
        org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo webAppInfo = 
            new org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo("https://careerpilot-ai.ru/app/dashboard?tg=1");

        org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton webAppBtn = 
            org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton.builder()
                .text("📱 Открыть CareerPilot")
                .webApp(webAppInfo)
                .build();

        org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup markup = 
            org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup.builder()
                .keyboardRow(java.util.List.of(webAppBtn))
                .build();

        SendMessage sendMessage = SendMessage.builder()
                .chatId(chatId)
                .text(html)
                .parseMode("HTML")
                .replyMarkup(markup)
                .build();
        execute(sendMessage);
    }

    @Override
    public String getBotToken() {
        return botToken;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }
}
