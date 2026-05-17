package com.alexanderpolozhnov.careerpilot.task.response;

import com.alexanderpolozhnov.careerpilot.task.entity.TaskPriority;

import java.time.Instant;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        Instant dueAt,
        boolean done,
        TaskPriority priority,
        UUID applicationId,
        Instant createdAt,
        Instant updatedAt) {
}
