package com.alexanderpolozhnov.careerpilot.telegram.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TelegramPaymentWebhookRequest {

    @JsonProperty("update_id")
    private Long updateId;

    @JsonProperty("pre_checkout_query")
    private PreCheckoutQuery preCheckoutQuery;

    @JsonProperty("message")
    private Message message;

    @Data
    public static class PreCheckoutQuery {
        private String id;
        private User from;
        private String currency;
        @JsonProperty("total_amount")
        private Integer totalAmount;
        @JsonProperty("invoice_payload")
        private String invoicePayload;
    }

    @Data
    public static class User {
        private Long id;
        @JsonProperty("is_bot")
        private Boolean isBot;
        @JsonProperty("first_name")
        private String firstName;
        @JsonProperty("last_name")
        private String lastName;
        private String username;
    }

    @Data
    public static class Message {
        @JsonProperty("message_id")
        private Long messageId;
        private User from;
        private Chat chat;
        private Long date;
        @JsonProperty("successful_payment")
        private SuccessfulPayment successfulPayment;
    }

    @Data
    public static class Chat {
        private Long id;
        private String type;
    }

    @Data
    public static class SuccessfulPayment {
        private String currency;
        @JsonProperty("total_amount")
        private Integer totalAmount;
        @JsonProperty("invoice_payload")
        private String invoicePayload;
        @JsonProperty("telegram_payment_charge_id")
        private String telegramPaymentChargeId;
        @JsonProperty("provider_payment_charge_id")
        private String providerPaymentChargeId;
    }
}
