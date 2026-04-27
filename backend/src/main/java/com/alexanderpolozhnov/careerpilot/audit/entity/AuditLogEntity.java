package com.alexanderpolozhnov.careerpilot.audit.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseCreatedAtEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "audit_logs", schema = "careerpilot", indexes = {
        @Index(name = "idx_audit_logs_user_id", columnList = "user_id"),
        @Index(name = "idx_audit_logs_entity_type", columnList = "entity_type"),
        @Index(name = "idx_audit_logs_entity_id", columnList = "entity_id"),
        @Index(name = "idx_audit_logs_created_at", columnList = "created_at")
})
public class AuditLogEntity extends BaseCreatedAtEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AuthEntity user;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(columnDefinition = "jsonb")
    private String metadata;
}
