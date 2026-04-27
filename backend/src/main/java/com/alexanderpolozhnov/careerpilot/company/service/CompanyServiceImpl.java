package com.alexanderpolozhnov.careerpilot.company.service;

import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.company.request.CompanyRequest;
import com.alexanderpolozhnov.careerpilot.company.response.CompanyResponse;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CurrentUserResolver currentUserResolver;

    @Override
    public CompanyResponse create(CompanyRequest request) {
        CompanyEntity entity = new CompanyEntity();
        entity.setUser(currentUserResolver.resolveOrCreate());
        entity.setName(normalizePayload(request.payload()));
        entity.setDescription(request.payload());
        return toResponse(companyRepository.save(entity));
    }

    @Override
    public List<CompanyResponse> list(int page, int size, String sortBy, String direction, String q) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        Comparator<CompanyEntity> comparator = buildComparator(sortBy);
        if ("desc".equalsIgnoreCase(direction)) {
            comparator = comparator.reversed();
        }
        final String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);

        List<CompanyEntity> filtered = companyRepository.findAllByUserId(userId).stream()
                .filter(entity -> query.isBlank() || asSearchableText(entity).contains(query))
                .sorted(comparator)
                .toList();
        return paginate(filtered, page, size).stream().map(this::toResponse).toList();
    }

    @Override
    public CompanyResponse getById(UUID id) {
        return toResponse(findOwnedCompany(id));
    }

    @Override
    public CompanyResponse update(UUID id, CompanyRequest request) {
        CompanyEntity entity = findOwnedCompany(id);
        entity.setName(normalizePayload(request.payload()));
        entity.setDescription(request.payload());
        return toResponse(companyRepository.save(entity));
    }

    @Override
    public void delete(UUID id) {
        companyRepository.delete(findOwnedCompany(id));
    }

    private CompanyEntity findOwnedCompany(UUID id) {
        UUID userId = currentUserResolver.resolveOrCreate().getId();
        CompanyEntity entity = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        if (!entity.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Company does not belong to current user");
        }
        return entity;
    }

    private CompanyResponse toResponse(CompanyEntity entity) {
        String payload = entity.getDescription() == null ? entity.getName() : entity.getDescription();
        return new CompanyResponse(entity.getId(), payload);
    }

    private String normalizePayload(String payload) {
        String trimmed = payload.trim();
        return trimmed.length() > 255 ? trimmed.substring(0, 255) : trimmed;
    }

    private Comparator<CompanyEntity> buildComparator(String sortBy) {
        if ("updatedAt".equalsIgnoreCase(sortBy)) {
            return Comparator.comparing(CompanyEntity::getUpdatedAt);
        }
        return Comparator.comparing(CompanyEntity::getCreatedAt);
    }

    private String asSearchableText(CompanyEntity entity) {
        String name = entity.getName() == null ? "" : entity.getName();
        String description = entity.getDescription() == null ? "" : entity.getDescription();
        return (name + " " + description).toLowerCase(Locale.ROOT);
    }

    private List<CompanyEntity> paginate(List<CompanyEntity> source, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int fromIndex = safePage * safeSize;
        if (fromIndex >= source.size()) {
            return List.of();
        }
        int toIndex = Math.min(fromIndex + safeSize, source.size());
        return source.subList(fromIndex, toIndex);
    }
}
