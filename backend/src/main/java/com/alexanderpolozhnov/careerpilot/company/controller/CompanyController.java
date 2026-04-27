package com.alexanderpolozhnov.careerpilot.company.controller;

import com.alexanderpolozhnov.careerpilot.company.request.CompanyRequest;
import com.alexanderpolozhnov.careerpilot.company.response.CompanyResponse;
import com.alexanderpolozhnov.careerpilot.company.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService service;

    @PostMapping
    public CompanyResponse create(@Valid @RequestBody CompanyRequest request) {
        return service.create(request);
    }

    @GetMapping
    public List<CompanyResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "") String q
    ) {
        return service.list(page, size, sortBy, direction, q);
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PutMapping("/{id}")
    public CompanyResponse update(@PathVariable UUID id, @Valid @RequestBody CompanyRequest request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
