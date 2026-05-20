package com.alexanderpolozhnov.careerpilot.task.mapper;

import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.request.TaskRequest;
import com.alexanderpolozhnov.careerpilot.task.response.TaskResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Mapper(componentModel = "spring")
public interface TaskMapper {
    @Mapping(target = "applicationId", source = "application.id")
    TaskResponse toResponse(TaskEntity entity);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "application", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "reminderSent", ignore = true)
    void updateEntity(TaskRequest request, @MappingTarget TaskEntity entity);

    default Instant map(LocalDateTime value) {
        return value != null ? value.atZone(ZoneOffset.UTC).toInstant() : null;
    }
}
