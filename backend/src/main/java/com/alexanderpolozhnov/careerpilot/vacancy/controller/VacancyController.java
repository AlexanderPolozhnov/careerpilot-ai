package com.alexanderpolozhnov.careerpilot.vacancy.controller;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.CreateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.UpdateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.service.VacancyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vacancies")
@RequiredArgsConstructor
public class VacancyController {
    private final VacancyService service;

    @PostMapping
    public VacancyDto create(@Valid @RequestBody CreateVacancyDto request) {
        return service.create(request);
    }

    @GetMapping
    public PagedResponse<VacancyDto> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "DESC") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String remote,
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String tag
    ) {
        return service.list(page, size, sort, direction, search, status, remote, companyId, tag);
    }

    @GetMapping("/{id}")
    public VacancyDto getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public VacancyDto update(@PathVariable UUID id, @Valid @RequestBody UpdateVacancyDto request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
