package com.alexanderpolozhnov.careerpilot.telegram.service;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Хранит состояние пошагового диалога выдачи подарочной подписки для администратора.
 * Экземпляры хранятся в ConcurrentHashMap по adminChatId в TelegramBotHandler.
 */
@Getter
@Setter
public class AdminGiftState {

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
    private String targetTelegramChatId;
    private String plan;
    private int durationMonths;
    private String reason;
}
