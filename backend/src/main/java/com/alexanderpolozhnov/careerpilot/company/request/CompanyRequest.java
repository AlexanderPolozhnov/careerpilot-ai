package com.alexanderpolozhnov.careerpilot.company.request;

import com.alexanderpolozhnov.careerpilot.company.entity.CompanySize;
import jakarta.validation.constraints.Size;

public record CompanyRequest(
        @Size(max = 255) String name,
        @Size(max = 2048) String website,
        @Size(max = 255) String industry,
        CompanySize size,
        @Size(max = 255) String location,
        String description,
        @Size(max = 2048) String linkedinUrl,
        @Size(max = 2048) String logoUrl
) {
}
