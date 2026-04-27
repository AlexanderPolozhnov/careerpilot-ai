package com.alexanderpolozhnov.careerpilot.task.controller;

import com.alexanderpolozhnov.careerpilot.task.request.TaskRequest;
import com.alexanderpolozhnov.careerpilot.task.response.TaskResponse;
import com.alexanderpolozhnov.careerpilot.task.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService service;

    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<TaskResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "") String q
    ) {
        return service.list(page, size, sortBy, direction, q);
    }

    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable UUID id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
