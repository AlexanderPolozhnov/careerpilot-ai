package com.alexanderpolozhnov.careerpilot.application.entity;

import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "application_status_history", schema = "careerpilot", indexes = {
        @Index(name = "idx_app_status_hist_app_id", columnList = "application_id")
})
public class ApplicationStatusHistoryEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false)
    private ApplicationEntity application;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status", length = 50)
    private ApplicationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false, length = 50)
    private ApplicationStatus toStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
