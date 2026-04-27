package com.alexanderpolozhnov.careerpilot.task.entity;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "tasks", schema = "careerpilot", indexes = {
        @Index(name = "idx_tasks_user_id", columnList = "user_id"),
        @Index(name = "idx_tasks_application_id", columnList = "application_id"),
        @Index(name = "idx_tasks_due_at", columnList = "due_at"),
        @Index(name = "idx_tasks_done", columnList = "done")
})
public class TaskEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id")
    private ApplicationEntity application;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(nullable = false)
    private Boolean done = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TaskPriority priority = TaskPriority.MEDIUM;
}
