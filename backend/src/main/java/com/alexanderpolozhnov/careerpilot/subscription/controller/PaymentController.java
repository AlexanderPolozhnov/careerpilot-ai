package com.alexanderpolozhnov.careerpilot.subscription.controller;

import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentEntity;
import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentProvider;
import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentStatus;
import com.alexanderpolozhnov.careerpilot.subscription.repository.PaymentRepository;
import com.alexanderpolozhnov.careerpilot.subscription.service.PaymentService;
import com.alexanderpolozhnov.careerpilot.telegram.dto.TelegramPaymentWebhookRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${telegram.bot.username:careerpilot_ai_bot}")
    private String botUsername;

    @Value("${telegram.miniapp.name:app}")
    private String miniAppName;

    private final PaymentRepository paymentRepository;
    private final CurrentUserResolver currentUserResolver;
    private final PaymentService paymentService;

    /**
     * POST /api/payments/stars/initiate
     *
     * Создаёт запись о платеже со статусом PENDING и возвращает deep-link
     * для перехода в Telegram Mini App с параметром pay_stars_<paymentId>.
     *
     * Request body: { "plan": "PREMIUM", "durationMonths": 1 }
     * Response: { "paymentId": "...", "deepLink": "https://t.me/bot/app?startapp=pay_stars_..." }
     */
    @PostMapping("/stars/initiate")
    public ResponseEntity<Map<String, String>> initiateStarsPayment(
            @RequestBody Map<String, Object> body) {

        UUID userId = currentUserResolver.resolveRequired().getId();

        // Создаём запись платежа в БД
        PaymentEntity payment = new PaymentEntity();
        payment.setUserId(userId);
        payment.setAmount(new BigDecimal("3.99")); // базовая цена в USD
        payment.setCurrency("XTR");               // Telegram Stars
        payment.setProvider(PaymentProvider.STARS);
        payment.setStatus(PaymentStatus.PENDING);

        PaymentEntity saved = paymentRepository.save(payment);
        String paymentId = saved.getId().toString();

        // Формируем deep-link для Telegram Mini App
        String startParam = "pay_stars_" + paymentId;
        String deepLink = "https://t.me/" + botUsername + "/" + miniAppName + "?startapp=" + startParam;

        log.info("Stars payment initiated: userId={}, paymentId={}", userId, paymentId);

        return ResponseEntity.ok(Map.of(
                "paymentId", paymentId,
                "deepLink", deepLink
        ));
    }

    /**
     * GET /api/payments/stars/{paymentId}/status
     * Проверяет статус платежа по ID.
     */
    @GetMapping("/stars/{paymentId}/status")
    public ResponseEntity<Map<String, String>> getPaymentStatus(@PathVariable UUID paymentId) {
        UUID userId = currentUserResolver.resolveRequired().getId();

        PaymentEntity payment = paymentRepository.findById(paymentId)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        return ResponseEntity.ok(Map.of(
                "paymentId", paymentId.toString(),
                "status", payment.getStatus().name()
        ));
    }

    /**
     * GET /api/payments/stars/{paymentId}/invoice
     * Создает и возвращает ссылку на нативную оплату в Telegram Stars.
     */
    @GetMapping("/stars/{paymentId}/invoice")
    public ResponseEntity<Map<String, String>> getStarsInvoiceLink(@PathVariable UUID paymentId) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        String invoiceLink = paymentService.generateStarsInvoiceLink(paymentId, userId);
        return ResponseEntity.ok(Map.of("invoiceLink", invoiceLink));
    }

    /**
     * POST /api/payments/webhook/telegram
     * Обработка webhook от Telegram.
     */
    @PostMapping("/webhook/telegram")
    public ResponseEntity<Void> handleTelegramWebhook(@RequestBody TelegramPaymentWebhookRequest request) {
        log.info("Telegram payment webhook received: {}", request);
        paymentService.handleTelegramWebhook(request);
        return ResponseEntity.ok().build();
    }
}
