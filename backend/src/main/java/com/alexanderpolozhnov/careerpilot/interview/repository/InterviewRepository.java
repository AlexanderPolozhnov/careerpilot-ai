package com.alexanderpolozhnov.careerpilot.interview.repository;

import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<InterviewEntity, UUID> {
    @EntityGraph(attributePaths = { "application", "application.vacancy", "application.vacancy.company" })
    List<InterviewEntity> findAllByApplication_User_Id(UUID userId);

    List<InterviewEntity> findAllByApplicationId(UUID applicationId);

    List<InterviewEntity> findAllByScheduledAtBetween(Instant from, Instant to);

    List<InterviewEntity> findAllByScheduledAtBetweenAndReminderSentFalse(Instant from, Instant to);

    List<InterviewEntity> findAllByScheduledAtBeforeAndReminderSentFalse(Instant before);

    List<InterviewEntity> findAllByScheduledAtBeforeAndReminderSentTrue(Instant before);

    List<InterviewEntity> findAllByScheduledAtBetweenAndReminderSentTrue(Instant from, Instant to);

    @EntityGraph(attributePaths = { "application", "application.vacancy", "application.vacancy.company" })
    List<InterviewEntity> findAllByApplication_User_IdAndScheduledAtAfterOrderByScheduledAtAsc(UUID userId,
            Instant after);

    @EntityGraph(attributePaths = { "application", "application.vacancy", "application.vacancy.company" })
    List<InterviewEntity> findAllByApplication_User_IdAndNotesContainingIgnoreCase(UUID userId, String notes);
}
