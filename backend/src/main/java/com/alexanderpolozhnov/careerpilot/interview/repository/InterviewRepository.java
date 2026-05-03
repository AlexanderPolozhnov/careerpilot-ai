package com.alexanderpolozhnov.careerpilot.interview.repository;

import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface InterviewRepository extends JpaRepository<InterviewEntity, UUID> {
    List<InterviewEntity> findAllByApplicationId(UUID applicationId);

    List<InterviewEntity> findAllByScheduledAtBetween(Instant from, Instant to);

    List<InterviewEntity> findAllByApplication_User_IdAndScheduledAtAfterOrderByScheduledAtAsc(UUID userId,
                                                                                               Instant after);
}
