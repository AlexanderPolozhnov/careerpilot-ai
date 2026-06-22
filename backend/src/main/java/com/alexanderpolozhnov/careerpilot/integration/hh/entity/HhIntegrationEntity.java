package com.alexanderpolozhnov.careerpilot.integration.hh.entity;

import com.alexanderpolozhnov.careerpilot.common.entity.BaseAuditableEntity;
import com.alexanderpolozhnov.careerpilot.common.util.EncryptionConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "hh_integrations", schema = "careerpilot")
public class HhIntegrationEntity extends BaseAuditableEntity {

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "hh_user_id", length = 128)
    private String hhUserId;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "access_token", nullable = false, length = 512)
    private String accessToken;

    @Convert(converter = EncryptionConverter.class)
    @Column(name = "refresh_token", length = 512)
    private String refreshToken;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;
}
