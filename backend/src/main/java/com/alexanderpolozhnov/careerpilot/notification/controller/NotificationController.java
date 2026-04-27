package com.alexanderpolozhnov.careerpilot.notification.controller;

import com.alexanderpolozhnov.careerpilot.notification.request.NotificationRequest;
import com.alexanderpolozhnov.careerpilot.notification.response.NotificationResponse;
import com.alexanderpolozhnov.careerpilot.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService service;

    @PostMapping
    public NotificationResponse create(@Valid @RequestBody NotificationRequest request) {
        return service.create(request);
    }
}
