package com.alexanderpolozhnov.careerpilot.interview.controller;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.interview.request.InterviewRequest;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;
import com.alexanderpolozhnov.careerpilot.interview.service.InterviewService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/interviews")
@Validated
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService service;

    @PostMapping
    public InterviewResponse create(@Valid @RequestBody InterviewRequest request) {
        return service.create(request);
    }

    @GetMapping
    public PagedResponse<InterviewResponse> list(
            @Min(0) @RequestParam(defaultValue = "0") int page,
            @Min(1) @Max(1000) @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "") String q) {
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

    @GetMapping(value = "/{id}/export/ics", produces = "text/calendar")
    @Operation(summary = "Export interview to ICS calendar file")
    @Auditable(action = "INTERVIEW_EXPORT_ICS", entityType = "INTERVIEW")
    public ResponseEntity<byte[]> exportToIcs(@PathVariable UUID id) {
        byte[] data = service.exportToIcs(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"interview-" + id + ".ics\"")
                .body(data);
    }
}
