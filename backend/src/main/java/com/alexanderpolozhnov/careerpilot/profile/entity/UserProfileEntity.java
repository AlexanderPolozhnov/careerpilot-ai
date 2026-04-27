package com.alexanderpolozhnov.careerpilot.profile.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "user_profiles", schema = "careerpilot", indexes = @Index(name = "idx_user_profiles_user_id", columnList = "user_id"))
public class UserProfileEntity extends BaseAuditableEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AuthEntity user;

    @Column(name = "desired_position", length = 255)
    private String desiredPosition;

    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level", length = 50)
    private ExperienceLevel experienceLevel;

    @Column(length = 120)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(name = "remote_preference", length = 50)
    private RemotePreference remotePreference;

    @Column(name = "salary_expectation")
    private Integer salaryExpectation;

    @Column(columnDefinition = "TEXT")
    private String summary;
}
