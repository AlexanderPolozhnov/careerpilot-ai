package com.alexanderpolozhnov.careerpilot.task.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.request.TaskRequest;
import com.alexanderpolozhnov.careerpilot.task.response.TaskResponse;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public TaskResponse create(TaskRequest request) {
        TaskEntity entity = new TaskEntity();
        entity.setUser(currentUserResolver.resolveOrCreate());
        entity.setTitle(normalizePayload(request.payload()));
        entity.setDescription(request.payload());
        entity.setApplication(resolveAnyApplication());
        return toResponse(taskRepository.save(entity));
    }

    @Override
    public List<TaskResponse> list(int page, int size, String sortBy, String direction, String q) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        Comparator<TaskEntity> comparator = buildComparator(sortBy);
        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }
        final String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);

        List<TaskEntity> filtered = taskRepository.findAllByUserId(userId).stream()
                .filter(entity -> query.isBlank() || asSearchableText(entity).contains(query))
                .sorted(comparator)
                .toList();
        return paginate(filtered, page, size).stream().map(this::toResponse).toList();
    }

    @Override
    public TaskResponse getById(UUID id) {
        return toResponse(findOwnedTask(id));
    }

    @Override
    public TaskResponse update(UUID id, TaskRequest request) {
        TaskEntity entity = findOwnedTask(id);
        entity.setTitle(normalizePayload(request.payload()));
        entity.setDescription(request.payload());
        return toResponse(taskRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        taskRepository.delete(findOwnedTask(id));
    }

    private TaskEntity findOwnedTask(UUID id) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        TaskEntity entity = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Task does not belong to current user");
        }
        return entity;
    }

    private ApplicationEntity resolveAnyApplication() {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        return applicationRepository.findAllByUserId(userId).stream().findFirst().orElse(null);
    }

    private TaskResponse toResponse(TaskEntity entity) {
        String payload = entity.getDescription() == null ? entity.getTitle() : entity.getDescription();
        return new TaskResponse(entity.getId(), payload);
    }

    private String normalizePayload(String payload) {
        String trimmed = payload.trim();
        return trimmed.length() > 255 ? trimmed.substring(0, 255) : trimmed;
    }

    private Comparator<TaskEntity> buildComparator(String sortBy) {
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(TaskEntity::getUpdatedAt);
        }
        return Comparator.comparing(TaskEntity::getCreatedAt);
    }

    private String asSearchableText(TaskEntity entity) {
        String title = entity.getTitle() == null ? "" : entity.getTitle();
        String description = entity.getDescription() == null ? "" : entity.getDescription();
        return (title + " " + description).toLowerCase(Locale.ROOT);
    }

    private List<TaskEntity> paginate(List<TaskEntity> source, int page, int size) {
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
