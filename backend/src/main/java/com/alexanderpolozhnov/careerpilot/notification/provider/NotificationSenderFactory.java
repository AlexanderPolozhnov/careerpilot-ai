package com.alexanderpolozhnov.careerpilot.notification.provider;

import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class NotificationSenderFactory {

    private final Map<NotificationProvider, NotificationSender> senders = new EnumMap<>(NotificationProvider.class);

    @Autowired
    public NotificationSenderFactory(List<NotificationSender> senderList) {
        for (NotificationSender sender : senderList) {
            senders.put(sender.getProvider(), sender);
        }
    }

    public NotificationSender getSender(NotificationProvider provider) {
        NotificationSender sender = senders.get(provider);
        if (sender == null) {
            throw new IllegalArgumentException("Unsupported notification provider: " + provider);
        }
        return sender;
    }
}
