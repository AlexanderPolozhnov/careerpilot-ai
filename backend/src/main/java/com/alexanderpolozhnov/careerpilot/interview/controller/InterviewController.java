package com.alexanderpolozhnov.careerpilot.interview.controller;

import com.alexanderpolozhnov.careerpilot.interview.request.InterviewRequest;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;
import com.alexanderpolozhnov.careerpilot.interview.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService service;

    @PostMapping
    public InterviewResponse create(@Valid @RequestBody InterviewRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<InterviewResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "") String q
    ) {
        return service.list(page, size, sortBy, direction, q);
    }

    @GetMapping("/{id}")
    public InterviewResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public InterviewResponse update(@PathVariable UUID id, @Valid @RequestBody InterviewRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
