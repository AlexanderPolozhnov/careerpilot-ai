package com.alexanderpolozhnov.careerpilot.monitoring.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "user_vacancy_filters", schema = "careerpilot")
public class VacancyFilterEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @Column(name = "search_query", nullable = false, length = 256)
    private String searchQuery;

    @Column(name = "target_salary")
    private Integer targetSalary;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_polled_at")
    private Instant lastPolledAt;
}
