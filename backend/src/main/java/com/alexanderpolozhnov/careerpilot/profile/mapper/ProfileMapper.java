package com.alexanderpolozhnov.careerpilot.profile.mapper;

import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileResponse toResponse(ProfileEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ProfileRequest request, @MappingTarget ProfileEntity entity);
}
