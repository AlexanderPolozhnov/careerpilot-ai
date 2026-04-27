package com.alexanderpolozhnov.careerpilot.vacancy.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vacancies", schema = "careerpilot", indexes = {
        @Index(name = "idx_vacancies_user_id", columnList = "user_id"),
        @Index(name = "idx_vacancies_company_id", columnList = "company_id"),
        @Index(name = "idx_vacancies_status", columnList = "status")
})
public class VacancyEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private CompanyEntity company;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 100)
    private String source;

    @Column(name = "source_url", columnDefinition = "TEXT")
    private String sourceUrl;

    @Column(length = 255)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 50)
    private EmploymentType employmentType;

    @Column(name = "salary_from")
    private Integer salaryFrom;

    @Column(name = "salary_to")
    private Integer salaryTo;

    @Column(length = 10)
    private String currency;

    @Column(name = "description_raw", columnDefinition = "TEXT")
    private String descriptionRaw;

    @Column(name = "description_clean", columnDefinition = "TEXT")
    private String descriptionClean;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private VacancyStatus status = VacancyStatus.NEW;
}
