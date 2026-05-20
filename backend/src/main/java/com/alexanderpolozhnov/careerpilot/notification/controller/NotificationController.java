package com.alexanderpolozhnov.careerpilot.notification.controller;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.notification.dto.NotificationDto;
import com.alexanderpolozhnov.careerpilot.notification.service.NotificationService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Validated
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @GetMapping
    public PagedResponse<NotificationDto> list(
        @Min(0) @RequestParam(defaultValue = "0") int page,
        @Min(1) @Max(1000) @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) Boolean read
    ) {
        return service.list(page, size, read);
    }

    @PatchMapping("/{id}/read")
    public NotificationDto markAsRead(@PathVariable UUID id) {
        return service.markAsRead(id);
    }

    @GetMapping("/unread-count")
    public UnreadCountResponse getUnreadCount() {
        return new UnreadCountResponse(service.getUnreadCount());
    }

    public record UnreadCountResponse(long count) {}
}
