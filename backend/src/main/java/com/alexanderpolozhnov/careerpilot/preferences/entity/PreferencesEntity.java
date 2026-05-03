package com.alexanderpolozhnov.careerpilot.preferences.entity;

import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "user_preferences", schema = "careerpilot")
public class PreferencesEntity extends BaseAuditableEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "weekly_digest", nullable = false)
    private boolean weeklyDigest = true;

    @Column(name = "interview_reminders", nullable = false)
    private boolean interviewReminders = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_provider_mode", nullable = false, length = 50)
    private AiProviderMode aiProviderMode = AiProviderMode.LOCAL;

    @Column(nullable = false, length = 10)
    private String language = "en";
}
