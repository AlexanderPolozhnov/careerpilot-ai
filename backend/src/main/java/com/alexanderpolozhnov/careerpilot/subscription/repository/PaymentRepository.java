package com.alexanderpolozhnov.careerpilot.subscription.repository;

import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentEntity;
import com.alexanderpolozhnov.careerpilot.subscription.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    List<PaymentEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<PaymentEntity> findByProviderPaymentId(String providerPaymentId);

    Optional<PaymentEntity> findByIdAndStatus(UUID id, PaymentStatus status);
}
