package com.alexanderpolozhnov.careerpilot.resume.mapper;

import com.alexanderpolozhnov.careerpilot.resume.entity.ResumeEntity;
import com.alexanderpolozhnov.careerpilot.resume.request.ResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ResumeMapper {
    @Mapping(target = "userId", source = "user.id")
    ResumeResponse toResponse(ResumeEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ResumeRequest request, @MappingTarget ResumeEntity entity);
}
