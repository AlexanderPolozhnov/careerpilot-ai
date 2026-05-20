package com.alexanderpolozhnov.careerpilot.analytics.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsSummaryResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import com.alexanderpolozhnov.careerpilot.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final int WEEKLY_ACTIVITY_WEEKS = 3;
    private static final DateTimeFormatter WEEK_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MM-dd");

    private final ApplicationRepository applicationRepository;
    private final CurrentUserResolver currentUserResolver;
    private final ProfileRepository profileRepository;

    @Override
    public AnalyticsResponse create(AnalyticsRequest request) {
        return new AnalyticsResponse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse summary() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        List<ApplicationEntity> applications = applicationRepository.findAllByUserId(userId);
        int total = applications.size();
        int active = (int) applications.stream()
                .filter(a -> a.getStatus() != ApplicationStatus.REJECTED && a.getStatus() != ApplicationStatus.ARCHIVED)
                .count();
        int interviews = (int) applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.HR_SCREEN
                        || a.getStatus() == ApplicationStatus.TECH_INTERVIEW
                        || a.getStatus() == ApplicationStatus.FINAL
                        || a.getStatus() == ApplicationStatus.OFFER)
                .count();
        int offers = (int) applications.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.OFFER)
                .count();
        int responded = (int) applications.stream()
                .filter(a -> a.getStatus() != ApplicationStatus.NEW && a.getStatus() != ApplicationStatus.SAVED)
                .count();

        Map<String, Integer> funnelCounts = new LinkedHashMap<>();
        funnelCounts.put("NEW", 0);
        funnelCounts.put("SAVED", 0);
        funnelCounts.put("APPLIED", 0);
        funnelCounts.put("HR_SCREEN", 0);
        funnelCounts.put("TECH_INTERVIEW", 0);
        funnelCounts.put("FINAL_ROUND", 0);
        funnelCounts.put("OFFER", 0);
        funnelCounts.put("REJECTED", 0);

        for (ApplicationEntity application : applications) {
            String status = mapStatus(application.getStatus());
            funnelCounts.computeIfPresent(status, (k, v) -> v + 1);
        }

        List<AnalyticsSummaryResponse.ApplicationFunnelItem> funnel = funnelCounts.entrySet().stream()
                .map(entry -> new AnalyticsSummaryResponse.ApplicationFunnelItem(
                        entry.getKey(),
                        entry.getValue(),
                        total == 0 ? 0.0 : (entry.getValue() * 100.0) / total))
                .toList();

        List<AnalyticsSummaryResponse.WeeklyActivityItem> weeklyActivity = buildWeeklyActivity(applications);

        List<AnalyticsSummaryResponse.SkillGapItem> skillGaps = buildSkillGaps(applications, userId);
        double avgTimeToInterview = calculateAvgTimeToInterview(applications);

        return new AnalyticsSummaryResponse(
                total,
                active,
                total == 0 ? 0.0 : (double) interviews / total,
                total == 0 ? 0.0 : (double) offers / total,
                total == 0 ? 0.0 : (double) responded / total,
                avgTimeToInterview,
                funnel,
                weeklyActivity,
                skillGaps);
    }

    private String mapStatus(ApplicationStatus status) {
        if (status == null) {
            return "NEW";
        }
        if (status == ApplicationStatus.FINAL) {
            return "FINAL_ROUND";
        }
        if (status == ApplicationStatus.ARCHIVED) {
            return "REJECTED";
        }
        return status.name();
    }

    private List<AnalyticsSummaryResponse.WeeklyActivityItem> buildWeeklyActivity(
            List<ApplicationEntity> applications) {
        ZoneId zone = ZoneId.systemDefault();
        LocalDate currentWeekStart = weekStart(LocalDate.now(zone));
        Map<LocalDate, WeeklyActivityCounters> countersByWeek = new LinkedHashMap<>();

        for (int i = WEEKLY_ACTIVITY_WEEKS - 1; i >= 0; i--) {
            countersByWeek.put(currentWeekStart.minusWeeks(i), new WeeklyActivityCounters());
        }

        for (ApplicationEntity application : applications) {
            Instant activityAt = application.getAppliedAt() != null ? application.getAppliedAt()
                    : application.getCreatedAt();
            if (activityAt == null) {
                continue;
            }

            LocalDate weekStart = weekStart(LocalDate.ofInstant(activityAt, zone));
            WeeklyActivityCounters counters = countersByWeek.get(weekStart);
            if (counters == null) {
                continue;
            }

            counters.applied++;
            if (isInterviewStatus(application.getStatus())) {
                counters.interviews++;
            }
            if (application.getStatus() == ApplicationStatus.OFFER) {
                counters.offers++;
            }
        }

        return countersByWeek.entrySet().stream()
                .map(entry -> new AnalyticsSummaryResponse.WeeklyActivityItem(
                        WEEK_LABEL_FORMATTER.format(entry.getKey()),
                        entry.getValue().applied,
                        entry.getValue().interviews,
                        entry.getValue().offers))
                .toList();
    }

    private LocalDate weekStart(LocalDate date) {
        return date.minusDays(date.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue());
    }

    private boolean isInterviewStatus(ApplicationStatus status) {
        return status == ApplicationStatus.HR_SCREEN
                || status == ApplicationStatus.TECH_INTERVIEW
                || status == ApplicationStatus.FINAL
                || status == ApplicationStatus.OFFER;
    }

    private static class WeeklyActivityCounters {
        private int applied;
        private int interviews;
        private int offers;
    }

    private List<AnalyticsSummaryResponse.SkillGapItem> buildSkillGaps(List<ApplicationEntity> applications,
            UUID userId) {
        // Get user profile skills
        List<String> userSkills = new ArrayList<>();
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            if (profile.getSkills() != null) {
                userSkills.addAll(profile.getSkills().stream()
                        .map(String::toLowerCase)
                        .toList());
            }
        });

        // Collect all tags from vacancies (excluding SAVED status)
        Map<String, Integer> tagFrequency = applications.stream()
                .filter(app -> app.getStatus() != ApplicationStatus.SAVED)
                .filter(app -> app.getVacancy() != null)
                .filter(app -> app.getVacancy().getTags() != null)
                .flatMap(app -> app.getVacancy().getTags().stream())
                .collect(Collectors.groupingBy(
                        tag -> tag.getTag().toLowerCase(),
                        Collectors.summingInt(tag -> 1)));

        // Build skill gap items
        return tagFrequency.entrySet().stream()
                .map(entry -> new AnalyticsSummaryResponse.SkillGapItem(
                        entry.getKey(),
                        entry.getValue(),
                        userSkills.contains(entry.getKey())))
                .sorted(Comparator.comparingInt(AnalyticsSummaryResponse.SkillGapItem::frequency).reversed())
                .limit(10)
                .toList();
    }

    private double calculateAvgTimeToInterview(List<ApplicationEntity> applications) {
        List<Long> daysToInterview = applications.stream()
                .filter(app -> app.getFirstInterviewAt() != null && app.getAppliedAt() != null)
                .map(app -> Duration.between(app.getAppliedAt(), app.getFirstInterviewAt()).toDays())
                .toList();

        if (daysToInterview.isEmpty()) {
            return 0.0;
        }

        return daysToInterview.stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
    }
}
