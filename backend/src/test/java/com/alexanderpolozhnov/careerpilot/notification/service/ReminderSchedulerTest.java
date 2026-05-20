package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewType;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskPriority;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReminderSchedulerTest {

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private NotificationCreator notificationCreator;

    @InjectMocks
    private ReminderScheduler reminderScheduler;

    private AuthEntity user;
    private InterviewEntity interview;
    private TaskEntity task;
    private ApplicationEntity application;

    @BeforeEach
    void setUp() {
        user = new AuthEntity();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.com");

        application = new ApplicationEntity();
        application.setId(UUID.randomUUID());
        application.setUser(user);

        interview = new InterviewEntity();
        interview.setId(UUID.randomUUID());
        interview.setApplication(application);
        interview.setType(InterviewType.TECH_INTERVIEW);
        interview.setScheduledAt(Instant.now().plus(Duration.ofHours(12)));
        interview.setReminderSent(false);

        task = new TaskEntity();
        task.setId(UUID.randomUUID());
        task.setUser(user);
        task.setTitle("Test task");
        task.setDueAt(Instant.now().plus(Duration.ofHours(6)));
        task.setDone(false);
        task.setReminderSent(false);
        task.setPriority(TaskPriority.MEDIUM);

        // Enable scheduler by default in tests
        ReflectionTestUtils.setField(reminderScheduler, "schedulerEnabled", true);
    }

    @Test
    void checkAndSendRemindersProcessesInterviews() {
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of(interview));
        when(interviewRepository.save(any(InterviewEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        reminderScheduler.checkAndSendReminders();

        verify(notificationCreator).createNotification(eq(user), any(), any(), any());
        verify(interviewRepository).save(interview);
        assertThat(interview.isReminderSent()).isTrue();
    }

    @Test
    void checkAndSendRemindersProcessesTasks() {
        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of(task));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        reminderScheduler.checkAndSendReminders();

        verify(notificationCreator).createNotification(eq(user), any(), any(), any());
        verify(taskRepository).save(task);
        assertThat(task.isReminderSent()).isTrue();
    }

    @Test
    void checkAndSendRemindersSkipsWhenDisabled() {
        ReflectionTestUtils.setField(reminderScheduler, "schedulerEnabled", false);

        reminderScheduler.checkAndSendReminders();

        verify(interviewRepository, never()).findAllByScheduledAtBetweenAndReminderSentFalse(any(), any());
        verify(taskRepository, never()).findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(any(), any());
        verify(notificationCreator, never()).createNotification(any(), any(), any(), any());
    }

    @Test
    void checkAndSendRemindersHandlesEmptyLists() {
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of());
        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of());

        reminderScheduler.checkAndSendReminders();

        verify(notificationCreator, never()).createNotification(any(), any(), any(), any());
    }

    @Test
    void checkAndSendRemindersContinuesOnError() {
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of(interview));
        when(interviewRepository.save(any(InterviewEntity.class))).thenThrow(new RuntimeException("Test error"));

        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(any(Instant.class),
                any(Instant.class)))
                .thenReturn(List.of(task));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        reminderScheduler.checkAndSendReminders();

        // Should continue to process tasks even if interview save fails
        // createNotification is called for both interview (before save fails) and task
        verify(notificationCreator, times(2)).createNotification(eq(user), any(), any(), any());
        verify(taskRepository).save(task);
    }
}
