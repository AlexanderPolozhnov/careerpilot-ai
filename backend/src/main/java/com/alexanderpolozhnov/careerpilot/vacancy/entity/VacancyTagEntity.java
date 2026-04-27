package com.alexanderpolozhnov.careerpilot.vacancy.entity;

import com.alexanderpolozhnov.careerpilot.common.entity.BaseCreatedAtEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "vacancy_tags", schema = "careerpilot",
        uniqueConstraints = @UniqueConstraint(name = "uq_vacancy_tags_vacancy_tag", columnNames = {"vacancy_id", "tag"}),
        indexes = {
                @Index(name = "idx_vacancy_tags_vacancy_id", columnList = "vacancy_id"),
                @Index(name = "idx_vacancy_tags_tag", columnList = "tag")
        })
public class VacancyTagEntity extends BaseCreatedAtEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vacancy_id", nullable = false)
    private VacancyEntity vacancy;

    @Column(nullable = false, length = 100)
    private String tag;
}
