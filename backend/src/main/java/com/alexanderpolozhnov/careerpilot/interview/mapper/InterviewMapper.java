package com.alexanderpolozhnov.careerpilot.interview.mapper;

import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.response.InterviewResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface InterviewMapper {

    @Mapping(target = "applicationId", source = "application.id")
    @Mapping(target = "vacancyTitle", source = "application.vacancy.title")
    @Mapping(target = "companyName", source = "application.vacancy.company.name")
    @Mapping(target = "isSyncedWithGoogleCalendar", expression = "java(entity.getGoogleCalendarEventId() != null)")
    InterviewResponse toResponse(InterviewEntity entity);
}
