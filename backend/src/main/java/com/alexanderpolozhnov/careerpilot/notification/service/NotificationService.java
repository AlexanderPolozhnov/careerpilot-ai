package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.notification.dto.NotificationDto;

import java.util.UUID;

public interface NotificationService {

    PagedResponse<NotificationDto> list(int page, int size, Boolean read);

    NotificationDto markAsRead(UUID id);
}
