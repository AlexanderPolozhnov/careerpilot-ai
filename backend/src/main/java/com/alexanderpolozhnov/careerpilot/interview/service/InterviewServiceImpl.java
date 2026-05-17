package com.alexanderpolozhnov.careerpilot.interview.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.request.InterviewRequest;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
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
        applyRequest(entity, request);
        return toResponse(interviewRepository.save(entity));
    }

    @Override
    public PagedResponse<InterviewResponse> list(int page, int size, String sortBy, String direction, String q) {
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
        List<InterviewResponse> content = paginate(filtered, page, size).stream().map(this::toResponse).toList();
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int totalPages = filtered.isEmpty() ? 0 : (int) Math.ceil((double) filtered.size() / safeSize);
        return new PagedResponse<>(
                content,
                filtered.size(),
                totalPages,
                safeSize,
                safePage,
                safePage == 0,
                safePage >= Math.max(totalPages - 1, 0)
        );
    }

    @Override
    public InterviewResponse getById(UUID id) {
        return toResponse(findOwnedInterview(id));
    }

    @Override
    public InterviewResponse update(UUID id, InterviewRequest request) {
        InterviewEntity entity = findOwnedInterview(id);
        applyRequest(entity, request);
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

    private ApplicationEntity resolveApplication(UUID applicationId) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        return applicationRepository.findAllByUserId(userId).stream()
                .filter(application -> application.getId().equals(applicationId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));
    }

    private InterviewResponse toResponse(InterviewEntity entity) {
        return new InterviewResponse(
                entity.getId(),
                entity.getApplication().getId(),
                entity.getType(),
                entity.getScheduledAt(),
                entity.getTimezone(),
                entity.getMeetingLink(),
                entity.getResult(),
                entity.getNotes());
    }

    private void applyRequest(InterviewEntity entity, InterviewRequest request) {
        entity.setApplication(resolveApplication(request.applicationId()));
        entity.setType(request.type());
        entity.setScheduledAt(request.scheduledAt().atZone(resolveZoneId(request.timezone())).toInstant());
        entity.setTimezone(blankToNull(request.timezone()));
        entity.setMeetingLink(blankToNull(request.meetingLink()));
        entity.setResult(request.result());
        entity.setNotes(blankToNull(request.notes()));
    }

    private ZoneId resolveZoneId(String timezone) {
        if (timezone == null || timezone.isBlank()) {
            return ZoneId.systemDefault();
        }
        return ZoneId.of(timezone);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
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
