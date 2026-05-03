package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.notification.dto.NotificationDto;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import com.alexanderpolozhnov.careerpilot.notification.exception.NotificationException;
import com.alexanderpolozhnov.careerpilot.notification.mapper.NotificationMapper;
import com.alexanderpolozhnov.careerpilot.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserResolver currentUserResolver;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<NotificationDto> list(int page, int size, Boolean read) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<NotificationEntity> result = (read != null)
            ? notificationRepository.findAllByUserIdAndRead(userId, read, pageable)
            : notificationRepository.findAllByUserId(userId, pageable);

        return PagedResponse.fromPage(result.map(notificationMapper::toDto));
    }

    @Override
    @Transactional
    public NotificationDto markAsRead(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        NotificationEntity entity = notificationRepository.findById(id)
            .orElseThrow(() -> new NotificationException("Notification not found: " + id));

        if (!entity.getUser().getId().equals(userId)) {
            throw new NotificationException("Access denied for notification: " + id);
        }

        entity.setRead(true);
        return notificationMapper.toDto(notificationRepository.save(entity));
    }
}
