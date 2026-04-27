package com.alexanderpolozhnov.careerpilot.company.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "companies", schema = "careerpilot",
        uniqueConstraints = @UniqueConstraint(name = "uq_companies_user_name", columnNames = {"user_id", "name"}),
        indexes = {
                @Index(name = "idx_companies_user_id", columnList = "user_id"),
                @Index(name = "idx_companies_name", columnList = "name")
        })
public class CompanyEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String industry;
}
