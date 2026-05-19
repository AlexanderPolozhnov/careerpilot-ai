package com.alexanderpolozhnov.careerpilot.search.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.search.dto.SearchItemDto;
import com.alexanderpolozhnov.careerpilot.search.dto.SearchItemType;
import com.alexanderpolozhnov.careerpilot.search.dto.SearchResponseDto;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final CurrentUserResolver currentUserResolver;
    private final VacancyRepository vacancyRepository;
    private final CompanyRepository companyRepository;
    private final TaskRepository taskRepository;
    private final InterviewRepository interviewRepository;

    private static final int RESULTS_PER_CATEGORY = 5;

    @Override
    @Transactional(readOnly = true)
    public SearchResponseDto search(String query) {
        if (query == null || query.isBlank()) {
            return new SearchResponseDto(new ArrayList<>());
        }
        
        UUID userId = currentUserResolver.resolveRequired().getId();
        List<SearchItemDto> results = new ArrayList<>();

        // Search vacancies
        List<VacancyEntity> vacancies = vacancyRepository.findAllByUserIdAndTitleContainingIgnoreCase(userId, query);
        vacancies.stream()
                .limit(RESULTS_PER_CATEGORY)
                .forEach(v -> results.add(mapVacancy(v)));

        // Search companies
        List<CompanyEntity> companies = companyRepository.findAllByUserIdAndNameContainingIgnoreCase(userId, query);
        companies.stream()
                .limit(RESULTS_PER_CATEGORY)
                .forEach(c -> results.add(mapCompany(c)));

        // Search tasks
        List<TaskEntity> tasks = taskRepository.findAllByUserIdAndTitleContainingIgnoreCase(userId, query);
        tasks.stream()
                .limit(RESULTS_PER_CATEGORY)
                .forEach(t -> results.add(mapTask(t)));

        // Search interviews
        List<InterviewEntity> interviews = interviewRepository.findAllByApplication_User_IdAndNotesContainingIgnoreCase(userId, query);
        interviews.stream()
                .limit(RESULTS_PER_CATEGORY)
                .forEach(i -> results.add(mapInterview(i)));

        return new SearchResponseDto(results);
    }

    private SearchItemDto mapVacancy(VacancyEntity vacancy) {
        String companyName = (vacancy.getCompany() != null) ? vacancy.getCompany().getName() : "";
        return new SearchItemDto(
                vacancy.getId(),
                SearchItemType.VACANCY,
                vacancy.getTitle(),
                companyName,
                vacancy.getStatus().name(),
                "/app/vacancies/" + vacancy.getId()
        );
    }

    private SearchItemDto mapCompany(CompanyEntity company) {
        return new SearchItemDto(
                company.getId(),
                SearchItemType.COMPANY,
                company.getName(),
                company.getIndustry() != null ? company.getIndustry() : "",
                "",
                "/app/companies?id=" + company.getId()
        );
    }

    private SearchItemDto mapTask(TaskEntity task) {
        return new SearchItemDto(
                task.getId(),
                SearchItemType.TASK,
                task.getTitle(),
                task.getPriority() != null ? task.getPriority().name() : "MEDIUM",
                (task.getDone() != null && task.getDone()) ? "DONE" : "PENDING",
                "/app/tasks?id=" + task.getId()
        );
    }

    private SearchItemDto mapInterview(InterviewEntity interview) {
        ApplicationEntity application = interview.getApplication();
        String companyName = (application != null && application.getVacancy() != null && application.getVacancy().getCompany() != null)
                ? application.getVacancy().getCompany().getName()
                : "";
        return new SearchItemDto(
                interview.getId(),
                SearchItemType.INTERVIEW,
                interview.getType() != null ? interview.getType().name() : "OTHER",
                companyName,
                interview.getResult() != null ? interview.getResult().name() : "",
                "/app/interviews?id=" + interview.getId()
        );
    }
}
