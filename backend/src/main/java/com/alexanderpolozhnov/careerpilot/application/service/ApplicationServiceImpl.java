package com.alexanderpolozhnov.careerpilot.application.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.application.exception.ApplicationNotFoundException;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest;
import com.alexanderpolozhnov.careerpilot.application.request.UpdateApplicationStatusRequest;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardCompanyResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardItemResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardVacancyResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationResponse;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    @Transactional
    public ApplicationResponse create(ApplicationRequest request) {
        AuthEntity currentUser = currentUserResolver.resolveRequired();
        UUID userId = currentUser.getId();

        // Проверяем, что вакансия принадлежит текущему пользователю
        VacancyEntity vacancy = vacancyRepository.findByIdAndUserId(request.vacancyId(), userId)
            .orElseThrow(() -> new IllegalArgumentException("Vacancy not found: " + request.vacancyId()));

        ApplicationEntity entity = new ApplicationEntity();
        entity.setUser(currentUser);
        entity.setVacancy(vacancy);
        entity.setStatus(request.status() != null ? request.status() : ApplicationStatus.NEW);
        entity.setNotes(request.notes());
        entity.setAppliedAt(request.appliedAt());
        entity.setResumeId(request.resumeId());

        ApplicationEntity saved = applicationRepository.save(entity);
        log.info("applications.create userId={} vacancyId={} id={}", userId, request.vacancyId(), saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ApplicationResponse> list(int page, int size, ApplicationStatus status, UUID vacancyId) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        Pageable pageable = PageRequest.of(
            Math.max(page, 0),
            Math.max(size, 1),
            Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<ApplicationEntity> resultPage;
        if (status != null && vacancyId != null) {
            resultPage = applicationRepository.findAllByUserIdAndStatusAndVacancyId(userId, status, vacancyId,
                pageable);
        } else if (status != null) {
            resultPage = applicationRepository.findAllByUserIdAndStatus(userId, status, pageable);
        } else if (vacancyId != null) {
            resultPage = applicationRepository.findAllByUserIdAndVacancyId(userId, vacancyId, pageable);
        } else {
            resultPage = applicationRepository.findAllByUserId(userId, pageable);
        }

        log.info("applications.list userId={} page={} size={} total={}", userId, page, size,
            resultPage.getTotalElements());
        return PagedResponse.fromPage(resultPage.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<ApplicationBoardItemResponse>> board() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        Map<String, List<ApplicationBoardItemResponse>> result = new LinkedHashMap<>();
        result.put("NEW", new ArrayList<>());
        result.put("SAVED", new ArrayList<>());
        result.put("APPLIED", new ArrayList<>());
        result.put("HR_SCREEN", new ArrayList<>());
        result.put("TECH_INTERVIEW", new ArrayList<>());
        result.put("FINAL_ROUND", new ArrayList<>());
        result.put("OFFER", new ArrayList<>());
        result.put("REJECTED", new ArrayList<>());

        for (ApplicationEntity entity : applicationRepository.findAllByUserId(userId)) {
            String statusKey = mapStatusForFrontend(entity);
            ApplicationBoardCompanyResponse company = entity.getVacancy().getCompany() == null
                ? null
                : new ApplicationBoardCompanyResponse(
                entity.getVacancy().getCompany().getId().toString(),
                entity.getVacancy().getCompany().getName()
            );
            ApplicationBoardVacancyResponse vacancy = new ApplicationBoardVacancyResponse(
                entity.getVacancy().getId().toString(),
                entity.getVacancy().getTitle(),
                entity.getVacancy().getLocation(),
                company
            );
            ApplicationBoardItemResponse item = new ApplicationBoardItemResponse(
                entity.getId(),
                entity.getVacancy().getId().toString(),
                vacancy,
                statusKey,
                entity.getAppliedAt(),
                entity.getNotes(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
            );
            result.computeIfAbsent(statusKey, key -> new ArrayList<>()).add(item);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getById(UUID id) {
        return toResponse(findOwnedApplication(id));
    }

    @Override
    @Transactional
    public ApplicationResponse update(UUID id, ApplicationRequest request) {
        AuthEntity currentUser = currentUserResolver.resolveRequired();
        ApplicationEntity entity = findOwnedApplication(id);

        // Обновляем вакансию, если передана новая
        if (request.vacancyId() != null) {
            VacancyEntity vacancy = vacancyRepository.findByIdAndUserId(request.vacancyId(), currentUser.getId())
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found: " + request.vacancyId()));
            entity.setVacancy(vacancy);
        }
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (request.notes() != null) {
            entity.setNotes(request.notes());
        }
        if (request.appliedAt() != null) {
            entity.setAppliedAt(request.appliedAt());
        }
        if (request.resumeId() != null) {
            entity.setResumeId(request.resumeId());
        }

        return toResponse(applicationRepository.save(entity));
    }

    @Override
    @Transactional
    public ApplicationResponse updateStatus(UUID id, UpdateApplicationStatusRequest request) {
        ApplicationEntity entity = findOwnedApplication(id);
        entity.setStatus(mapStatusFromFrontend(request.status()));
        return toResponse(applicationRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        applicationRepository.delete(findOwnedApplication(id));
    }

    /**
     * Находит заявку по id и проверяет ownership. Возвращает 404 если не найдена или чужая.
     */
    private ApplicationEntity findOwnedApplication(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        ApplicationEntity entity = applicationRepository.findById(id)
            .orElseThrow(() -> new ApplicationNotFoundException(id));
        if (!entity.getUser().getId().equals(userId)) {
            // Возвращаем 404 вместо 403, чтобы не раскрывать существование чужих заявок
            throw new ApplicationNotFoundException(id);
        }
        return entity;
    }

    private ApplicationResponse toResponse(ApplicationEntity entity) {
        return new ApplicationResponse(
            entity.getId(),
            entity.getVacancy().getId(),
            entity.getStatus(),
            entity.getNotes(),
            entity.getAppliedAt(),
            entity.getResumeId(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    private String mapStatusForFrontend(ApplicationEntity entity) {
        if (entity.getStatus() == null) {
            return "NEW";
        }
        if (entity.getStatus() == ApplicationStatus.FINAL) {
            return "FINAL_ROUND";
        }
        if (entity.getStatus() == ApplicationStatus.ARCHIVED) {
            return "REJECTED";
        }
        return entity.getStatus().name();
    }

    private ApplicationStatus mapStatusFromFrontend(String frontendStatus) {
        String normalized = frontendStatus == null ? "" : frontendStatus.trim().toUpperCase(Locale.ROOT);
        if (normalized.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        if ("FINAL_ROUND".equals(normalized)) {
            return ApplicationStatus.FINAL;
        }
        try {
            return ApplicationStatus.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Unsupported status: " + frontendStatus);
        }
    }
}
