package com.alexanderpolozhnov.careerpilot.notification.controller;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.notification.dto.NotificationDto;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    @Mock
    private NotificationService notificationService;

    @Test
    @Disabled("TODO: добавить integration security test с реальным SecurityFilterChain")
    void unauthorizedRequestReturns401() {
    }

    @Test
    void listNotificationsReturnsPagedResponse() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new NotificationController(notificationService)).build();

        UUID userId = UUID.randomUUID();
        NotificationDto dto = notificationDto(userId, false);
        when(notificationService.list(0, 20, null))
            .thenReturn(new PagedResponse<>(List.of(dto), 1, 1, 20, 0, true, true));

        mockMvc.perform(get("/api/notifications"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].title").value("Interview at Acme"))
            .andExpect(jsonPath("$.content[0].read").value(false));
    }

    @Test
    void listNotificationsWithReadFilter() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new NotificationController(notificationService)).build();

        UUID userId = UUID.randomUUID();
        NotificationDto dto = notificationDto(userId, false);
        when(notificationService.list(0, 20, false))
            .thenReturn(new PagedResponse<>(List.of(dto), 1, 1, 20, 0, true, true));

        mockMvc.perform(get("/api/notifications").param("read", "false"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].read").value(false));
    }

    @Test
    void markAsReadReturnsUpdatedNotification() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new NotificationController(notificationService)).build();

        UUID userId = UUID.randomUUID();
        UUID notifId = UUID.randomUUID();
        NotificationDto dto = new NotificationDto(notifId, userId, NotificationType.SYSTEM,
            "Interview at Acme", "Your interview is tomorrow", true, Instant.now());
        when(notificationService.markAsRead(eq(notifId))).thenReturn(dto);

        mockMvc.perform(patch("/api/notifications/" + notifId + "/read"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.read").value(true));
    }

    private NotificationDto notificationDto(UUID userId, boolean read) {
        return new NotificationDto(
            UUID.randomUUID(),
            userId,
            NotificationType.INTERVIEW_REMINDER,
            "Interview at Acme",
            "Your interview is tomorrow",
            read,
            Instant.now()
        );
    }
}
