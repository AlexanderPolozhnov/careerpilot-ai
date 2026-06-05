package com.alexanderpolozhnov.careerpilot.common.ratelimit;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
@RequiredArgsConstructor
public class RateLimiterAspect {

    private final CurrentUserResolver currentUserResolver;
    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Around("@annotation(rateLimit)")
    public Object rateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String identifier;
        try {
            AuthEntity user = currentUserResolver.resolveRequired();
            identifier = "user:" + user.getId();
        } catch (Exception e) {
            identifier = "ip:" + extractIpAddress();
        }

        String bucketKey = "rate_limit:" + rateLimit.key() + ":" + identifier;

        Bucket bucket = buckets.computeIfAbsent(bucketKey, key -> {
            Bandwidth bandwidth = Bandwidth.classic(
                    rateLimit.capacity(),
                    Refill.greedy(rateLimit.refillTokens(), Duration.ofMinutes(rateLimit.refillDurationMinutes())));
            return Bucket4j.builder()
                    .addLimit(bandwidth)
                    .build();
        });

        if (bucket.tryConsume(1)) {
            return joinPoint.proceed();
        } else {
            throw new RateLimitException("Rate limit exceeded. Please try again later.");
        }
    }

    private String extractIpAddress() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            if (attributes == null) return "unknown";
            HttpServletRequest request = attributes.getRequest();
            String ip = request.getHeader("CF-Connecting-IP");
            if (ip != null && !ip.isBlank()) return ip;
            
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
            
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }
}
