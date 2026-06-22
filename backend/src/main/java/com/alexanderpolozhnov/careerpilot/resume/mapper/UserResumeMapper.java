package com.alexanderpolozhnov.careerpilot.resume.mapper;

import com.alexanderpolozhnov.careerpilot.resume.entity.UserResumeEntity;
import com.alexanderpolozhnov.careerpilot.resume.request.UserResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.UserResumeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserResumeMapper {
    @Mapping(target = "userId", source = "user.id")
    UserResumeResponse toResponse(UserResumeEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UserResumeRequest request, @MappingTarget UserResumeEntity entity);
}
