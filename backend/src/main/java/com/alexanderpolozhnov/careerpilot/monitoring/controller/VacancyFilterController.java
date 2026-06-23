package com.alexanderpolozhnov.careerpilot.monitoring.controller;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.monitoring.request.VacancyFilterRequest;
import com.alexanderpolozhnov.careerpilot.monitoring.response.VacancyFilterResponse;
import com.alexanderpolozhnov.careerpilot.monitoring.service.VacancyFilterService;
import com.alexanderpolozhnov.careerpilot.monitoring.service.HhVacancyPollingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vacancy-filters")
@Validated
@RequiredArgsConstructor
public class VacancyFilterController {

    private final VacancyFilterService vacancyFilterService;
    private final HhVacancyPollingService hhVacancyPollingService;

    @Value("${app.scheduler.secret}")
    private String schedulerSecret;

    @GetMapping
    public List<VacancyFilterResponse> getFilters() {
        return vacancyFilterService.getFilters();
    }

    @PostMapping
    @Auditable(action = "VACANCY_FILTER_CREATE", entityType = "VACANCY_FILTER")
    @ResponseStatus(HttpStatus.CREATED)
    public VacancyFilterResponse createFilter(@Valid @RequestBody VacancyFilterRequest request) {
        return vacancyFilterService.createFilter(request);
    }

    @PutMapping("/{id}")
    @Auditable(action = "VACANCY_FILTER_UPDATE", entityType = "VACANCY_FILTER")
    public VacancyFilterResponse updateFilter(@PathVariable UUID id, @Valid @RequestBody VacancyFilterRequest request) {
        return vacancyFilterService.updateFilter(id, request);
    }

    @DeleteMapping("/{id}")
    @Auditable(action = "VACANCY_FILTER_DELETE", entityType = "VACANCY_FILTER")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFilter(@PathVariable UUID id) {
        vacancyFilterService.deleteFilter(id);
    }

    @PostMapping("/poll-trigger")
    @ResponseStatus(HttpStatus.OK)
    public void triggerPoll(@RequestParam("secret") String secret) {
        if (!schedulerSecret.equals(secret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid secret");
        }
        hhVacancyPollingService.pollVacancies();
    }
}
