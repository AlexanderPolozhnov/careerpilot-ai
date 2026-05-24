package com.alexanderpolozhnov.careerpilot.notification.provider;

import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;

public interface NotificationSender {
    NotificationProvider getProvider();
    void send(String toAddressOrChatId, String title, String message);
}
