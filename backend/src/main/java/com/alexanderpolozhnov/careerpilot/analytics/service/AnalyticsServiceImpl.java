package com.alexanderpolozhnov.careerpilot.analytics.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.analytics.request.AnalyticsRequest;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsResponse;
import com.alexanderpolozhnov.careerpilot.analytics.response.AnalyticsSummaryResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public AnalyticsResponse create(AnalyticsRequest request) {
        return new AnalyticsResponse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse summary() {
        List<ApplicationEntity> applications = applicationRepository.findAllByUserId(currentUserResolver.resolveRequired().getId());
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
                        total == 0 ? 0.0 : (entry.getValue() * 100.0) / total
                ))
                .toList();

        List<AnalyticsSummaryResponse.WeeklyActivityItem> weeklyActivity = List.of(
                new AnalyticsSummaryResponse.WeeklyActivityItem("Week 1", Math.max(total - 2, 0), Math.max(interviews - 1, 0), Math.max(offers - 1, 0)),
                new AnalyticsSummaryResponse.WeeklyActivityItem("Week 2", Math.max(total - 1, 0), Math.max(interviews, 0), Math.max(offers, 0)),
                new AnalyticsSummaryResponse.WeeklyActivityItem("Week 3", total, interviews, offers)
        );

        List<AnalyticsSummaryResponse.SkillGapItem> skillGaps = List.of(
                new AnalyticsSummaryResponse.SkillGapItem("System Design", 3, false),
                new AnalyticsSummaryResponse.SkillGapItem("Kubernetes", 2, false),
                new AnalyticsSummaryResponse.SkillGapItem("PostgreSQL", 4, true)
        );

        return new AnalyticsSummaryResponse(
                total,
                active,
                total == 0 ? 0.0 : (double) interviews / total,
                total == 0 ? 0.0 : (double) offers / total,
                total == 0 ? 0.0 : (double) responded / total,
                interviews == 0 ? 0.0 : 7.0,
                funnel,
                weeklyActivity,
                skillGaps
        );
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
}
