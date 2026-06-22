package com.alexanderpolozhnov.careerpilot.monitoring.mapper;

import com.alexanderpolozhnov.careerpilot.monitoring.entity.VacancyFilterEntity;
import com.alexanderpolozhnov.careerpilot.monitoring.request.VacancyFilterRequest;
import com.alexanderpolozhnov.careerpilot.monitoring.response.VacancyFilterResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VacancyFilterMapper {
    @Mapping(target = "userId", source = "user.id")
    VacancyFilterResponse toResponse(VacancyFilterEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "lastPolledAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(VacancyFilterRequest request, @MappingTarget VacancyFilterEntity entity);
}
