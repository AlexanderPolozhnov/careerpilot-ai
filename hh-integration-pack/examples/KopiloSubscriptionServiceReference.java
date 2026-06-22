// ПРИМЕР СЕРВИСА ПОДПИСОК И ОПЛАТЫ ИЗ KOPILO (SPRING BOOT)
// Данный файл содержит логику создания ссылок на оплату (Checkout URL)
// и расчет стоимости в Telegram Stars (XTR) на основе цены в USD.

package com.alexanderpolozhnov.careerpilot.subscription.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class KopiloSubscriptionServiceReference {

    // Перечисление провайдеров оплаты
    public enum SubscriptionProvider {
        STRIPE,
        YOOKASSA,
        CRYPTOBOT,
        TELEGRAM_STARS,
        ADMIN
    }

    // Перечисление планов
    public enum SubscriptionPlan {
        FREE,
        PREMIUM
    }

    /**
     * Возвращает токен провайдера Telegram Bot API в зависимости от выбранной валюты.
     * Если возвращается пустая строка, это признак выставления счета в Telegram Stars (XTR).
     */
    public String determineProviderToken(String currency) {
        if ("RUB".equalsIgnoreCase(currency)) {
            // Токен ЮKassa, полученный в BotFather, прописанный в переменных окружения
            return System.getenv("TELEGRAM_PROVIDER_TOKEN_YOKASSA");
        } else if ("BYN".equalsIgnoreCase(currency)) {
            // Токен bePaid для Беларуси
            return System.getenv("TELEGRAM_PROVIDER_TOKEN_BEPAID");
        } else {
            // Для всех остальных международных валют (USD, EUR и др.)
            // Используются нативные платежи Telegram Stars:
            // Передается пустая строка, а валюта счета должна быть установлена как "XTR"
            return ""; 
        }
    }

    /**
     * Инициализация платежа и создание Checkout URL
     */
    @Transactional
    public String createCheckoutUrl(
            SubscriptionPlan plan, 
            String promocode, 
            Integer durationMonths, 
            Boolean isGift, 
            SubscriptionProvider provider, 
            UUID giftTargetId,
            UUID userId) {

        if (durationMonths == null) durationMonths = 1;
        if (isGift == null) isGift = false;

        // 1. Расчет базовой цены подписки в USD
        BigDecimal basePrice = switch (plan) {
            case PREMIUM -> new BigDecimal("3.99"); // Пример стоимости PREMIUM в USD
            default -> BigDecimal.ZERO;
        };

        // 2. Полная стоимость за весь период
        BigDecimal originalPrice = basePrice.multiply(BigDecimal.valueOf(durationMonths));
        
        // 3. Вычисление скидки за период (например, 12 месяцев -> 20% скидка)
        int durationDiscount = switch (durationMonths) {
            case 3 -> 10;
            case 6 -> 15;
            case 12 -> 20;
            default -> 0;
        };

        BigDecimal durationDiscountFactor = BigDecimal.valueOf(100 - durationDiscount)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal priceAfterDurationDiscount = originalPrice.multiply(durationDiscountFactor)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal finalPrice = priceAfterDurationDiscount; // Сюда также можно применить промокод

        // 4. Расчет стоимости в Telegram Stars (XTR) по формуле Kopilo:
        // Кол-во звезд = (Цена в USD * (1 - Скидка)) / 0.013
        // Делитель 0.013 учитывает чистый доход со звезды за вычетом 30% комиссии Telegram.
        int finalStars = calculateStars(finalPrice);

        log.info("Subscription checkout - User: {}, Plan: {}, Duration: {} months, Final Price: ${} ({} stars), Provider: {}",
                 userId, plan, durationMonths, finalPrice, finalStars, provider);

        // 5. Роутинг в зависимости от провайдера
        if (provider == SubscriptionProvider.TELEGRAM_STARS) {
            // Создаем пейлоад для верификации оплаты в webhook
            String payload = userId + "|" + plan.name() + "|" + durationMonths + "|" + isGift + "|" + (giftTargetId != null ? giftTargetId.toString() : "");
            String title = "CareerPilot Premium";
            String description = "Premium access for " + durationMonths + " month(s)";

            // Вызываем генерацию инвойс-ссылки (createInvoiceLink) через Telegram Bot API
            // Передаем paymentCurrency = "XTR", providerToken = "" (пустая строка для Stars)
            return createTelegramStarsInvoiceLink(title, description, payload, finalStars);
        } else if (provider == SubscriptionProvider.YOOKASSA) {
            // Логика интеграции ЮKassa API (возвращает ссылку на оплату в RUB)
            return "https://yoomoney.ru/checkout/payments/v2/contract?orderId=...";
        } else if (provider == SubscriptionProvider.CRYPTOBOT) {
            // Логика интеграции CryptoPay REST API (USDT, TON)
            return "https://t.me/CryptoBot?start=pay_...";
        } else {
            // Логика Stripe Checkout
            return "https://checkout.stripe.com/c/pay/cs_test_...";
        }
    }

    private int calculateStars(BigDecimal priceInUsd) {
        if (priceInUsd.compareTo(BigDecimal.ZERO) <= 0) return 0;
        
        // Stars = Price / 0.013
        BigDecimal starsDecimal = priceInUsd.divide(new BigDecimal("0.013"), 0, RoundingMode.HALF_UP);
        int stars = starsDecimal.intValue();
        
        // Округляем до ближайших 10 звезд для красоты
        return ((stars + 5) / 10) * 10;
    }

    private String createTelegramStarsInvoiceLink(String title, String description, String payload, int starsAmount) {
        // Пример вызова Telegram Bot API метода createInvoiceLink
        // curl -X POST https://api.telegram.org/bot<token>/createInvoiceLink
        // params: title, description, payload, provider_token="", currency="XTR", prices=[{label: "Stars", amount: starsAmount}]
        
        log.info("Creating invoice link for Telegram Stars: {} stars, payload: {}", starsAmount, payload);
        
        // Возвращает готовую ссылку вида: https://t.me/p/invoice/...
        return "https://t.me/p/invoice/test_invoice_link";
    }
}
