package com.alexanderpolozhnov.careerpilot.vacancy.repository;

import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.lang.Nullable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VacancyRepository extends JpaRepository<VacancyEntity, UUID>, JpaSpecificationExecutor<VacancyEntity> {
    List<VacancyEntity> findAllByUserId(UUID userId);

    List<VacancyEntity> findAllByUserIdAndStatus(UUID userId, VacancyStatus status);

    @EntityGraph(attributePaths = { "company" })
    List<VacancyEntity> findAllByUserIdAndTitleContainingIgnoreCase(UUID userId, String title);

    @EntityGraph(attributePaths = { "company" })
    Optional<VacancyEntity> findByIdAndUserId(UUID id, UUID userId);

    @Override
    @EntityGraph(attributePaths = { "company" })
    Page<VacancyEntity> findAll(@Nullable Specification<VacancyEntity> spec, Pageable pageable);
}
