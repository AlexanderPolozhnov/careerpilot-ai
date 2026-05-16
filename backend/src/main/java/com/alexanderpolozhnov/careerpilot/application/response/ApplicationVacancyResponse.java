package com.alexanderpolozhnov.careerpilot.application.response;

public record ApplicationVacancyResponse(
        String id,
        String title,
        String location,
        ApplicationCompanyResponse company
) {
}
