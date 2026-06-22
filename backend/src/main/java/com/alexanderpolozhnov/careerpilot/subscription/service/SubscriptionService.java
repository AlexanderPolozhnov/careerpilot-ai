package com.alexanderpolozhnov.careerpilot.subscription.service;

import java.util.UUID;

public interface SubscriptionService {

    /**
     * Активирует или обновляет подписку пользователя.
     * Используется для выдачи подписки через бота (/gift_subscription) или после успешной оплаты.
     *
     * @param userId         UUID пользователя
     * @param plan           название плана ("FREE", "PREMIUM")
     * @param durationMonths продолжительность в месяцах; если >= 1188, считается бессрочной (no expiry)
     */
    void activateSubscription(UUID userId, String plan, int durationMonths);

    /**
     * Возвращает текущий план подписки пользователя.
     *
     * @param userId UUID пользователя
     * @return название плана ("FREE", "PREMIUM")
     */
    String getCurrentPlan(UUID userId);
}
