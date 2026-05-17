package com.alexanderpolozhnov.careerpilot.task.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.mapper.TaskMapper;
import com.alexanderpolozhnov.careerpilot.task.request.TaskRequest;
import com.alexanderpolozhnov.careerpilot.task.response.TaskResponse;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUserResolver currentUserResolver;
    private final TaskMapper taskMapper;

    @Override
    @Transactional
    public TaskResponse create(TaskRequest request) {
        UUID userId = currentUserResolver.resolveRequired().getId();

        TaskEntity entity = new TaskEntity();
        entity.setUser(currentUserResolver.resolveRequired());
        entity.setTitle(request.title());
        entity.setDescription(request.description());
        entity.setDueAt(request.dueAt() != null ? request.dueAt().atZone(java.time.ZoneOffset.UTC).toInstant() : null);
        entity.setDone(request.done() != null ? request.done() : false);
        entity.setPriority(request.priority());

        if (request.applicationId() != null) {
            ApplicationEntity application = applicationRepository.findById(request.applicationId())
                    .orElseThrow(() -> new IllegalArgumentException("Application not found"));
            if (!application.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Application does not belong to current user");
            }
            entity.setApplication(application);
        }

        return taskMapper.toResponse(taskRepository.save(entity));
    }

    @Override
    public PagedResponse<TaskResponse> list(UUID userId, Pageable pageable, String q) {
        Specification<TaskEntity> spec = Specification.where((root, query, cb) -> {
            var predicates = new java.util.ArrayList<Predicate>();

            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (q != null && !q.isBlank()) {
                String searchTerm = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), searchTerm),
                        cb.like(cb.lower(root.get("description")), searchTerm)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        });

        Page<TaskEntity> page = taskRepository.findAll(spec, pageable);
        return PagedResponse.fromPage(page.map(taskMapper::toResponse));
    }

    @Override
    public TaskResponse getById(UUID id) {
        TaskEntity entity = findOwnedTask(id);
        return taskMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public TaskResponse update(UUID id, TaskRequest request) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        TaskEntity entity = findOwnedTask(id);

        taskMapper.updateEntity(request, entity);
        entity.setDueAt(request.dueAt() != null ? request.dueAt().atZone(java.time.ZoneOffset.UTC).toInstant() : null);

        if (request.applicationId() != null) {
            ApplicationEntity application = applicationRepository.findById(request.applicationId())
                    .orElseThrow(() -> new IllegalArgumentException("Application not found"));
            if (!application.getUser().getId().equals(userId)) {
                throw new IllegalArgumentException("Application does not belong to current user");
            }
            entity.setApplication(application);
        } else {
            entity.setApplication(null);
        }

        return taskMapper.toResponse(taskRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        TaskEntity entity = findOwnedTask(id);
        taskRepository.delete(entity);
    }

    @Override
    @Transactional
    public TaskResponse toggleDone(UUID id) {
        TaskEntity entity = findOwnedTask(id);
        entity.setDone(!entity.getDone());
        return taskMapper.toResponse(taskRepository.save(entity));
    }

    private TaskEntity findOwnedTask(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        TaskEntity entity = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Task does not belong to current user");
        }
        return entity;
    }
}
