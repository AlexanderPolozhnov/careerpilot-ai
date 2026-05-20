package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReminderScheduler {

    private final InterviewRepository interviewRepository;
    private final TaskRepository taskRepository;
    private final NotificationCreator notificationCreator;

    @Value("${reminder.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("dd.MM.yyyy HH:mm")
            .withZone(ZoneId.of("Europe/Moscow"));

    @Scheduled(cron = "${reminder.scheduler.cron:0 0 * * * *}")
    @Transactional
    public void checkAndSendReminders() {
        if (!schedulerEnabled) {
            log.info("Reminder scheduler is disabled, skipping check");
            return;
        }

        log.info("Starting reminder check at {}", Instant.now());

        Instant now = Instant.now();
        Instant windowEnd = now.plus(Duration.ofHours(24));

        // Check interviews
        List<InterviewEntity> upcomingInterviews = interviewRepository
                .findAllByScheduledAtBetweenAndReminderSentFalse(now, windowEnd);
        
        log.info("Found {} upcoming interviews without reminders", upcomingInterviews.size());
        
        for (InterviewEntity interview : upcomingInterviews) {
            try {
                AuthEntity user = interview.getApplication().getUser();
                String title = "Напоминание о собеседовании";
                String message = String.format("У вас запланировано собеседование типа %s на %s", 
                        interview.getType(), DATE_FORMATTER.format(interview.getScheduledAt()));
                
                notificationCreator.createNotification(user, NotificationType.INTERVIEW_REMINDER, title, message);
                
                interview.setReminderSent(true);
                interviewRepository.save(interview);
                
                log.info("Sent reminder for interview {} at {}", interview.getId(), interview.getScheduledAt());
            } catch (Exception e) {
                log.error("Failed to process reminder for interview {}", interview.getId(), e);
            }
        }

        // Check tasks
        List<TaskEntity> upcomingTasks = taskRepository
                .findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(now, windowEnd);
        
        log.info("Found {} upcoming tasks without reminders", upcomingTasks.size());
        
        for (TaskEntity task : upcomingTasks) {
            try {
                AuthEntity user = task.getUser();
                String title = "Напоминание о задаче";
                String message = String.format("Задача \"%s\" должна быть выполнена до %s", 
                        task.getTitle(), DATE_FORMATTER.format(task.getDueAt()));
                
                notificationCreator.createNotification(user, NotificationType.TASK_DUE, title, message);
                
                task.setReminderSent(true);
                taskRepository.save(task);
                
                log.info("Sent reminder for task {} due at {}", task.getId(), task.getDueAt());
            } catch (Exception e) {
                log.error("Failed to process reminder for task {}", task.getId(), e);
            }
        }

        log.info("Reminder check completed");
    }
}
