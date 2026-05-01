package com.alexanderpolozhnov.careerpilot.company.repository;

import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<CompanyEntity, UUID>, JpaSpecificationExecutor<CompanyEntity> {
    List<CompanyEntity> findAllByUserId(UUID userId);
    Page<CompanyEntity> findAllByUserId(UUID userId, Pageable pageable);
    Optional<CompanyEntity> findByUserIdAndName(UUID userId, String name);
    Optional<CompanyEntity> findByIdAndUserId(UUID id, UUID userId);
}
