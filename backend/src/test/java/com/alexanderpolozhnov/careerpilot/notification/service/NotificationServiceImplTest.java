package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.notification.dto.NotificationDto;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationChannel;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationStatus;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.notification.exception.NotificationException;
import com.alexanderpolozhnov.careerpilot.notification.mapper.NotificationMapper;
import com.alexanderpolozhnov.careerpilot.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private CurrentUserResolver currentUserResolver;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private AuthEntity currentUser;
    private AuthEntity otherUser;
    private NotificationEntity notification;

    @BeforeEach
    void setUp() {
        currentUser = new AuthEntity();
        currentUser.setId(UUID.randomUUID());
        currentUser.setEmail("user@example.com");

        otherUser = new AuthEntity();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");

        notification = new NotificationEntity();
        notification.setId(UUID.randomUUID());
        notification.setUser(currentUser);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setType(NotificationType.SYSTEM);
        notification.setTitle("Test notification");
        notification.setMessage("Test message");
        notification.setStatus(NotificationStatus.SENT);
        notification.setRead(false);
        notification.setCreatedAt(Instant.now());
    }

    @Test
    void listReturnsOnlyCurrentUserNotifications() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        PageRequest pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(notificationRepository.findAllByUserId(eq(currentUser.getId()), any()))
            .thenReturn(new PageImpl<>(List.of(notification), pageable, 1));

        NotificationDto dto = new NotificationDto(
            notification.getId(), currentUser.getId(), NotificationType.SYSTEM,
            "Test notification", "Test message", false, notification.getCreatedAt());
        when(notificationMapper.toDto(notification)).thenReturn(dto);

        PagedResponse<NotificationDto> result = notificationService.list(0, 20, null);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).userId()).isEqualTo(currentUser.getId());
    }

    @Test
    void listFiltersByReadFalse() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        PageRequest pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"));
        when(notificationRepository.findAllByUserIdAndRead(eq(currentUser.getId()), eq(false), any()))
            .thenReturn(new PageImpl<>(List.of(notification), pageable, 1));

        NotificationDto dto = new NotificationDto(
            notification.getId(), currentUser.getId(), NotificationType.SYSTEM,
            "Test notification", "Test message", false, notification.getCreatedAt());
        when(notificationMapper.toDto(notification)).thenReturn(dto);

        PagedResponse<NotificationDto> result = notificationService.list(0, 20, false);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).read()).isFalse();
    }

    @Test
    void markAsReadChangesStatus() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(NotificationEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificationDto dto = new NotificationDto(
            notification.getId(), currentUser.getId(), NotificationType.SYSTEM,
            "Test notification", "Test message", true, notification.getCreatedAt());
        when(notificationMapper.toDto(any(NotificationEntity.class))).thenReturn(dto);

        NotificationDto result = notificationService.markAsRead(notification.getId());

        assertThat(result.read()).isTrue();
        assertThat(notification.isRead()).isTrue();
    }

    @Test
    void markAsReadThrowsForOtherUserNotification() {
        when(currentUserResolver.resolveRequired()).thenReturn(otherUser);
        when(notificationRepository.findById(notification.getId())).thenReturn(Optional.of(notification));

        assertThatThrownBy(() -> notificationService.markAsRead(notification.getId()))
            .isInstanceOf(NotificationException.class)
            .hasMessageContaining("Access denied");
    }

    @Test
    void markAsReadThrowsForNotFound() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        UUID unknownId = UUID.randomUUID();
        when(notificationRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(unknownId))
            .isInstanceOf(NotificationException.class)
            .hasMessageContaining("Notification not found");
    }
}
