package com.alexanderpolozhnov.careerpilot.subscription.service;

import com.alexanderpolozhnov.careerpilot.telegram.dto.TelegramPaymentWebhookRequest;
import java.util.UUID;

public interface PaymentService {
    void handleTelegramWebhook(TelegramPaymentWebhookRequest request);
    String generateStarsInvoiceLink(UUID paymentId, UUID userId);
}
