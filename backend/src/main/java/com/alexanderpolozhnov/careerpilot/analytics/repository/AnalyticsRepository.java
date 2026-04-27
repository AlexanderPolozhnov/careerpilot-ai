package com.alexanderpolozhnov.careerpilot.analytics.repository;

import com.alexanderpolozhnov.careerpilot.analytics.entity.AnalyticsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AnalyticsRepository extends JpaRepository<AnalyticsEntity, UUID> {
}
