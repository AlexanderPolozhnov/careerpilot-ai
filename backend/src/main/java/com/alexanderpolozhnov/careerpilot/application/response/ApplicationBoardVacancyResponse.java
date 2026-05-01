package com.alexanderpolozhnov.careerpilot.application.response;

public record ApplicationBoardVacancyResponse(
        String id,
        String title,
        String location,
        ApplicationBoardCompanyResponse company
) {
}
