package com.alexanderpolozhnov.careerpilot.interview.request;

import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewResult;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewType;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record InterviewRequest(
        @NotNull UUID applicationId,
        @NotNull InterviewType type,
        @NotNull LocalDateTime scheduledAt,
        String timezone,
        String meetingLink,
        String notes,
        InterviewResult result) {
}
