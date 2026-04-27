package com.alexanderpolozhnov.careerpilot.application.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationResponse;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
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
        return paginate(filtered, page, size).stream().map(this::toResponse).toList();
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
}
