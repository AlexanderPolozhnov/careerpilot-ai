package com.alexanderpolozhnov.careerpilot.interview.response;

import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewResult;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewType;

import java.time.Instant;
import java.util.UUID;

public record InterviewResponse(
        UUID id,
        UUID applicationId,
        InterviewType type,
        Instant scheduledAt,
        String timezone,
        String meetingLink,
        InterviewResult result,
        String notes) {
}
