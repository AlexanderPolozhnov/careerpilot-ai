package com.alexanderpolozhnov.careerpilot.company.response;

import com.alexanderpolozhnov.careerpilot.company.entity.CompanySize;

import java.time.Instant;
import java.util.UUID;

public record CompanyResponse(
        UUID id,
        String name,
        String website,
        String industry,
        CompanySize size,
        String location,
        String description,
        String linkedinUrl,
        String logoUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
