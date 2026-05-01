package com.alexanderpolozhnov.careerpilot.company.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.company.request.CompanyRequest;
import com.alexanderpolozhnov.careerpilot.company.response.CompanyResponse;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public CompanyResponse create(CompanyRequest request) {
        AuthEntity currentUser = currentUserResolver.resolveRequired();
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Company name is required");
        }
        CompanyEntity entity = new CompanyEntity();
        entity.setUser(currentUser);
        applyRequest(entity, request, false);
        return toResponse(companyRepository.save(entity));
    }

    @Override
    public PagedResponse<CompanyResponse> list(int page, int size, String sortBy, String direction, String search) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(parseDirection(direction), mapSortField(sortBy))
        );
        Specification<CompanyEntity> specification = byUser(userId).and(bySearch(search));
        Page<CompanyResponse> mappedPage = companyRepository.findAll(specification, pageable)
                .map(this::toResponse);
        log.info("companies.list userId={} page={} size={} total={}",
                userId, page, size, mappedPage.getTotalElements());
        return PagedResponse.fromPage(mappedPage);
    }

    @Override
    public CompanyResponse getById(UUID id) {
        return toResponse(findOwnedCompany(id));
    }

    @Override
    public CompanyResponse update(UUID id, CompanyRequest request) {
        CompanyEntity entity = findOwnedCompany(id);
        applyRequest(entity, request, true);
        return toResponse(companyRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        companyRepository.delete(findOwnedCompany(id));
    }

    private CompanyEntity findOwnedCompany(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        return companyRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
    }

    private CompanyResponse toResponse(CompanyEntity entity) {
        return new CompanyResponse(
                entity.getId(),
                entity.getName(),
                entity.getWebsite(),
                entity.getIndustry(),
                entity.getSize(),
                entity.getLocation(),
                entity.getDescription(),
                entity.getLinkedinUrl(),
                entity.getLogoUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private void applyRequest(CompanyEntity entity, CompanyRequest request, boolean partialUpdate) {
        if (request.name() != null && !request.name().isBlank()) {
            entity.setName(request.name().trim());
        }
        if (!partialUpdate || request.website() != null) {
            entity.setWebsite(trimOrNull(request.website()));
        }
        if (!partialUpdate || request.industry() != null) {
            entity.setIndustry(trimOrNull(request.industry()));
        }
        if (!partialUpdate || request.size() != null) {
            entity.setSize(request.size());
        }
        if (!partialUpdate || request.location() != null) {
            entity.setLocation(trimOrNull(request.location()));
        }
        if (!partialUpdate || request.description() != null) {
            entity.setDescription(trimOrNull(request.description()));
        }
        if (!partialUpdate || request.linkedinUrl() != null) {
            entity.setLinkedinUrl(trimOrNull(request.linkedinUrl()));
        }
        if (!partialUpdate || request.logoUrl() != null) {
            entity.setLogoUrl(trimOrNull(request.logoUrl()));
        }
    }

    private Sort.Direction parseDirection(String direction) {
        return "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private String mapSortField(String sortBy) {
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            return "updatedAt";
        }
        if ("name".equalsIgnoreCase(sortBy)) {
            return "name";
        }
        return "createdAt";
    }

    private Specification<CompanyEntity> byUser(UUID userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    private Specification<CompanyEntity> bySearch(String search) {
        if (search == null || search.isBlank()) {
            return null;
        }
        String likeValue = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), likeValue),
                cb.like(cb.lower(cb.coalesce(root.get("industry"), "")), likeValue),
                cb.like(cb.lower(cb.coalesce(root.get("location"), "")), likeValue),
                cb.like(cb.lower(cb.coalesce(root.get("website"), "")), likeValue),
                cb.like(cb.lower(cb.coalesce(root.get("description"), "")), likeValue)
        );
    }

    private String trimOrNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
