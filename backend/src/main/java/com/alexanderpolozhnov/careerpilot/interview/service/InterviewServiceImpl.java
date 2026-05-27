package com.alexanderpolozhnov.careerpilot.interview.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.integration.google.GoogleCalendarService;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.mapper.InterviewMapper;
import com.alexanderpolozhnov.careerpilot.interview.request.InterviewRequest;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUserResolver currentUserResolver;
    private final GoogleCalendarService googleCalendarService;
    private final InterviewMapper interviewMapper;

    @Override
    @Transactional
    public InterviewResponse create(InterviewRequest request) {
        InterviewEntity entity = new InterviewEntity();
        applyRequest(entity, request);
        return interviewMapper.toResponse(interviewRepository.save(entity));
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
        List<InterviewResponse> content = paginate(filtered, page, size).stream().map(interviewMapper::toResponse).toList();
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
                safePage >= Math.max(totalPages - 1, 0));
    }

    @Override
    public InterviewResponse getById(UUID id) {
        return interviewMapper.toResponse(findOwnedInterview(id));
    }

    @Override
    @Transactional
    public InterviewResponse update(UUID id, InterviewRequest request) {
        InterviewEntity entity = findOwnedInterview(id);
        applyRequest(entity, request);
        return interviewMapper.toResponse(interviewRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        interviewRepository.delete(findOwnedInterview(id));
    }

    @Override
    public byte[] exportToIcs(UUID id) {
        InterviewEntity entity = findOwnedInterview(id);
        StringBuilder icsContent = new StringBuilder();

        // Format dates for ICS (UTC format: yyyyMMdd'T'HHmmss'Z')
        java.time.format.DateTimeFormatter icsFormatter = java.time.format.DateTimeFormatter
                .ofPattern("yyyyMMdd'T'HHmmss'Z'")
                .withZone(java.time.ZoneOffset.UTC);

        String now = icsFormatter.format(java.time.Instant.now());
        String start = icsFormatter.format(entity.getScheduledAt());
        String end = icsFormatter.format(entity.getScheduledAt().plus(java.time.Duration.ofHours(1)));

        // Build ICS content
        icsContent.append("BEGIN:VCALENDAR\n");
        icsContent.append("VERSION:2.0\n");
        icsContent.append("PRODID:-//CareerPilot AI//EN\n");
        icsContent.append("CALSCALE:GREGORIAN\n");
        icsContent.append("BEGIN:VEVENT\n");
        icsContent.append("UID:").append(entity.getId()).append("@careerpilot.ai\n");
        icsContent.append("DTSTAMP:").append(now).append("\n");
        icsContent.append("DTSTART:").append(start).append("\n");
        icsContent.append("DTEND:").append(end).append("\n");
        icsContent.append("SUMMARY:Собеседование (")
                .append(entity.getType() != null ? entity.getType().name() : "Interview").append(")\n");

        // Combine notes and meeting link for description
        String description = "";
        if (entity.getNotes() != null && !entity.getNotes().isBlank()) {
            description = entity.getNotes().replace("\n", "\\n");
        }
        if (entity.getMeetingLink() != null && !entity.getMeetingLink().isBlank()) {
            if (!description.isEmpty()) {
                description += "\\n\\n";
            }
            description += "Meeting Link: " + entity.getMeetingLink();
        }
        icsContent.append("DESCRIPTION:").append(description).append("\n");

        if (entity.getMeetingLink() != null && !entity.getMeetingLink().isBlank()) {
            icsContent.append("LOCATION:").append(entity.getMeetingLink()).append("\n");
        }

        icsContent.append("END:VEVENT\n");
        icsContent.append("END:VCALENDAR");

        return icsContent.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Override
    @Transactional
    public InterviewResponse syncWithGoogle(UUID id) {
        InterviewEntity entity = findOwnedInterview(id);
        if (entity.getGoogleCalendarEventId() != null) {
            return interviewMapper.toResponse(entity); // Already synced
        }
        String eventId = googleCalendarService.createEvent(entity);
        entity.setGoogleCalendarEventId(eventId);
        return interviewMapper.toResponse(interviewRepository.save(entity));
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
