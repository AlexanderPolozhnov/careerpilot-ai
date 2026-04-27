package com.alexanderpolozhnov.careerpilot.vacancy.repository;

import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VacancyRepository extends JpaRepository<VacancyEntity, UUID> {
    List<VacancyEntity> findAllByUserId(UUID userId);
    List<VacancyEntity> findAllByUserIdAndStatus(UUID userId, VacancyStatus status);
}
