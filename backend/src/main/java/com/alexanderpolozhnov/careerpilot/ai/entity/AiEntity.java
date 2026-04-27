package com.alexanderpolozhnov.careerpilot.ai.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseCreatedAtEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "ai_results", schema = "careerpilot", indexes = {
        @Index(name = "idx_ai_results_user_id", columnList = "user_id"),
        @Index(name = "idx_ai_results_type", columnList = "type"),
        @Index(name = "idx_ai_results_input_hash", columnList = "input_hash"),
        @Index(name = "idx_ai_results_created_at", columnList = "created_at")
})
public class AiEntity extends BaseCreatedAtEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @Column(nullable = false, length = 100)
    private String type;

    @Column(name = "input_hash", nullable = false, length = 128)
    private String inputHash;

    @Column(name = "input_payload", nullable = false, columnDefinition = "TEXT")
    private String inputPayload;

    @Column(name = "output_payload", nullable = false, columnDefinition = "TEXT")
    private String outputPayload;

    @Column(name = "expires_at")
    private Instant expiresAt;
}
