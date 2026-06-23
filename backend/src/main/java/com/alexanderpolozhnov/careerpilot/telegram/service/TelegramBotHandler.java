package com.alexanderpolozhnov.careerpilot.telegram.service;

import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.subscription.repository.SubscriptionRepository;
import com.alexanderpolozhnov.careerpilot.subscription.service.SubscriptionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramWebhookBot;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.invoices.CreateInvoiceLink;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.payments.LabeledPrice;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class TelegramBotHandler extends TelegramWebhookBot {

    // ─── Константы ───────────────────────────────────────────────────────────
    private static final String ADMIN_USERNAME = "bigskvishik";

    private static final String HELP_TEXT =
            "🚀 <b>CareerPilot AI</b> — ваш личный ассистент для поиска работы.\n\n" +
            "Этот бот отправляет уведомления:\n" +
            "• ⏰ Напоминания о предстоящих собеседованиях\n" +
            "• ✅ Оповещения о дедлайнах задач\n" +
            "• 📋 Изменения статусов откликов\n\n" +
            "<b>Доступные команды:</b>\n" +
            "/start — привязать Telegram к аккаунту CareerPilot AI\n" +
            "/help — показать эту справку\n\n" +
            "Для привязки перейдите в <b>Settings → Notifications</b> и выберите Telegram как провайдер уведомлений.";

    // ─── Зависимости ─────────────────────────────────────────────────────────
    private final PreferencesRepository preferencesRepository;
    private final SubscriptionService subscriptionService;
    private final String botUsername;
    private final String webAppUrl;
    private final String webhookUrl;
    private final AuthRepository authRepository;
    private final SubscriptionRepository subscriptionRepository;

    // ─── Стейт машина для /gift_subscription ─────────────────────────────────
    private final AdminCommandStateService giftStates;

    // ─── Конструктор ─────────────────────────────────────────────────────────
    public TelegramBotHandler(
            @Value("${telegram.bot.token}") String botToken,
            @Value("${telegram.bot.username:careerpilot_ai_bot}") String botUsername,
            @Value("${telegram.bot.webapp-url:https://careerpilot-ai.ru/app/dashboard?tg=1}") String webAppUrl,
            @Value("${telegram.webhook.url:}") String webhookUrl,
            PreferencesRepository preferencesRepository,
            SubscriptionService subscriptionService,
            AdminCommandStateService giftStates,
            AuthRepository authRepository,
            SubscriptionRepository subscriptionRepository) {
        super(botToken);
        this.botUsername = botUsername;
        this.webAppUrl = webAppUrl;
        this.preferencesRepository = preferencesRepository;
        this.subscriptionService = subscriptionService;
        this.giftStates = giftStates;
        this.webhookUrl = webhookUrl;
        this.authRepository = authRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    @Override
    public String getBotPath() {
        return "/api/telegram/webhook";
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            // Set Webhook if URL is configured
            if (webhookUrl != null && !webhookUrl.isBlank()) {
                org.telegram.telegrambots.meta.api.methods.updates.SetWebhook setWebhook = org.telegram.telegrambots.meta.api.methods.updates.SetWebhook.builder()
                        .url(webhookUrl)
                        .dropPendingUpdates(true)
                        .build();
                execute(setWebhook);
                log.info("Webhook successfully set to: {}", webhookUrl);
            }

            // Set Commands
            List<org.telegram.telegrambots.meta.api.objects.commands.BotCommand> commands = new ArrayList<>();
            commands.add(new org.telegram.telegrambots.meta.api.objects.commands.BotCommand("/start", "Привязать аккаунт CareerPilot"));
            commands.add(new org.telegram.telegrambots.meta.api.objects.commands.BotCommand("/help", "Справка по боту"));
            
            org.telegram.telegrambots.meta.api.methods.commands.SetMyCommands setMyCommands = new org.telegram.telegrambots.meta.api.methods.commands.SetMyCommands();
            setMyCommands.setCommands(commands);
            setMyCommands.setScope(new org.telegram.telegrambots.meta.api.objects.commands.scope.BotCommandScopeDefault());
            
            execute(setMyCommands);
            log.info("Bot commands successfully registered");
        } catch (TelegramApiException e) {
            log.error("Failed to initialize bot webhook/commands", e);
        }
    }

    // ─── Главный обработчик обновлений ───────────────────────────────────────
    @Override
    public BotApiMethod<?> onWebhookUpdateReceived(Update update) {
        try {
            // Обработка inline-кнопок (CallbackQuery)
            if (update.hasCallbackQuery()) {
                Long chatId = update.getCallbackQuery().getMessage().getChatId();
                String data = update.getCallbackQuery().getData();
                handleCallbackQuery(chatId, data);
                return null;
            }

            if (!update.hasMessage() || !update.getMessage().hasText()) {
                return null;
            }

            String messageText = update.getMessage().getText().trim();
            Long chatId = update.getMessage().getChatId();

            // Автосохранение telegram_username при любом сообщении
            saveTelegramUsernameIfPresent(update);

            // Приоритет: если администратор в процессе пошагового диалога
            if (isAdmin(update) && giftStates.hasState(chatId)) {
                handleAdminGiftStep(chatId, messageText);
                return null;
            }

            // Команды администратора
            if (isAdmin(update)) {
                if (messageText.startsWith("/admin")) {
                    sendAdminHelp(chatId);
                    return null;
                } else if (messageText.startsWith("/send_messages")) {
                    executeGlobalBroadcast(chatId, messageText);
                    return null;
                } else if (messageText.startsWith("/test_send_messages")) {
                    executeTestBroadcast(chatId, messageText);
                    return null;
                } else if (messageText.startsWith("/users")) {
                    executeFetchUsersStats(chatId);
                    return null;
                } else if (messageText.startsWith("/gift_subscription")) {
                    startGiftSubscriptionFlow(chatId);
                    return null;
                }
            }

            // Команды для всех пользователей
            if (messageText.startsWith("/start")) {
                handleStartCommand(messageText, chatId, update);
            } else if (messageText.equals("/help")) {
                handleHelpCommand(chatId);
            }

        } catch (Exception e) {
            log.error("Unhandled error in onWebhookUpdateReceived", e);
        }

        return null;
    }

    // ─── Автосохранение username ──────────────────────────────────────────────
    private void saveTelegramUsernameIfPresent(Update update) {
        if (!update.hasMessage()) return;
        String senderUsername = update.getMessage().getFrom().getUserName();
        if (senderUsername == null || senderUsername.isBlank()) return;

        Long chatId = update.getMessage().getChatId();
        List<PreferencesEntity> existing = preferencesRepository.findByTelegramChatId(chatId.toString());
        if (!existing.isEmpty()) {
            String normalized = senderUsername.replace("@", "").trim().toLowerCase();
            existing.forEach(p -> p.setTelegramUsername(normalized));
            preferencesRepository.saveAll(existing);
        }
    }

    // ─── Проверка прав администратора ────────────────────────────────────────
    private boolean isAdmin(Update update) {
        if (!update.hasMessage()) return false;
        String username = update.getMessage().getFrom().getUserName();
        return username != null && username.equalsIgnoreCase(ADMIN_USERNAME);
    }

    // ─── Команда /start ───────────────────────────────────────────────────────
    private void handleStartCommand(String messageText, Long chatId, Update update) {
        try {
            String[] parts = messageText.split(" ", 2);

            if (parts.length < 2 || parts[1].isBlank()) {
                if (preferencesRepository.existsByTelegramChatId(chatId.toString())) {
                    sendHtmlWithWebApp(chatId,
                            "✅ <b>Ваш Telegram уже привязан</b> к аккаунту CareerPilot AI.\n\n" +
                            "Уведомления будут приходить сюда. Используйте /help для справки.");
                } else {
                    sendHtmlWithWebApp(chatId,
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
                sendHtmlWithWebApp(chatId,
                        "❌ <b>Неверный токен привязки.</b>\n\n" +
                        "Пожалуйста, используйте ссылку из настроек CareerPilot AI.");
                return;
            }

            Optional<PreferencesEntity> prefsOpt = preferencesRepository.findByTelegramConnectToken(token);
            if (prefsOpt.isEmpty()) {
                sendHtmlWithWebApp(chatId,
                        "⚠️ <b>Токен не найден или истёк.</b>\n\n" +
                        "Пожалуйста, получите новую ссылку в <b>Settings → Notifications</b>.");
                return;
            }

            PreferencesEntity prefs = prefsOpt.get();

            // Отвязываем старые chatId для данного chatId
            List<PreferencesEntity> existingLinks = preferencesRepository.findByTelegramChatId(chatId.toString());
            existingLinks.forEach(p -> p.setTelegramChatId(null));
            preferencesRepository.saveAll(existingLinks);

            // Сохраняем chatId и username
            prefs.setTelegramChatId(chatId.toString());
            prefs.setTelegramConnectToken(null);
            prefs.setNotificationProvider(NotificationProvider.TELEGRAM);

            if (update.hasMessage()) {
                String senderUsername = update.getMessage().getFrom().getUserName();
                if (senderUsername != null && !senderUsername.isBlank()) {
                    prefs.setTelegramUsername(senderUsername.replace("@", "").trim().toLowerCase());
                }
            }

            preferencesRepository.save(prefs);

            sendHtmlWithWebApp(chatId,
                    "✅ <b>Telegram успешно привязан!</b>\n\n" +
                    "Теперь уведомления CareerPilot AI будут приходить сюда.\n" +
                    "Используйте /help для справки.");
            log.info("Telegram bot successfully linked for chatId: {}", chatId);

        } catch (Exception e) {
            log.error("Error handling /start command for chatId: {}", chatId, e);
            try {
                sendHtmlWithWebApp(chatId, "❌ Произошла ошибка при привязке. Пожалуйста, попробуйте позже.");
            } catch (TelegramApiException ex) {
                log.error("Failed to send error message to chatId: {}", chatId, ex);
            }
        }
    }

    // ─── Команда /help ────────────────────────────────────────────────────────
    private void handleHelpCommand(Long chatId) {
        try {
            sendHtmlWithWebApp(chatId, HELP_TEXT);
        } catch (TelegramApiException e) {
            log.error("Failed to send help message to chatId: {}", chatId, e);
        }
    }

    // ─── Админ: /admin ────────────────────────────────────────────────────────
    private void sendAdminHelp(Long chatId) {
        String text =
                "🛠 <b>Панель управления администратора CareerPilot</b>\n\n" +
                "📢 <b>Рассылки:</b>\n" +
                "• <code>/send_messages &lt;сообщение&gt;</code> — Глобальная рассылка всем пользователям бота.\n" +
                "• <code>/test_send_messages &lt;сообщение&gt;</code> — Тестовая отправка только вам.\n\n" +
                "📊 <b>Статистика:</b>\n" +
                "• <code>/users</code> — Статистика пользователей бота.\n\n" +
                "🎁 <b>Подарки:</b>\n" +
                "• <code>/gift_subscription</code> — Выдать PREMIUM подписку пользователю по юзернейму.";
        try {
            sendHtmlSimple(chatId, text);
        } catch (TelegramApiException e) {
            log.error("Failed to send admin help to chatId: {}", chatId, e);
        }
    }

    // ─── Админ: /send_messages ────────────────────────────────────────────────
    private void executeGlobalBroadcast(Long adminChatId, String messageText) {
        String broadcastText = messageText.substring("/send_messages".length()).trim();
        if (broadcastText.isEmpty()) {
            try {
                sendHtmlSimple(adminChatId, "Использование: /send_messages &lt;сообщение&gt;");
            } catch (TelegramApiException e) {
                log.error("Failed to send usage hint", e);
            }
            return;
        }

        List<String> chatIds = preferencesRepository.findAllTelegramChatIds();
        int sent = 0;
        int failed = 0;
        for (String targetChatId : chatIds) {
            try {
                sendHtmlWithWebApp(Long.parseLong(targetChatId), broadcastText);
                sent++;
            } catch (Exception e) {
                log.error("Broadcast failed for chatId: {}", targetChatId, e);
                failed++;
            }
        }

        try {
            sendHtmlSimple(adminChatId,
                    "✅ Рассылка завершена.\n" +
                    "• Отправлено: " + sent + "\n" +
                    "• Ошибок: " + failed);
        } catch (TelegramApiException e) {
            log.error("Failed to send broadcast summary", e);
        }
    }

    // ─── Админ: /test_send_messages ───────────────────────────────────────────
    private void executeTestBroadcast(Long adminChatId, String messageText) {
        String testText = messageText.substring("/test_send_messages".length()).trim();
        if (testText.isEmpty()) {
            try {
                sendHtmlSimple(adminChatId, "Использование: /test_send_messages &lt;сообщение&gt;");
            } catch (TelegramApiException e) {
                log.error("Failed to send usage hint", e);
            }
            return;
        }
        try {
            sendHtmlWithWebApp(adminChatId, "🧪 <b>Тест рассылки:</b>\n\n" + testText);
        } catch (TelegramApiException e) {
            log.error("Failed to send test broadcast", e);
        }
    }

    // ─── Админ: /users ────────────────────────────────────────────────────────
    private void executeFetchUsersStats(Long adminChatId) {
        java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor().submit(() -> {
            try {
                List<com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity> users = authRepository.findAll();
                List<com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity> preferences = preferencesRepository.findAll();
                List<com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionEntity> subscriptions = subscriptionRepository.findAll();

                java.util.Map<UUID, com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity> prefMap = new java.util.HashMap<>();
                for (com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity p : preferences) {
                    prefMap.put(p.getUserId(), p);
                }

                java.util.Map<UUID, com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionEntity> subMap = new java.util.HashMap<>();
                for (com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionEntity s : subscriptions) {
                    subMap.put(s.getUserId(), s);
                }

                int totalUsers = users.size();
                long premiumCount = subscriptions.stream().filter(s -> s.getPlan() == com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionPlan.PREMIUM).count();
                long onboardedCount = preferences.stream().filter(p -> p.isOnboardingCompleted()).count();
                int tgLinkedCount = (int) preferences.stream().filter(p -> p.getTelegramChatId() != null && !p.getTelegramChatId().isEmpty()).count();

                java.time.Instant now = java.time.Instant.now();
                java.time.Instant oneDayAgo = now.minus(24, java.time.temporal.ChronoUnit.HOURS);
                java.time.Instant sevenDaysAgo = now.minus(7, java.time.temporal.ChronoUnit.DAYS);

                long newUsers24h = users.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(oneDayAgo)).count();
                long newUsers7d = users.stream().filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(sevenDaysAgo)).count();

                long premiumPct = totalUsers > 0 ? Math.round((double) premiumCount * 100 / totalUsers) : 0;
                long onboardedPct = totalUsers > 0 ? Math.round((double) onboardedCount * 100 / totalUsers) : 0;

                users.sort((u1, u2) -> {
                    java.time.Instant t1 = u1.getCreatedAt() != null ? u1.getCreatedAt() : java.time.Instant.MIN;
                    java.time.Instant t2 = u2.getCreatedAt() != null ? u2.getCreatedAt() : java.time.Instant.MIN;
                    return t2.compareTo(t1);
                });

                java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                        .ofPattern("dd.MM.yyyy")
                        .withZone(java.time.ZoneId.of("Europe/Moscow"));

                StringBuilder sb = new StringBuilder();
                sb.append("📊 <b>СТАТИСТИКА CAREERPILOT AI</b>\n");
                sb.append("━━━━━━━━━━━━━━━━━━\n");
                sb.append(String.format("👥 <b>Всего пользователей:</b> %d\n", totalUsers));
                sb.append(String.format("⭐ <b>С подпиской (PREMIUM):</b> %d (%d%%)\n", premiumCount, premiumPct));
                sb.append(String.format("🎓 <b>Прошли онбординг:</b> %d (%d%%)\n", onboardedCount, onboardedPct));
                sb.append(String.format("📱 <b>Telegram привязан:</b> %d\n\n", tgLinkedCount));
                sb.append("📈 <b>Активность:</b>\n");
                sb.append(String.format("• Новых за 24ч: %d\n", newUsers24h));
                sb.append(String.format("• Новых за 7 дней: %d\n", newUsers7d));
                sb.append("━━━━━━━━━━━━━━━━━━\n\n");
                sb.append("👤 <b>СПИСОК ПОЛЬЗОВАТЕЛЕЙ:</b>\n\n");

                for (com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity u : users) {
                    com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity pref = prefMap.get(u.getId());
                    com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionEntity sub = subMap.get(u.getId());

                    String usernameInfo = (pref != null && pref.getTelegramUsername() != null && !pref.getTelegramUsername().isBlank())
                            ? "@" + pref.getTelegramUsername().trim()
                            : "нет TG";

                    String fullName = u.getFullName() != null && !u.getFullName().isBlank() ? u.getFullName().trim() : u.getEmail();

                    String onboardingEmoji = (pref != null && pref.isOnboardingCompleted()) ? "✅" : "❌";
                    String premiumEmoji = (sub != null && sub.getPlan() == com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionPlan.PREMIUM) ? "⭐" : "🆓";

                    String regDate = u.getCreatedAt() != null ? dateFormatter.format(u.getCreatedAt()) : "неизвестно";

                    String userLine = String.format(
                        "• <b>%s</b> (%s)\n" +
                        "  Onboard: %s | План: %s\n" +
                        "  Регистрация: <i>%s</i>\n\n",
                        org.springframework.web.util.HtmlUtils.htmlEscape(fullName),
                        usernameInfo,
                        onboardingEmoji,
                        premiumEmoji,
                        regDate
                    );

                    if (sb.length() + userLine.length() > 3900) {
                        sendHtmlSimple(adminChatId, sb.toString());
                        sb = new StringBuilder();
                        sb.append("👤 <b>СПИСОК ПОЛЬЗОВАТЕЛЕЙ (продолжение):</b>\n\n");
                    }
                    sb.append(userLine);
                }

                if (sb.length() > 0) {
                    sendHtmlSimple(adminChatId, sb.toString());
                }

            } catch (Exception e) {
                log.error("Failed to fetch users stats via bot command", e);
                try {
                    sendHtmlSimple(adminChatId, "❌ Ошибка при получении статистики: " + e.getMessage());
                } catch (Exception ex) {}
            }
        });
    }

    // ─── /gift_subscription: Запуск стейт-машины ─────────────────────────────
    private void startGiftSubscriptionFlow(Long chatId) {
        AdminGiftState state = new AdminGiftState();
        state.setStep(AdminGiftState.Step.WAITING_FOR_USERNAME);
        giftStates.putState(chatId, state);
        try {
            sendHtmlSimple(chatId, "🎁 <b>Выдача подарочной подписки</b>\n\nВведите Telegram-username пользователя (без @) или /cancel для отмены:");
        } catch (TelegramApiException e) {
            log.error("Failed to start gift flow", e);
        }
    }

    // ─── /gift_subscription: Шаги диалога ────────────────────────────────────
    private void handleAdminGiftStep(Long chatId, String text) {
        AdminGiftState state = giftStates.getState(chatId).orElse(null);
        if (state == null) return;

        if ("/cancel".equalsIgnoreCase(text.trim())) {
            giftStates.removeState(chatId);
            try {
                sendHtmlSimple(chatId, "❌ Операция отменена.");
            } catch (TelegramApiException e) {
                log.error("Failed to send cancel message", e);
            }
            return;
        }

        try {
            switch (state.getStep()) {
                case WAITING_FOR_USERNAME -> {
                    String username = text.replace("@", "").trim().toLowerCase();
                    Optional<PreferencesEntity> prefsOpt = preferencesRepository.findFirstByTelegramUsernameIgnoreCase(username);
                    if (prefsOpt.isPresent()) {
                        PreferencesEntity prefs = prefsOpt.get();
                        state.setTargetUsername(username);
                        state.setTargetUserId(prefs.getUserId());
                        state.setTargetTelegramChatId(prefs.getTelegramChatId());
                        state.setStep(AdminGiftState.Step.WAITING_FOR_PLAN);
                        giftStates.putState(chatId, state);
                        sendPlanSelection(chatId);
                    } else {
                        sendHtmlSimple(chatId, "❌ Пользователь @" + username + " не найден в базе данных (Telegram не привязан или username неверный).\nПопробуйте снова или /cancel:");
                    }
                }
                case WAITING_FOR_REASON -> {
                    state.setReason(text.trim());
                    state.setStep(AdminGiftState.Step.WAITING_FOR_CONFIRMATION);
                    giftStates.putState(chatId, state);
                    sendConfirmation(chatId);
                }
                case WAITING_FOR_CONFIRMATION -> {
                    if ("ПОДТВЕРЖДАЮ".equalsIgnoreCase(text.trim())) {
                        executeGiftActivation(chatId);
                    } else {
                        sendHtmlSimple(chatId, "⚠️ Для подтверждения введите слово <code>ПОДТВЕРЖДАЮ</code> (или /cancel для отмены):");
                    }
                }
                default -> log.warn("Unexpected gift state: {}", state.getStep());
            }
        } catch (TelegramApiException e) {
            log.error("Error in gift step handling for chatId: {}", chatId, e);
        }
    }

    // ─── Callback для инлайн-кнопок (plan/duration) ───────────────────────────
    private void handleCallbackQuery(Long chatId, String data) {
        AdminGiftState state = giftStates.getState(chatId).orElse(null);
        if (state == null) return;

        try {
            if (data.startsWith("gift_plan_")) {
                state.setPlan(data.substring("gift_plan_".length()));
                state.setStep(AdminGiftState.Step.WAITING_FOR_DURATION);
                giftStates.putState(chatId, state);
                sendDurationSelection(chatId);
            } else if (data.startsWith("gift_dur_")) {
                state.setDurationMonths(Integer.parseInt(data.substring("gift_dur_".length())));
                state.setStep(AdminGiftState.Step.WAITING_FOR_REASON);
                giftStates.putState(chatId, state);
                sendHtmlSimple(chatId, "📝 Введите причину выдачи подписки (будет показана пользователю):");
            }
        } catch (TelegramApiException e) {
            log.error("Error handling callback query for chatId: {}", chatId, e);
        }
    }

    private void sendPlanSelection(Long chatId) throws TelegramApiException {
        InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
        List<List<InlineKeyboardButton>> keyboard = new ArrayList<>();
        keyboard.add(List.of(
                InlineKeyboardButton.builder().text("🆓 FREE").callbackData("gift_plan_FREE").build(),
                InlineKeyboardButton.builder().text("💎 PREMIUM").callbackData("gift_plan_PREMIUM").build()
        ));
        markup.setKeyboard(keyboard);

        SendMessage msg = SendMessage.builder()
                .chatId(chatId)
                .text("Выберите план подписки:")
                .parseMode("HTML")
                .replyMarkup(markup)
                .build();
        execute(msg);
    }

    private void sendDurationSelection(Long chatId) throws TelegramApiException {
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
                InlineKeyboardButton.builder().text("♾ Lifetime (Бессрочно)").callbackData("gift_dur_1188").build()
        ));
        markup.setKeyboard(keyboard);

        SendMessage msg = SendMessage.builder()
                .chatId(chatId)
                .text("Выберите длительность подписки:")
                .parseMode("HTML")
                .replyMarkup(markup)
                .build();
        execute(msg);
    }

    private void sendConfirmation(Long chatId) throws TelegramApiException {
        AdminGiftState state = giftStates.getState(chatId).orElse(null);
        if (state == null) return;
        String durationText = state.getDurationMonths() >= 1188 ? "Бессрочно" : state.getDurationMonths() + " мес.";
        String text = String.format(
                "🏁 <b>ПОДТВЕРЖДЕНИЕ ВЫДАЧИ</b>\n\n" +
                "👤 <b>Кому:</b> @%s\n" +
                "💎 <b>План:</b> %s\n" +
                "⏳ <b>Длительность:</b> %s\n" +
                "📝 <b>Причина:</b> %s\n\n" +
                "Для выполнения операции введите <code>ПОДТВЕРЖДАЮ</code>:",
                state.getTargetUsername(), state.getPlan(), durationText, state.getReason()
        );
        sendHtmlSimple(chatId, text);
    }

    private void executeGiftActivation(Long adminChatId) throws TelegramApiException {
        AdminGiftState state = giftStates.getState(adminChatId).orElse(null);
        if (state == null) return;
        giftStates.removeState(adminChatId);

        try {
            subscriptionService.activateSubscription(
                    state.getTargetUserId(),
                    state.getPlan(),
                    state.getDurationMonths()
            );

            sendHtmlSimple(adminChatId, "✅ Подписка успешно выдана пользователю @" + state.getTargetUsername());

            // Уведомление пользователю (если chatId известен)
            if (state.getTargetTelegramChatId() != null) {
                String durationText = state.getDurationMonths() >= 1188 ? "Бессрочно" : state.getDurationMonths() + " мес.";
                String userMsg = String.format(
                        "🎁 <b>Вам подарок от разработчиков!</b> 🚀\n\n" +
                        "Вам выдана подписка <b>%s</b> на срок: %s.\n" +
                        "📝 Причина: %s",
                        state.getPlan(), durationText, state.getReason()
                );
                sendHtmlWithWebApp(Long.parseLong(state.getTargetTelegramChatId()), userMsg);
            }

        } catch (Exception e) {
            log.error("Gift activation failed for userId: {}", state.getTargetUserId(), e);
            sendHtmlSimple(adminChatId, "❌ Ошибка активации подписки: " + e.getMessage());
        }
    }

    // ─── Вспомогательные методы отправки ─────────────────────────────────────

    /**
     * Отправляет HTML-сообщение с кнопкой открытия WebApp (для пользовательских сообщений).
     */
    private void sendHtmlWithWebApp(Long chatId, String html) throws TelegramApiException {
        WebAppInfo webAppInfo = new WebAppInfo(webAppUrl);

        InlineKeyboardButton webAppBtn = InlineKeyboardButton.builder()
                .text("📱 Открыть CareerPilot")
                .webApp(webAppInfo)
                .build();

        InlineKeyboardMarkup markup = InlineKeyboardMarkup.builder()
                .keyboardRow(List.of(webAppBtn))
                .build();

        SendMessage sendMessage = SendMessage.builder()
                .chatId(chatId)
                .text(html)
                .parseMode("HTML")
                .replyMarkup(markup)
                .build();
        execute(sendMessage);
    }

    /**
     * Отправляет HTML-сообщение без кнопок (для административных сообщений).
     */
    private void sendHtmlSimple(Long chatId, String html) throws TelegramApiException {
        SendMessage sendMessage = SendMessage.builder()
                .chatId(chatId)
                .text(html)
                .parseMode("HTML")
                .build();
        execute(sendMessage);
    }

    /**
     * Публичный метод для отправки уведомлений из других сервисов (NotificationService и т.п.).
     */
    public void sendNotification(String chatId, String html) {
        try {
            sendHtmlWithWebApp(Long.parseLong(chatId), html);
        } catch (Exception e) {
            log.error("Failed to send notification to chatId: {}", chatId, e);
        }
    }

    /**
     * Отправляет оповещение о подходящей вакансии со ссылкой и сопроводительным письмом.
     */
    public void sendVacancyAlert(String chatId, String vacancyUrl, String coverLetter) {
        if (chatId == null || chatId.isBlank()) {
            log.warn("Cannot send vacancy alert, chatId is null/empty");
            sendAdminAlert("Попытка отправить вакансию, но chatId пуст. Ссылка: " + vacancyUrl + "\n\n" +
                    "Что сказать агенту: 'Проверь, почему у пользователя не привязан chatId в preferences при запуске автопоиска.'");
            return;
        }
        String text = "🔥 <b>Найдена новая подходящая вакансия!</b>\n\n" +
                "🔗 <a href=\"" + vacancyUrl + "\">Ссылка на вакансию</a>\n\n" +
                "📝 <b>Сгенерированное сопроводительное письмо:</b>\n" +
                "<code>" + coverLetter + "</code>";
        try {
            sendHtmlWithWebApp(Long.parseLong(chatId), text);
            log.info("Vacancy alert successfully sent to chatId: {}", chatId);
        } catch (Exception e) {
            log.error("Failed to send vacancy alert to chatId: {}", chatId, e);
            sendAdminAlert("Ошибка при отправке вакансии в Telegram для chatId=" + chatId + "\n" +
                    "Ссылка: " + vacancyUrl + "\n" +
                    "Ошибка: " + e.getMessage() + "\n\n" +
                    "Что сказать агенту: 'Проверь работу Telegram бота, доступность Telegram API и валидность chatId пользователя.'");
        }
    }

    /**
     * Отправляет сообщение администратору bigskvishik
     */
    public void sendAdminAlert(String text) {
        try {
            Optional<PreferencesEntity> adminPrefs = preferencesRepository.findFirstByTelegramUsernameIgnoreCase(ADMIN_USERNAME);
            if (adminPrefs.isPresent() && adminPrefs.get().getTelegramChatId() != null) {
                sendHtmlSimple(Long.parseLong(adminPrefs.get().getTelegramChatId()), "⚠️ <b>Системное уведомление для админа:</b>\n\n" + text);
                log.info("Admin alert sent successfully to chatId: {}", adminPrefs.get().getTelegramChatId());
            } else {
                log.warn("Admin preferences or chatId not found. Cannot send admin alert.");
            }
        } catch (Exception e) {
            log.error("Failed to send admin alert", e);
        }
    }
}
