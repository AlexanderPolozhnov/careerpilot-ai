package com.alexanderpolozhnov.careerpilot.subscription.service;

import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentEntity;
import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentStatus;
import com.alexanderpolozhnov.careerpilot.subscription.repository.PaymentRepository;
import com.alexanderpolozhnov.careerpilot.telegram.dto.TelegramPaymentWebhookRequest;
import com.alexanderpolozhnov.careerpilot.telegram.service.TelegramBotHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.telegram.telegrambots.meta.api.methods.AnswerPreCheckoutQuery;
import org.telegram.telegrambots.meta.api.methods.invoices.CreateInvoiceLink;
import org.telegram.telegrambots.meta.api.objects.payments.LabeledPrice;

import java.util.UUID;

@Slf4j
@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final SubscriptionService subscriptionService;
    private final TelegramBotHandler telegramBotHandler;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            SubscriptionService subscriptionService,
            @Lazy TelegramBotHandler telegramBotHandler) {
        this.paymentRepository = paymentRepository;
        this.subscriptionService = subscriptionService;
        this.telegramBotHandler = telegramBotHandler;
    }

    @Override
    @Transactional
    public void handleTelegramWebhook(TelegramPaymentWebhookRequest request) {
        if (request.getPreCheckoutQuery() != null) {
            handlePreCheckoutQuery(request.getPreCheckoutQuery());
        } else if (request.getMessage() != null && request.getMessage().getSuccessfulPayment() != null) {
            handleSuccessfulPayment(request.getMessage().getSuccessfulPayment());
        } else {
            log.warn("Received unknown Telegram payment webhook request: {}", request);
        }
    }

    private void handlePreCheckoutQuery(TelegramPaymentWebhookRequest.PreCheckoutQuery query) {
        String payload = query.getInvoicePayload();
        log.info("Received pre-checkout query: id={}, payload={}", query.getId(), payload);

        boolean ok = false;
        String errorMsg = null;

        try {
            UUID paymentId = UUID.fromString(payload);
            boolean exists = paymentRepository.existsById(paymentId);
            if (exists) {
                ok = true;
            } else {
                errorMsg = "Payment not found";
            }
        } catch (IllegalArgumentException e) {
            errorMsg = "Invalid payload format";
        }

        try {
            AnswerPreCheckoutQuery answer = AnswerPreCheckoutQuery.builder()
                    .preCheckoutQueryId(query.getId())
                    .ok(ok)
                    .errorMessage(errorMsg)
                    .build();
            telegramBotHandler.execute(answer);
            log.info("Answered pre-checkout query: id={}, ok={}", query.getId(), ok);
        } catch (Exception e) {
            log.error("Failed to answer pre-checkout query: id={}", query.getId(), e);
        }
    }

    private void handleSuccessfulPayment(TelegramPaymentWebhookRequest.SuccessfulPayment payment) {
        String payload = payment.getInvoicePayload();
        log.info("Received successful payment: charge_id={}, payload={}", 
                payment.getTelegramPaymentChargeId(), payload);

        try {
            UUID paymentId = UUID.fromString(payload);
            PaymentEntity paymentEntity = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment not found for payload: " + payload));

            if (paymentEntity.getStatus() == PaymentStatus.COMPLETED) {
                log.info("Payment {} already marked as COMPLETED", paymentId);
                return;
            }

            paymentEntity.setStatus(PaymentStatus.COMPLETED);
            paymentEntity.setProviderPaymentId(payment.getTelegramPaymentChargeId());
            paymentRepository.save(paymentEntity);

            // Активируем подписку PREMIUM на 1 месяц (по умолчанию для Stars оплат)
            subscriptionService.activateSubscription(paymentEntity.getUserId(), "PREMIUM", 1);
            log.info("Subscription activated for user: {} via Telegram Stars payment: {}", 
                    paymentEntity.getUserId(), paymentId);

        } catch (Exception e) {
            log.error("Error processing successful payment for payload: {}", payload, e);
            throw new RuntimeException("Failed to process payment", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String generateStarsInvoiceLink(UUID paymentId, UUID userId) {
        PaymentEntity payment = paymentRepository.findById(paymentId)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Payment not found or access denied: " + paymentId));

        try {
            int starsCount = payment.getAmount().multiply(new java.math.BigDecimal("50"))
                    .setScale(0, java.math.RoundingMode.HALF_UP).intValue();
            if (starsCount <= 0) {
                starsCount = 200;
            }

            CreateInvoiceLink createInvoiceLink = CreateInvoiceLink.builder()
                    .title("CareerPilot Premium")
                    .description("1 Month Premium Subscription for CareerPilot AI")
                    .payload(paymentId.toString())
                    .providerToken("") // Empty for Telegram Stars
                    .currency("XTR")
                    .price(new LabeledPrice("Premium Access", starsCount))
                    .build();

            return telegramBotHandler.execute(createInvoiceLink);
        } catch (Exception e) {
            log.error("Failed to generate stars invoice link for paymentId: {}", paymentId, e);
            throw new RuntimeException("Failed to generate Telegram Stars invoice link", e);
        }
    }
}
