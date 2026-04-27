package com.alexanderpolozhnov.careerpilot.interview.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewType;
import com.alexanderpolozhnov.careerpilot.interview.request.InterviewRequest;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public InterviewResponse create(InterviewRequest request) {
        InterviewEntity entity = new InterviewEntity();
        entity.setApplication(resolveRequiredApplication());
        entity.setType(InterviewType.OTHER);
        entity.setScheduledAt(Instant.now().plusSeconds(3600));
        entity.setNotes(request.payload());
        return toResponse(interviewRepository.save(entity));
    }

    @Override
    public List<InterviewResponse> list(int page, int size, String sortBy, String direction, String q) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        Comparator<InterviewEntity> comparator = buildComparator(sortBy);
        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }
        final String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);

        List<InterviewEntity> filtered = applicationRepository.findAllByUserId(userId).stream()
                .flatMap(application -> interviewRepository.findAllByApplicationId(application.getId()).stream())
                .filter(entity -> query.isBlank() || asSearchableText(entity).contains(query))
                .sorted(comparator)
                .toList();
        return paginate(filtered, page, size).stream().map(this::toResponse).toList();
    }

    @Override
    public InterviewResponse getById(UUID id) {
        return toResponse(findOwnedInterview(id));
    }

    @Override
    public InterviewResponse update(UUID id, InterviewRequest request) {
        InterviewEntity entity = findOwnedInterview(id);
        entity.setNotes(request.payload());
        return toResponse(interviewRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        interviewRepository.delete(findOwnedInterview(id));
    }

    private InterviewEntity findOwnedInterview(UUID id) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        InterviewEntity entity = interviewRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));
        UUID ownerId = entity.getApplication().getUser().getId();
        if (!ownerId.equals(userId)) {
            throw new IllegalArgumentException("Interview does not belong to current user");
        }
        return entity;
    }

    private ApplicationEntity resolveRequiredApplication() {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        return applicationRepository.findAllByUserId(userId).stream()
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Create application first"));
    }

    private InterviewResponse toResponse(InterviewEntity entity) {
        return new InterviewResponse(entity.getId(), entity.getNotes());
    }

    private Comparator<InterviewEntity> buildComparator(String sortBy) {
        if ("scheduledAt".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(InterviewEntity::getScheduledAt);
        }
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(InterviewEntity::getUpdatedAt);
        }
        return Comparator.comparing(InterviewEntity::getCreatedAt);
    }

    private String asSearchableText(InterviewEntity entity) {
        String notes = entity.getNotes() == null ? "" : entity.getNotes();
        String type = entity.getType() == null ? "" : entity.getType().name();
        return (notes + " " + type).toLowerCase(Locale.ROOT);
    }

    private List<InterviewEntity> paginate(List<InterviewEntity> source, int page, int size) {
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
