package com.alexanderpolozhnov.careerpilot.vacancy.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.CreateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.UpdateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyTagEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.mapper.VacancyMapper;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.JoinType;
import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VacancyServiceImpl implements VacancyService {

    private final VacancyRepository vacancyRepository;
    private final CompanyRepository companyRepository;
    private final CurrentUserResolver currentUserResolver;
    private final VacancyMapper vacancyMapper;

    @Override
    public VacancyDto create(CreateVacancyDto request) {
        validateSalaryRange(request.salaryMin(), request.salaryMax());
        AuthEntity currentUser = currentUserResolver.resolveRequired();
        VacancyEntity entity = new VacancyEntity();
        entity.setUser(currentUser);
        entity.setTitle(request.title().trim());
        entity.setSourceUrl(request.url());
        entity.setDescriptionRaw(request.description());
        entity.setLocation(request.location());
        entity.setRemoteType(request.remote() == null ? entity.getRemoteType() : request.remote());
        entity.setSalaryFrom(request.salaryMin());
        entity.setSalaryTo(request.salaryMax());
        entity.setCurrency(request.salaryCurrency());
        entity.setEmploymentType(request.contractType());
        entity.setDeadline(request.deadline());
        entity.setStatus(VacancyStatus.ACTIVE);
        entity.setCompany(resolveCompanyOrNull(currentUser.getId(), request.companyId()));
        replaceTags(entity, request.tagIds());
        return vacancyMapper.toDto(vacancyRepository.save(entity));
    }

    @Override
    public PagedResponse<VacancyDto> list(
            int page,
            int size,
            String sort,
            String direction,
            String search,
            String status,
            String remote,
            String companyId,
            String tag
    ) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(parseDirection(direction), mapSortField(sort))
        );

        Specification<VacancyEntity> specification = byUser(userId)
                .and(bySearch(search))
                .and(byStatus(status))
                .and(byRemote(remote))
                .and(byCompany(companyId))
                .and(byTag(tag));

        Page<VacancyDto> mappedPage = vacancyRepository.findAll(specification, pageable)
                .map(vacancyMapper::toDto);
        return PagedResponse.fromPage(mappedPage);
    }

    @Override
    public VacancyDto getById(UUID id) {
        return vacancyMapper.toDto(findOwnedVacancy(id));
    }

    @Override
    public VacancyDto update(UUID id, UpdateVacancyDto request) {
        validateSalaryRange(request.salaryMin(), request.salaryMax());
        UUID userId = currentUserResolver.resolveRequired().getId();
        VacancyEntity entity = findOwnedVacancy(id);
        if (request.title() != null && !request.title().isBlank()) {
            entity.setTitle(request.title().trim());
        }
        if (request.companyId() != null) {
            entity.setCompany(resolveCompanyOrNull(userId, request.companyId()));
        }
        if (request.url() != null) {
            entity.setSourceUrl(request.url());
        }
        if (request.description() != null) {
            entity.setDescriptionRaw(request.description());
        }
        if (request.location() != null) {
            entity.setLocation(request.location());
        }
        if (request.remote() != null) {
            entity.setRemoteType(request.remote());
        }
        if (request.salaryMin() != null) {
            entity.setSalaryFrom(request.salaryMin());
        }
        if (request.salaryMax() != null) {
            entity.setSalaryTo(request.salaryMax());
        }
        if (request.salaryCurrency() != null) {
            entity.setCurrency(request.salaryCurrency());
        }
        if (request.contractType() != null) {
            entity.setEmploymentType(request.contractType());
        }
        if (request.deadline() != null) {
            entity.setDeadline(request.deadline());
        }
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (request.tagIds() != null) {
            replaceTags(entity, request.tagIds());
        }
        return vacancyMapper.toDto(vacancyRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        vacancyRepository.delete(findOwnedVacancy(id));
    }

    private VacancyEntity findOwnedVacancy(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        return vacancyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
    }

    private CompanyEntity resolveCompanyOrNull(UUID userId, String companyId) {
        if (companyId == null || companyId.isBlank()) {
            return null;
        }
        try {
            UUID parsed = UUID.fromString(companyId);
            return companyRepository.findByIdAndUserId(parsed, userId)
                    .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid companyId");
        }
    }

    private void replaceTags(VacancyEntity entity, java.util.List<String> tagIds) {
        entity.getTags().clear();
        if (tagIds == null || tagIds.isEmpty()) {
            return;
        }
        for (String tagId : tagIds) {
            if (tagId == null || tagId.isBlank()) {
                continue;
            }
            VacancyTagEntity tag = new VacancyTagEntity();
            tag.setVacancy(entity);
            tag.setTag(tagId.trim());
            entity.getTags().add(tag);
        }
    }

    private void validateSalaryRange(Integer salaryMin, Integer salaryMax) {
        if (salaryMin != null && salaryMax != null && salaryMin > salaryMax) {
            throw new IllegalArgumentException("salaryMin must be less than or equal to salaryMax");
        }
    }

    private Sort.Direction parseDirection(String direction) {
        return "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private String mapSortField(String sort) {
        if ("updatedAt".equalsIgnoreCase(sort)) {
            return "updatedAt";
        }
        if ("title".equalsIgnoreCase(sort)) {
            return "title";
        }
        return "createdAt";
    }

    private Specification<VacancyEntity> byUser(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    private Specification<VacancyEntity> bySearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String likeValue = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), likeValue),
                cb.like(cb.lower(cb.coalesce(root.get("descriptionRaw"), "")), likeValue),
                cb.like(cb.lower(cb.coalesce(root.get("location"), "")), likeValue)
        );
    }

    private Specification<VacancyEntity> byStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            VacancyStatus parsed = VacancyStatus.valueOf(status.trim().toUpperCase());
            return (root, query, cb) -> cb.equal(root.get("status"), parsed);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid status value");
        }
    }

    private Specification<VacancyEntity> byRemote(String remote) {
        if (remote == null || remote.isBlank()) {
            return null;
        }
        try {
            com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType parsed =
                    com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType.valueOf(remote.trim().toUpperCase());
            return (root, query, cb) -> cb.equal(root.get("remoteType"), parsed);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid remote value");
        }
    }

    private Specification<VacancyEntity> byCompany(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            return null;
        }
        try {
            UUID parsed = UUID.fromString(companyId);
            return (root, query, cb) -> cb.equal(root.get("company").get("id"), parsed);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid companyId");
        }
    }

    private Specification<VacancyEntity> byTag(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }
        return (root, query, cb) -> {
            query.distinct(true);
            var tagsJoin = root.join("tags", JoinType.LEFT);
            return cb.equal(cb.lower(tagsJoin.get("tag")), tag.trim().toLowerCase());
        };
    }
}
