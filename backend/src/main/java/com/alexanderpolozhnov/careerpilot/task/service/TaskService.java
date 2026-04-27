package com.alexanderpolozhnov.careerpilot.task.service;
import com.alexanderpolozhnov.careerpilot.task.request.TaskRequest;
import com.alexanderpolozhnov.careerpilot.task.response.TaskResponse;

import java.util.List;
import java.util.UUID;

public interface TaskService {
    TaskResponse create(TaskRequest request);

    List<TaskResponse> list(int page, int size, String sortBy, String direction, String q);

    TaskResponse getById(UUID id);

    TaskResponse update(UUID id, TaskRequest request);

    void delete(UUID id);
}
