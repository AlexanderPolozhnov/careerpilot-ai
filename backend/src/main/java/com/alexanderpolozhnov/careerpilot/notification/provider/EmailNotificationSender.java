package com.alexanderpolozhnov.careerpilot.notification.provider;

import com.alexanderpolozhnov.careerpilot.notification.service.EmailService;
import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EmailNotificationSender implements NotificationSender {

    private final EmailService emailService;

    @Override
    public NotificationProvider getProvider() {
        return NotificationProvider.EMAIL;
    }

    @Override
    public void send(String toAddressOrChatId, String title, String message) {
        emailService.sendReminderEmail(toAddressOrChatId, title, message);
    }
}
