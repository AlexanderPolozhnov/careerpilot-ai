package com.alexanderpolozhnov.careerpilot.notification.mapper;

import com.alexanderpolozhnov.careerpilot.notification.dto.NotificationDto;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "message", target = "body")
    NotificationDto toDto(NotificationEntity entity);
}
