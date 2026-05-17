package com.alexanderpolozhnov.careerpilot.task.service;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.task.request.TaskRequest;
import com.alexanderpolozhnov.careerpilot.task.response.TaskResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TaskService {
    TaskResponse create(TaskRequest request);

    PagedResponse<TaskResponse> list(UUID userId, Pageable pageable, String q);

    TaskResponse getById(UUID id);

    TaskResponse update(UUID id, TaskRequest request);

    void delete(UUID id);

    TaskResponse toggleDone(UUID id);
}
