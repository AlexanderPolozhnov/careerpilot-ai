package com.alexanderpolozhnov.careerpilot.audit.repository;

import com.alexanderpolozhnov.careerpilot.audit.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {
}
