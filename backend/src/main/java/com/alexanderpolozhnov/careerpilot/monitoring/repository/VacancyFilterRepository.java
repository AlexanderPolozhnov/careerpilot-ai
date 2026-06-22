package com.alexanderpolozhnov.careerpilot.monitoring.repository;

import com.alexanderpolozhnov.careerpilot.monitoring.entity.VacancyFilterEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VacancyFilterRepository extends JpaRepository<VacancyFilterEntity, UUID> {
    List<VacancyFilterEntity> findByIsActiveTrue();
    List<VacancyFilterEntity> findAllByUserId(UUID userId);
    Optional<VacancyFilterEntity> findByIdAndUserId(UUID id, UUID userId);
}
