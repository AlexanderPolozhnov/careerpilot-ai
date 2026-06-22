package com.alexanderpolozhnov.careerpilot.monitoring.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VacancyFilterRequest(
        @NotBlank(message = "Search query is required")
        @Size(max = 256, message = "Search query must not exceed 256 characters")
        String searchQuery,

        Integer targetSalary,

        Boolean isActive
) {
}
