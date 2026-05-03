package com.alexanderpolozhnov.careerpilot.application.controller;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest;
import com.alexanderpolozhnov.careerpilot.application.request.UpdateApplicationStatusRequest;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationBoardItemResponse;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationResponse;
import com.alexanderpolozhnov.careerpilot.application.service.ApplicationService;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse create(@Valid @RequestBody ApplicationRequest request) {
        return service.create(request);
    }

    @GetMapping
    public PagedResponse<ApplicationResponse> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) ApplicationStatus status,
        @RequestParam(required = false) UUID vacancyId
    ) {
        return service.list(page, size, status, vacancyId);
    }

    @GetMapping("/board")
    public Map<String, List<ApplicationBoardItemResponse>> board() {
        return service.board();
    }

    @GetMapping("/{id}")
    public ApplicationResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public ApplicationResponse update(@PathVariable UUID id, @Valid @RequestBody ApplicationRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public ApplicationResponse updateStatus(@PathVariable UUID id,
                                            @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return service.updateStatus(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
