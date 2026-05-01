package com.alexanderpolozhnov.careerpilot.vacancy.mapper;

import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyCompanyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyTagDto;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyTagEntity;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class VacancyMapper {
    public VacancyDto toDto(VacancyEntity entity) {
        return new VacancyDto(
                entity.getId(),
                entity.getTitle(),
                entity.getCompany() == null ? null : entity.getCompany().getId().toString(),
                toCompanyDto(entity.getCompany()),
                entity.getSourceUrl(),
                entity.getDescriptionRaw(),
                entity.getLocation(),
                entity.getRemoteType(),
                entity.getSalaryFrom(),
                entity.getSalaryTo(),
                entity.getCurrency(),
                entity.getEmploymentType(),
                toTagDtos(entity.getTags(), entity.getId().toString()),
                entity.getStatus(),
                null,
                null,
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getDeadline()
        );
    }

    private VacancyCompanyDto toCompanyDto(CompanyEntity company) {
        if (company == null) {
            return null;
        }
        if (!Hibernate.isInitialized(company)) {
            return new VacancyCompanyDto(company.getId(), null);
        }
        return new VacancyCompanyDto(company.getId(), company.getName());
    }

    private List<VacancyTagDto> toTagDtos(List<VacancyTagEntity> tags, String prefix) {
        if (tags == null || tags.isEmpty()) {
            return List.of();
        }
        return tags.stream()
                .map(tag -> new VacancyTagDto(prefix + ":" + tag.getTag(), tag.getTag(), null))
                .toList();
    }
}
