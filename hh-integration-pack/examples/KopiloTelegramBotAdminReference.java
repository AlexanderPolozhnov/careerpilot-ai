// ПРИМЕР РЕАЛИЗАЦИИ АДМИН-КОМАНД И ДИАЛОГОВ ИЗ KOPILO (SPRING BOOT TELEGRAM BOT)
// Данный файл подготовлен как образец для переноса команд в CareerPilot

package com.alexanderpolozhnov.careerpilot.telegram.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class KopiloTelegramBotAdminReference {

    // Вспомогательный класс для хранения состояния выдачи подписки в памяти
    public static class AdminGiftState {
        public enum Step {
            WAITING_FOR_USERNAME,
            WAITING_FOR_PLAN,
            WAITING_FOR_DURATION,
            WAITING_FOR_REASON,
            WAITING_FOR_CONFIRMATION
        }

        private Step step;
        private String targetUsername;
        private UUID targetUserId;
        private String targetTelegramId;
        private String targetFirstName;
        private String plan; // FREE, PREMIUM
        private int durationMonths;
        private String reason;

        // Getters, Setters, Builder...
    }

    // Хранилище состояний админского диалога в памяти по chatId
    private final Map<Long, AdminGiftState> giftStates = new ConcurrentHashMap<>();

    // Вызывается из основного обработчика вебхука при получении текстового сообщения
    public void handleIncomingMessage(Update update) {
        if (!update.hasMessage() || !update.getMessage().hasText()) return;

        String messageText = update.getMessage().getText().trim();
        Long chatId = update.getMessage().getChatId();
        String senderUsername = update.getMessage().getFrom().getUserName();

        // Проверка прав администратора
        boolean isAdmin = senderUsername != null && senderUsername.equalsIgnoreCase("bigskvishik");

        if (isAdmin) {
            // Если админ находится в процессе пошагового диалога выдачи подписки
            if (giftStates.containsKey(chatId)) {
                handleAdminGiftStep(chatId, messageText);
                return;
            }

            if (messageText.startsWith("/admin")) {
                sendAdminHelp(chatId);
            } else if (messageText.startsWith("/send_messages")) {
                executeBroadcast(chatId, messageText);
            } else if (messageText.startsWith("/test_send_messages")) {
                executeTestBroadcast(chatId, messageText);
            } else if (messageText.startsWith("/users")) {
                executeFetchUsersStats(chatId);
            } else if (messageText.startsWith("/gift_subscription")) {
                startGiftSubscriptionFlow(chatId);
            }
        }
    }

    private void sendAdminHelp(Long chatId) {
        String text = "🛠 <b>Панель управления администратора CareerPilot</b>\n\n" +
                "📢 <b>Рассылки:</b>\n" +
                "• <code>/send_messages &lt;сообщение&gt;</code> — Глобальная рассылка всем пользователям бота. Поддерживает плейсхолдер <code>{name}</code>.\n" +
                "• <code>/test_send_messages &lt;сообщение&gt;</code> — Тестовая отправка сообщения только вам для проверки верстки.\n\n" +
                "📊 <b>Статистика:</b>\n" +
                "• <code>/users</code> — Статистика пользователей и статусы их подписок.\n\n" +
                "🎁 <b>Подарки:</b>\n" +
                "• <code>/gift_subscription</code> — Выдать PREMIUM подписку пользователю по юзернейму.";
        
        // Отправка HTML-сообщения (реализация через execute(sendMessage))
    }

    private void startGiftSubscriptionFlow(Long chatId) {
        AdminGiftState state = new AdminGiftState();
        state.step = AdminGiftState.Step.WAITING_FOR_USERNAME;
        giftStates.put(chatId, state);
        
        sendMessage(chatId, "🎁 <b>Выдача подарочной подписки</b>\n\nВведите Telegram-username пользователя (без @):");
    }

    private void handleAdminGiftStep(Long chatId, String text) {
        AdminGiftState state = giftStates.get(chatId);
        if (state == null) return;

        if ("/cancel".equalsIgnoreCase(text.trim())) {
            giftStates.remove(chatId);
            sendMessage(chatId, "❌ Операция отменена.");
            return;
        }

        switch (state.step) {
            case WAITING_FOR_USERNAME -> {
                String username = text.replace("@", "").trim().toLowerCase();
                
                // Пример поиска пользователя в бэкенд репозитории
                // Optional<PreferencesEntity> prefsOpt = preferencesRepository.findByTelegramUsernameIgnoreCase(username);
                boolean userExists = true; // Заглушка
                
                if (userExists) {
                    state.targetUsername = username;
                    state.targetUserId = UUID.randomUUID(); // Получить из сущности
                    state.targetTelegramId = "123456789"; // Получить chatId из сущности
                    state.targetFirstName = "Иван"; // Получить имя пользователя
                    state.step = AdminGiftState.Step.WAITING_FOR_PLAN;
                    giftStates.put(chatId, state);
                    
                    // Показываем кнопки выбора плана подписки
                    sendPlanSelection(chatId);
                } else {
                    sendMessage(chatId, "❌ Пользователь @" + username + " не найден в базе данных. Попробуйте еще раз или введите /cancel:");
                }
            }
            case WAITING_FOR_REASON -> {
                state.reason = text.trim();
                state.step = AdminGiftState.Step.WAITING_FOR_CONFIRMATION;
                giftStates.put(chatId, state);
                
                sendConfirmation(chatId);
            }
            case WAITING_FOR_CONFIRMATION -> {
                if ("ПОДТВЕРЖДАЮ".equalsIgnoreCase(text.trim())) {
                    executeGiftActivation(chatId);
                } else {
                    sendMessage(chatId, "⚠️ Для подтверждения введите слово <code>ПОДТВЕРЖДАЮ</code> (или /cancel для отмены):");
                }
            }
        }
    }

    private void sendPlanSelection(Long chatId) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();
        
        keyboard.add(List.of(
            InlineKeyboardButton.builder().text("FREE").callbackData("gift_plan_FREE").build(),
            InlineKeyboardButton.builder().text("PREMIUM").callbackData("gift_plan_PREMIUM").build()
        ));
        markup.setKeyboard(keyboard);
        
        // Отправляем сообщение с кнопками.
        // При нажатии кнопки callbackQuery переведет стейт на WAITING_FOR_DURATION.
    }

    // Обработка кликов по инлайн кнопкам (из метода handleCallbackQuery)
    public void handleCallbackQuery(Long chatId, String data) {
        AdminGiftState state = giftStates.get(chatId);
        if (state == null) return;

        if (data.startsWith("gift_plan_")) {
            state.plan = data.substring("gift_plan_".length());
            state.step = AdminGiftState.Step.WAITING_FOR_DURATION;
            giftStates.put(chatId, state);
            
            sendDurationSelection(chatId);
        } else if (data.startsWith("gift_dur_")) {
            state.durationMonths = Integer.parseInt(data.substring("gift_dur_".length()));
            state.step = AdminGiftState.Step.WAITING_FOR_REASON;
            giftStates.put(chatId, state);
            
            sendMessage(chatId, "Введите причину выдачи подписки (будет показана пользователю):");
        }
    }

    private void sendDurationSelection(Long chatId) {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();
        
        keyboard.add(List.of(
            InlineKeyboardButton.builder().text("1 месяц").callbackData("gift_dur_1").build(),
            InlineKeyboardButton.builder().text("3 месяца").callbackData("gift_dur_3").build()
        ));
        keyboard.add(List.of(
            InlineKeyboardButton.builder().text("6 месяцев").callbackData("gift_dur_6").build(),
            InlineKeyboardButton.builder().text("12 месяцев").callbackData("gift_dur_12").build()
        ));
        keyboard.add(List.of(
            InlineKeyboardButton.builder().text("Lifetime (Бессрочно)").callbackData("gift_dur_1188").build()
        ));
        markup.setKeyboard(keyboard);
        
        // Отправка сообщения
    }

    private void sendConfirmation(Long chatId) {
        AdminGiftState state = giftStates.get(chatId);
        String durationText = state.durationMonths >= 1188 ? "Бессрочно" : state.durationMonths + " мес.";
        String text = String.format(
                "🏁 <b>ПОДТВЕРЖДЕНИЕ ВЫДАЧИ</b>\n\n" +
                "👤 <b>Кому:</b> %s (@%s)\n" +
                "💎 <b>План:</b> %s\n" +
                "⏳ <b>Длительность:</b> %s\n" +
                "📝 <b>Причина:</b> %s\n\n" +
                "Для выполнения операции введите <code>ПОДТВЕРЖДАЮ</code>:",
                state.targetFirstName, state.targetUsername, state.plan, durationText, state.reason
        );
        // Отправка сообщения
    }

    private void executeGiftActivation(Long adminChatId) {
        AdminGiftState state = giftStates.remove(adminChatId);
        if (state == null) return;

        try {
            // Вызов метода бэкенд сервиса для обновления подписки в бд
            // subscriptionService.activateSubscription(state.targetUserId, state.plan, state.durationMonths);
            
            sendMessage(adminChatId, "✅ Подписка успешно выдана пользователю @" + state.targetUsername);
            
            // Отправка уведомления пользователю
            String userMsg = String.format(
                "🎁 <b>Вам подарок от разработчиков!</b> 🚀\n\n" +
                "Вам выдана подписка <b>%s</b> на срок: %s.\n" +
                "📝 Причина: %s",
                state.plan, (state.durationMonths >= 1188 ? "Бессрочно" : state.durationMonths + " мес."), state.reason
            );
            sendMessage(Long.parseLong(state.targetTelegramId), userMsg);
        } catch (Exception e) {
            sendMessage(adminChatId, "❌ Ошибка активации: " + e.getMessage());
        }
    }

    private void sendMessage(Long chatId, String text) {
        // Стандартный метод execute(SendMessage)
    }

    private void executeBroadcast(Long adminChatId, String text) {
        // Логика глобальной рассылки
    }

    private void executeTestBroadcast(Long adminChatId, String text) {
        // Логика отправки сообщения только админу на его adminChatId
    }

    private void executeFetchUsersStats(Long adminChatId) {
        // Логика выгрузки статистики пользователей
    }
}
