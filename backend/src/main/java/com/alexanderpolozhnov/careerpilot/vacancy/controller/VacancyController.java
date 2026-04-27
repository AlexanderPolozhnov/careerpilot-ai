package com.alexanderpolozhnov.careerpilot.vacancy.controller;

import com.alexanderpolozhnov.careerpilot.vacancy.request.VacancyRequest;
import com.alexanderpolozhnov.careerpilot.vacancy.response.VacancyResponse;
import com.alexanderpolozhnov.careerpilot.vacancy.service.VacancyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vacancies")
@RequiredArgsConstructor
public class VacancyController {
    private final VacancyService service;

    @PostMapping
    public VacancyResponse create(@Valid @RequestBody VacancyRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<VacancyResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "") String q
    ) {
        return service.list(page, size, sortBy, direction, q);
    }

    @GetMapping("/{id}")
    public VacancyResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public VacancyResponse update(@PathVariable UUID id, @Valid @RequestBody VacancyRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
