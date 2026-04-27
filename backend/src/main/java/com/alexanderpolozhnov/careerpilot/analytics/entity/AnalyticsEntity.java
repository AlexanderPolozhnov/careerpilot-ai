package com.alexanderpolozhnov.careerpilot.analytics.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "analytics_placeholder")
public class AnalyticsEntity {
    @Id
    private UUID id;
}
