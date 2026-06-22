package com.alexanderpolozhnov.careerpilot.subscription.repository;

import com.alexanderpolozhnov.careerpilot.subscription.entity.SubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, UUID> {

    Optional<SubscriptionEntity> findByUserId(UUID userId);
}
