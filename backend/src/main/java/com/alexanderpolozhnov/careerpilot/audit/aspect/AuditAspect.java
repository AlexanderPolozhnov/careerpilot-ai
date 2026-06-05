package com.alexanderpolozhnov.careerpilot.audit.aspect;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.audit.service.AuditLogService;
import com.alexanderpolozhnov.careerpilot.auth.response.AuthResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;
    private final CurrentUserResolver currentUserResolver;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void auditAction(Auditable auditable, Object result) {
        try {
            // Extract IP address BEFORE async call (critical - RequestContextHolder not available in async thread)
            String ipAddress = extractIpAddress();
            
            // Extract userId
            UUID userId = extractUserId(result);
            
            // Extract entityId from result if possible
            UUID entityId = extractEntityId(result);
            
            // Build metadata JSON with IP address
            String metadataJson = buildMetadata(ipAddress);
            
            // Call async service
            auditLogService.logAction(
                userId,
                auditable.action(),
                auditable.entityType(),
                entityId,
                metadataJson
            );
            
        } catch (Exception e) {
            log.error("Failed to audit action: {}", auditable.action(), e);
        }
    }

    private String extractIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("CF-Connecting-IP");
            if (ip != null && !ip.isBlank()) return ip;
            
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
            
            return request.getRemoteAddr();
        } catch (Exception e) {
            log.debug("Failed to extract IP address", e);
            return null;
        }
    }

    private UUID extractUserId(Object result) {
        // Try SecurityContext first (for authenticated requests)
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() 
                && !"anonymousUser".equals(authentication.getPrincipal())) {
                // Fetch the user using the existing resolver
                return currentUserResolver.resolveRequired().getId();
            }
        } catch (Exception e) {
            log.debug("Failed to extract userId from SecurityContext", e);
        }
        
        // If SecurityContext is empty, try to extract from AuthResponse (for login/register)
        if (result instanceof AuthResponse authResponse) {
            return authResponse.user().id();
        }
        
        return null;
    }

    private UUID extractEntityId(Object result) {
        // Try to extract ID from various DTO types
        if (result == null) {
            return null;
        }
        
        try {
            // Use reflection to get 'id' field if it exists
            var idField = result.getClass().getDeclaredField("id");
            idField.setAccessible(true);
            Object idValue = idField.get(result);
            if (idValue instanceof UUID uuid) {
                return uuid;
            }
        } catch (NoSuchFieldException | IllegalAccessException e) {
            // No 'id' field or not accessible, that's fine
        }
        
        return null;
    }

    private String buildMetadata(String ipAddress) {
        try {
            Map<String, Object> metadata = new HashMap<>();
            if (ipAddress != null) {
                metadata.put("ipAddress", ipAddress);
            }
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.debug("Failed to build metadata JSON", e);
            return null;
        }
    }
}
