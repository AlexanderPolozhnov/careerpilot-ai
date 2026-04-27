package com.alexanderpolozhnov.careerpilot.vacancy.service;

import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.request.VacancyRequest;
import com.alexanderpolozhnov.careerpilot.vacancy.response.VacancyResponse;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VacancyServiceImpl implements VacancyService {

    private final VacancyRepository vacancyRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public VacancyResponse create(VacancyRequest request) {
        VacancyEntity entity = new VacancyEntity();
        entity.setUser(currentUserResolver.resolveOrCreate());
        entity.setTitle(normalizePayload(request.payload()));
        entity.setDescriptionRaw(request.payload());
        return toResponse(vacancyRepository.save(entity));
    }

    @Override
    public List<VacancyResponse> list(int page, int size, String sortBy, String direction, String q) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        Comparator<VacancyEntity> comparator = buildComparator(sortBy);
        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }
        final String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);

        List<VacancyEntity> filtered = vacancyRepository.findAllByUserId(userId).stream()
                .filter(entity -> query.isBlank() || asSearchableText(entity).contains(query))
                .sorted(comparator)
                .toList();
        return paginate(filtered, page, size).stream().map(this::toResponse).toList();
    }

    @Override
    public VacancyResponse getById(UUID id) {
        return toResponse(findOwnedVacancy(id));
    }

    @Override
    public VacancyResponse update(UUID id, VacancyRequest request) {
        VacancyEntity entity = findOwnedVacancy(id);
        entity.setTitle(normalizePayload(request.payload()));
        entity.setDescriptionRaw(request.payload());
        return toResponse(vacancyRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        vacancyRepository.delete(findOwnedVacancy(id));
    }

    private VacancyEntity findOwnedVacancy(UUID id) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        VacancyEntity entity = vacancyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Vacancy does not belong to current user");
        }
        return entity;
    }

    private VacancyResponse toResponse(VacancyEntity entity) {
        String payload = entity.getDescriptionRaw() == null ? entity.getTitle() : entity.getDescriptionRaw();
        return new VacancyResponse(entity.getId(), payload);
    }

    private String normalizePayload(String payload) {
        String trimmed = payload.trim();
        return trimmed.length() > 255 ? trimmed.substring(0, 255) : trimmed;
    }

    private Comparator<VacancyEntity> buildComparator(String sortBy) {
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(VacancyEntity::getUpdatedAt);
        }
        return Comparator.comparing(VacancyEntity::getCreatedAt);
    }

    private String asSearchableText(VacancyEntity entity) {
        String title = entity.getTitle() == null ? "" : entity.getTitle();
        String raw = entity.getDescriptionRaw() == null ? "" : entity.getDescriptionRaw();
        return (title + " " + raw).toLowerCase(Locale.ROOT);
    }

    private List<VacancyEntity> paginate(List<VacancyEntity> source, int page, int size) {
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
