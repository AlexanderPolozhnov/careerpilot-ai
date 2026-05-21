package com.alexanderpolozhnov.careerpilot.notification.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewType;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.notification.repository.NotificationRepository;
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

    @Mock
    private NotificationRepository notificationRepository;

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

        // Default empty responses for all repository calls to avoid NPEs
        lenient().when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(any(), any()))
                .thenReturn(List.of());
        lenient().when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(any(), any()))
                .thenReturn(List.of());
        lenient().when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentTrue(any(), any()))
                .thenReturn(List.of());
        lenient().when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentTrue(any(), any()))
                .thenReturn(List.of());
    }

    @Test
    void checkAndSendRemindersProcessesInterviews() {
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(
                argThat(t -> t.isAfter(Instant.now().minusSeconds(30))),
                any(Instant.class)))
                .thenReturn(List.of(interview));
        when(interviewRepository.save(any(InterviewEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        reminderScheduler.checkAndSendReminders();

        verify(notificationCreator).createNotification(eq(user), eq(NotificationType.INTERVIEW_REMINDER), 
                anyString(), anyString(), eq(interview.getId()), eq("INTERVIEW"), eq(false));
        verify(interviewRepository, times(1)).save(interview);
        assertThat(interview.isReminderSent()).isTrue();
    }

    @Test
    void checkAndSendRemindersProcessesTasks() {
        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(
                argThat(t -> t.isAfter(Instant.now().minusSeconds(30))),
                any(Instant.class)))
                .thenReturn(List.of(task));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        reminderScheduler.checkAndSendReminders();

        verify(notificationCreator).createNotification(eq(user), eq(NotificationType.TASK_DUE), 
                anyString(), anyString(), eq(task.getId()), eq("TASK"), eq(false));
        verify(taskRepository, times(1)).save(task);
        assertThat(task.isReminderSent()).isTrue();
    }

    @Test
    void checkAndSendRemindersSkipsWhenDisabled() {
        ReflectionTestUtils.setField(reminderScheduler, "schedulerEnabled", false);

        reminderScheduler.checkAndSendReminders();

        verify(interviewRepository, never()).findAllByScheduledAtBetweenAndReminderSentFalse(any(), any());
        verify(taskRepository, never()).findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(any(), any());
        verify(notificationCreator, never()).createNotification(any(), any(), any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void checkAndSendRemindersHandlesEmptyLists() {
        // Already mocked to return empty lists in setUp
        reminderScheduler.checkAndSendReminders();

        verify(notificationCreator, never()).createNotification(any(), any(), any(), any(), any(), any(), anyBoolean());
    }

    @Test
    void checkAndSendRemindersContinuesOnError() {
        // 1. Upcoming interview (will fail save)
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(
                argThat(t -> t.isAfter(Instant.now().minusSeconds(30))), any()))
                .thenReturn(List.of(interview));
        when(interviewRepository.save(any(InterviewEntity.class))).thenThrow(new RuntimeException("Test error"));

        // 2. Upcoming task
        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(
                argThat(t -> t.isAfter(Instant.now().minusSeconds(30))), any()))
                .thenReturn(List.of(task));
        when(taskRepository.save(any(TaskEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        reminderScheduler.checkAndSendReminders();

        // Should continue to process tasks even if interview save fails
        verify(notificationCreator, atLeast(2)).createNotification(any(), any(), any(), any(), any(), any(), anyBoolean());
        verify(taskRepository).save(task);
    }

    @Test
    void checkAndSendRemindersProcessesOverdueItems() {
        // Mock overdue interview (start date is before now - 6 days)
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentFalse(
                argThat(t -> t.isBefore(Instant.now().minus(Duration.ofDays(6)))),
                any(Instant.class)))
                .thenReturn(List.of(interview));
        
        // Mock overdue task
        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentFalse(
                argThat(t -> t.isBefore(Instant.now().minus(Duration.ofDays(6)))),
                any(Instant.class)))
                .thenReturn(List.of(task));

        // Mock items with existing reminders that should be marked as read
        when(interviewRepository.findAllByScheduledAtBetweenAndReminderSentTrue(any(), any()))
                .thenReturn(List.of(interview));
        when(taskRepository.findAllByDueAtBetweenAndDoneFalseAndReminderSentTrue(any(), any()))
                .thenReturn(List.of(task));

        reminderScheduler.checkAndSendReminders();

        // Verify MISSED/OVERDUE notifications created
        verify(notificationCreator).createNotification(eq(user), eq(NotificationType.INTERVIEW_MISSED), 
                anyString(), anyString(), eq(interview.getId()), eq("INTERVIEW"), eq(true));
        verify(notificationCreator).createNotification(eq(user), eq(NotificationType.TASK_OVERDUE), 
                anyString(), anyString(), eq(task.getId()), eq("TASK"), eq(true));
        
        // Verify marked as read in repository
        verify(notificationRepository).markAsReadByReference(interview.getId(), "INTERVIEW");
        verify(notificationRepository).markAsReadByReference(task.getId(), "TASK");
        
        verify(interviewRepository).save(interview);
        verify(taskRepository).save(task);
    }
}
