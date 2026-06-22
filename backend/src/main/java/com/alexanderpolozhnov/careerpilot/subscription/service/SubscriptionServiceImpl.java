package com.alexanderpolozhnov.careerpilot.subscription.service;

import com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionEntity;
import com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionPlan;
import com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionStatus;
import com.alexanderpolozhnov.careerpilot.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final int LIFETIME_THRESHOLD_MONTHS = 1188;

    private final SubscriptionRepository subscriptionRepository;

    @Override
    @Transactional
    public void activateSubscription(UUID userId, String planName, int durationMonths) {
        SubscriptionPlan plan = SubscriptionPlan.valueOf(planName.toUpperCase());

        SubscriptionEntity subscription = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> {
                    SubscriptionEntity newSub = new SubscriptionEntity();
                    newSub.setUserId(userId);
                    return newSub;
                });

        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        if (durationMonths >= LIFETIME_THRESHOLD_MONTHS) {
            subscription.setExpiresAt(null); // бессрочная подписка
        } else {
            Instant now = Instant.now();
            // Если есть активная подписка — продлеваем от текущего expiresAt
            Instant base = (subscription.getExpiresAt() != null && subscription.getExpiresAt().isAfter(now))
                    ? subscription.getExpiresAt()
                    : now;
            subscription.setExpiresAt(base.plus(durationMonths * 30L, ChronoUnit.DAYS));
        }

        subscriptionRepository.save(subscription);
        log.info("Subscription activated: userId={}, plan={}, durationMonths={}", userId, plan, durationMonths);
    }

    @Override
    @Transactional(readOnly = true)
    public String getCurrentPlan(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .map(sub -> {
                    // Если подписка истекла — возвращаем FREE
                    if (sub.getExpiresAt() != null && sub.getExpiresAt().isBefore(Instant.now())) {
                        return SubscriptionPlan.FREE.name();
                    }
                    return sub.getPlan().name();
                })
                .orElse(SubscriptionPlan.FREE.name());
    }
}
