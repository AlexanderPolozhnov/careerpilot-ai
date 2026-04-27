package com.alexanderpolozhnov.careerpilot.interview.entity;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "interviews", schema = "careerpilot", indexes = {
        @Index(name = "idx_interviews_application_id", columnList = "application_id"),
        @Index(name = "idx_interviews_scheduled_at", columnList = "scheduled_at")
})
public class InterviewEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private ApplicationEntity application;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InterviewType type;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(length = 100)
    private String timezone;

    @Column(name = "meeting_link", columnDefinition = "TEXT")
    private String meetingLink;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private InterviewResult result;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
