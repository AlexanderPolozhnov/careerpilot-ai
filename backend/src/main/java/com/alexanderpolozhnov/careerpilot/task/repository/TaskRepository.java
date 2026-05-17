package com.alexanderpolozhnov.careerpilot.task.repository;

import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID>, JpaSpecificationExecutor<TaskEntity> {
    List<TaskEntity> findAllByUserId(UUID userId);

    Page<TaskEntity> findAllByUserId(UUID userId, Pageable pageable);

    List<TaskEntity> findAllByUserIdAndDone(UUID userId, boolean done);

    List<TaskEntity> findAllByDueAtBeforeAndDoneFalse(Instant dueAt);
}
