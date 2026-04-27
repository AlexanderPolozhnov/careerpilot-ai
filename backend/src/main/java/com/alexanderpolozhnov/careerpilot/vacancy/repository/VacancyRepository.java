package com.alexanderpolozhnov.careerpilot.vacancy.repository;

import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VacancyRepository extends JpaRepository<VacancyEntity, UUID>, JpaSpecificationExecutor<VacancyEntity> {
    List<VacancyEntity> findAllByUserId(UUID userId);
    List<VacancyEntity> findAllByUserIdAndStatus(UUID userId, VacancyStatus status);
    Optional<VacancyEntity> findByIdAndUserId(UUID id, UUID userId);
}
