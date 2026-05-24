package com.alexanderpolozhnov.careerpilot.preferences.entity;

import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import com.alexanderpolozhnov.careerpilot.common.util.EncryptionConverter;
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

    @Column(name = "task_reminders", nullable = false)
    private boolean taskReminders = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "ai_provider_mode", nullable = false, length = 50)
    private AiProviderMode aiProviderMode = AiProviderMode.LOCAL;

    @Column(nullable = false, length = 10)
    private String language = "en";

    @Column(name = "application_status_notifications", nullable = false)
    private boolean applicationStatusNotifications = true;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "open_ai_api_key", length = 255)
    private String openAiApiKey;

    @Column(name = "open_ai_model", length = 50)
    private String openAiModel = "gpt-4o";

    @Column(name = "ollama_url", length = 255)
    private String ollamaUrl = "http://localhost:11434";

    @Column(name = "ollama_model", length = 50)
    private String ollamaModel = "llama3";

    @Enumerated(EnumType.STRING)
    @Column(name = "custom_ai_provider", length = 50)
    private CustomAiProvider customAiProvider = CustomAiProvider.OPENAI;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "gemini_api_key", length = 255)
    private String geminiApiKey;

    @Column(name = "gemini_model", length = 50)
    private String geminiModel = "gemini-1.5-flash";

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_provider", nullable = false, length = 50)
    private NotificationProvider notificationProvider = NotificationProvider.EMAIL;

    @Column(name = "telegram_chat_id", length = 100)
    private String telegramChatId;

    @Column(name = "telegram_connect_token")
    private java.util.UUID telegramConnectToken;
}
