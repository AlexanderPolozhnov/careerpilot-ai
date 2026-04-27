package com.alexanderpolozhnov.careerpilot.profile.entity;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "resumes", schema = "careerpilot", indexes = {
        @Index(name = "idx_resumes_user_id", columnList = "user_id"),
        @Index(name = "idx_resumes_active", columnList = "user_id,is_active")
})
public class ResumeEntity extends BaseAuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthEntity user;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(name = "file_url", columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    @Column(name = "is_active", nullable = false)
    private Boolean active = false;
}
