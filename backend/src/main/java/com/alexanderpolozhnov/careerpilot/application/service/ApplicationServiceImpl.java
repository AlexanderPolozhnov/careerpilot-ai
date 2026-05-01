package com.alexanderpolozhnov.careerpilot.application.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardCompanyResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardItemResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardVacancyResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationResponse;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public ApplicationResponse create(ApplicationRequest request) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        VacancyEntity vacancy = vacancyRepository.findAllByUserId(userId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Create vacancy first"));

        ApplicationEntity entity = new ApplicationEntity();
        entity.setUser(currentUserResolver.resolveOrCreate());
        entity.setVacancy(vacancy);
        entity.setNotes(request.payload());
        return toResponse(applicationRepository.save(entity));
    }

    @Override
    public List<ApplicationResponse> list(int page, int size, String sortBy, String direction, String q) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        Comparator<ApplicationEntity> comparator = buildComparator(sortBy);
        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }
        final String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);

        List<ApplicationEntity> filtered = applicationRepository.findAllByUserId(userId).stream()
                .filter(entity -> query.isBlank() || asSearchableText(entity).contains(query))
                .sorted(comparator)
                .toList();
        log.info("applications.list userId={} page={} size={} total={}",
                userId, page, size, filtered.size());
        return paginate(filtered, page, size).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<ApplicationBoardItemResponse>> board() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        Map<String, List<ApplicationBoardItemResponse>> result = new LinkedHashMap<>();
        result.put("NEW", new java.util.ArrayList<>());
        result.put("SAVED", new java.util.ArrayList<>());
        result.put("APPLIED", new java.util.ArrayList<>());
        result.put("HR_SCREEN", new java.util.ArrayList<>());
        result.put("TECH_INTERVIEW", new java.util.ArrayList<>());
        result.put("FINAL_ROUND", new java.util.ArrayList<>());
        result.put("OFFER", new java.util.ArrayList<>());
        result.put("REJECTED", new java.util.ArrayList<>());

        for (ApplicationEntity entity : applicationRepository.findAllByUserId(userId)) {
            String status = mapStatusForFrontend(entity);
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
                    status,
                    entity.getAppliedAt(),
                    entity.getNotes(),
                    entity.getCreatedAt(),
                    entity.getUpdatedAt()
            );
            result.computeIfAbsent(status, key -> new java.util.ArrayList<>()).add(item);
        }
        return result;
    }

    @Override
    public ApplicationResponse getById(UUID id) {
        return toResponse(findOwnedApplication(id));
    }

    @Override
    public ApplicationResponse update(UUID id, ApplicationRequest request) {
        ApplicationEntity entity = findOwnedApplication(id);
        entity.setNotes(request.payload());
        return toResponse(applicationRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        applicationRepository.delete(findOwnedApplication(id));
    }

    private ApplicationEntity findOwnedApplication(UUID id) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        ApplicationEntity entity = applicationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Application does not belong to current user");
        }
        return entity;
    }

    private ApplicationResponse toResponse(ApplicationEntity entity) {
        return new ApplicationResponse(entity.getId(), entity.getNotes());
    }

    private Comparator<ApplicationEntity> buildComparator(String sortBy) {
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(ApplicationEntity::getUpdatedAt);
        }
        return Comparator.comparing(ApplicationEntity::getCreatedAt);
    }

    private String asSearchableText(ApplicationEntity entity) {
        String notes = entity.getNotes() == null ? "" : entity.getNotes();
        String status = entity.getStatus() == null ? "" : entity.getStatus().name();
        return (notes + " " + status).toLowerCase(Locale.ROOT);
    }

    private List<ApplicationEntity> paginate(List<ApplicationEntity> source, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int fromIndex = safePage * safeSize;
        if (fromIndex >= source.size()) {
            return List.of();
        }
        int toIndex = Math.min(fromIndex + safeSize, source.size());
        return source.subList(fromIndex, toIndex);
    }

    private String mapStatusForFrontend(ApplicationEntity entity) {
        if (entity.getStatus() == null) {
            return "NEW";
        }
        if (entity.getStatus().name().equals("FINAL")) {
            return "FINAL_ROUND";
        }
        if (entity.getStatus().name().equals("ARCHIVED")) {
            return "REJECTED";
        }
        return entity.getStatus().name();
    }
}
