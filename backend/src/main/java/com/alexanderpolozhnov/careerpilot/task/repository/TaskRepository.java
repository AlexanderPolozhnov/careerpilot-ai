package com.alexanderpolozhnov.careerpilot.task.repository;

import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {
    List<TaskEntity> findAllByUserId(UUID userId);
    List<TaskEntity> findAllByUserIdAndDone(UUID userId, boolean done);
    List<TaskEntity> findAllByDueAtBeforeAndDoneFalse(Instant dueAt);
}
