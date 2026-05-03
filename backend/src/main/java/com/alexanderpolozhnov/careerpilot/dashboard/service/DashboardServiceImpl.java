package com.alexanderpolozhnov.careerpilot.dashboard.service;

import com.alexanderpolozhnov.careerpilot.ai.entity.AiEntity;
import com.alexanderpolozhnov.careerpilot.ai.repository.AiRepository;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.dashboard.dto.*;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import com.alexanderpolozhnov.careerpilot.notification.repository.NotificationRepository;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CurrentUserResolver currentUserResolver;
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final TaskRepository taskRepository;
    private final NotificationRepository notificationRepository;
    private final AiRepository aiRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDto getSummary() {
        AuthEntity user = currentUserResolver.resolveRequired();
        UUID userId = user.getId();
        Instant now = Instant.now();

        long activeVacancies = vacancyRepository
            .findAllByUserIdAndStatus(userId, VacancyStatus.ACTIVE).size();

        List<ApplicationStatus> activeStatuses = List.of(
            ApplicationStatus.APPLIED,
            ApplicationStatus.HR_SCREEN,
            ApplicationStatus.TECH_INTERVIEW,
            ApplicationStatus.FINAL
        );
        long activeApplications = applicationRepository.findAllByUserId(userId).stream()
            .filter(a -> activeStatuses.contains(a.getStatus()))
            .count();

        List<InterviewEntity> upcomingInterviews = interviewRepository
            .findAllByApplication_User_IdAndScheduledAtAfterOrderByScheduledAtAsc(userId, now);
        long interviewsScheduled = upcomingInterviews.size();

        Instant weekAgo = now.minus(7, ChronoUnit.DAYS);
        long aiInsightsThisWeek = aiRepository.findAllByUserIdOrderByCreatedAtDesc(userId).stream()
            .filter(a -> a.getCreatedAt().isAfter(weekAgo))
            .count();

        DashboardKpisDto kpis = new DashboardKpisDto(
            activeVacancies, activeApplications, interviewsScheduled, aiInsightsThisWeek);

        List<DashboardInterviewDto> interviewDtos = upcomingInterviews.stream()
            .limit(5)
            .map(this::toInterviewDto)
            .toList();

        List<TaskEntity> tasks = taskRepository.findAllByUserIdAndDone(userId, false);
        List<DashboardTaskDto> taskDtos = tasks.stream()
            .limit(5)
            .map(this::toTaskDto)
            .toList();

        List<NotificationEntity> notifications = notificationRepository.findAllByUserId(userId);
        List<DashboardNotificationDto> notificationDtos = notifications.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(5)
            .map(this::toNotificationDto)
            .toList();

        List<AiEntity> aiResults = aiRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
        List<DashboardAiInsightDto> aiInsightDtos = aiResults.stream()
            .limit(5)
            .map(this::toAiInsightDto)
            .toList();

        return new DashboardSummaryDto(kpis, interviewDtos, taskDtos, aiInsightDtos, notificationDtos);
    }

    private DashboardInterviewDto toInterviewDto(InterviewEntity e) {
        String companyName = null;
        String vacancyTitle = null;
        if (e.getApplication() != null && e.getApplication().getVacancy() != null) {
            var vacancy = e.getApplication().getVacancy();
            vacancyTitle = vacancy.getTitle();
            if (vacancy.getCompany() != null) {
                companyName = vacancy.getCompany().getName();
            }
        }
        return new DashboardInterviewDto(
            e.getId(),
            e.getType() != null ? e.getType().name() : null,
            e.getScheduledAt(),
            e.getMeetingLink(),
            companyName,
            vacancyTitle
        );
    }

    private DashboardTaskDto toTaskDto(TaskEntity e) {
        return new DashboardTaskDto(
            e.getId(),
            e.getTitle(),
            e.getPriority() != null ? e.getPriority().name() : null,
            Boolean.TRUE.equals(e.getDone()),
            e.getDueAt()
        );
    }

    private DashboardNotificationDto toNotificationDto(NotificationEntity e) {
        return new DashboardNotificationDto(
            e.getId(),
            e.getTitle(),
            e.getMessage(),
            e.getStatus() != null ? e.getStatus().name() : null,
            e.getCreatedAt()
        );
    }

    private DashboardAiInsightDto toAiInsightDto(AiEntity e) {
        return new DashboardAiInsightDto(
            e.getId(),
            e.getType(),
            e.getPrompt(),
            e.getResult(),
            e.getCreatedAt()
        );
    }
}
