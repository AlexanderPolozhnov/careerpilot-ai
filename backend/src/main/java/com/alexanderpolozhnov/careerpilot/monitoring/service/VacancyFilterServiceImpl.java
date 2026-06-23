package com.alexanderpolozhnov.careerpilot.monitoring.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.monitoring.entity.VacancyFilterEntity;
import com.alexanderpolozhnov.careerpilot.monitoring.mapper.VacancyFilterMapper;
import com.alexanderpolozhnov.careerpilot.monitoring.repository.VacancyFilterRepository;
import com.alexanderpolozhnov.careerpilot.monitoring.request.VacancyFilterRequest;
import com.alexanderpolozhnov.careerpilot.monitoring.response.VacancyFilterResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class VacancyFilterServiceImpl implements VacancyFilterService {

    private final VacancyFilterRepository vacancyFilterRepository;
    private final CurrentUserResolver currentUserResolver;
    private final VacancyFilterMapper vacancyFilterMapper;

    @Override
    @Transactional(readOnly = true)
    public List<VacancyFilterResponse> getFilters() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        log.info("vacancyFilter.getFilters userId={}", userId);
        return vacancyFilterRepository.findAllByUserId(userId).stream()
                .map(vacancyFilterMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public VacancyFilterResponse createFilter(VacancyFilterRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        log.info("vacancyFilter.createFilter userId={} query={}", user.getId(), request.searchQuery());

        VacancyFilterEntity entity = new VacancyFilterEntity();
        entity.setUser(user);
        vacancyFilterMapper.updateEntity(request, entity);

        if (request.isActive() == null) {
            entity.setIsActive(true);
        }
        if (entity.getPollingInterval() == null) {
            entity.setPollingInterval(30);
        }
        if (entity.getOnlyWithSalary() == null) {
            entity.setOnlyWithSalary(false);
        }

        VacancyFilterEntity saved = vacancyFilterRepository.save(entity);
        return vacancyFilterMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VacancyFilterResponse updateFilter(UUID id, VacancyFilterRequest request) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        log.info("vacancyFilter.updateFilter userId={} filterId={}", userId, id);

        VacancyFilterEntity entity = vacancyFilterRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy filter not found or not owned by you"));

        vacancyFilterMapper.updateEntity(request, entity);
        if (request.isActive() != null) {
            entity.setIsActive(request.isActive());
        }

        VacancyFilterEntity saved = vacancyFilterRepository.save(entity);
        return vacancyFilterMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteFilter(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        log.info("vacancyFilter.deleteFilter userId={} filterId={}", userId, id);

        VacancyFilterEntity entity = vacancyFilterRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy filter not found or not owned by you"));

        vacancyFilterRepository.delete(entity);
    }
}
