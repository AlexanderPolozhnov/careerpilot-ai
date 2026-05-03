package com.alexanderpolozhnov.careerpilot.application.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "applications", schema = "careerpilot",
    uniqueConstraints = @UniqueConstraint(name = "uq_applications_user_vacancy", columnNames = {"user_id", "vacancy_id"}),
    indexes = {
        @Index(name = "idx_applications_user_id", columnList = "user_id"),
        @Index(name = "idx_applications_vacancy_id", columnList = "vacancy_id"),
        @Index(name = "idx_applications_status", columnList = "status"),
        @Index(name = "idx_applications_next_follow_up_at", columnList = "next_follow_up_at")
    })
public class ApplicationEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private VacancyEntity vacancy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ApplicationStatus status = ApplicationStatus.NEW;

    @Column(name = "applied_at")
    private Instant appliedAt;

    @Column(name = "next_follow_up_at")
    private Instant nextFollowUpAt;

    @Column(name = "last_contact_at")
    private Instant lastContactAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "resume_id")
    private String resumeId;
}
