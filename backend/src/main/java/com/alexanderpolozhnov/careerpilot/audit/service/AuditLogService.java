package com.alexanderpolozhnov.careerpilot.audit.service;

import com.alexanderpolozhnov.careerpilot.audit.entity.AuditLogEntity;
import com.alexanderpolozhnov.careerpilot.audit.repository.AuditLogRepository;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void logAction(UUID userId, String action, String entityType, UUID entityId, String metadataJson) {
        try {
            AuditLogEntity auditLog = new AuditLogEntity();

            if (userId != null) {
                AuthEntity user = new AuthEntity();
                user.setId(userId);
                auditLog.setUser(user);
            }

            auditLog.setAction(action);
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setMetadata(metadataJson);

            auditLogRepository.save(auditLog);
            log.debug("Audit log saved: action={}, entityType={}, entityId={}", action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit log: action={}, entityType={}, entityId={}", action, entityType, entityId,
                    e);
        }
    }
}
