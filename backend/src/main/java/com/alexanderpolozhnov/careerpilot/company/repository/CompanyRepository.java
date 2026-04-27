package com.alexanderpolozhnov.careerpilot.company.repository;

import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<CompanyEntity, UUID> {
    List<CompanyEntity> findAllByUserId(UUID userId);
    Optional<CompanyEntity> findByUserIdAndName(UUID userId, String name);
    Optional<CompanyEntity> findByIdAndUserId(UUID id, UUID userId);
}
