package com.alexanderpolozhnov.careerpilot.task.request;

import com.alexanderpolozhnov.careerpilot.task.entity.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record TaskRequest(
        @NotBlank @Size(max = 255) String title,
        String description,
        LocalDateTime dueAt,
        Boolean done,
        @NotNull TaskPriority priority,
        UUID applicationId) {
}
