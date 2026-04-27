package com.alexanderpolozhnov.careerpilot.notification.request;

import jakarta.validation.constraints.NotBlank;

public record NotificationRequest(@NotBlank String payload) {
}
