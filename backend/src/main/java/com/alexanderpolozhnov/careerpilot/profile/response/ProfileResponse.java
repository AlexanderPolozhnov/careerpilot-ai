package com.alexanderpolozhnov.careerpilot.profile.response;

import java.util.List;
import java.util.UUID;

public record ProfileResponse(
        UUID id,
        UUID userId,
        String headline,
        String location,
        Integer yearsOfExperience,
        List<String> skills,
        String linkedinUrl,
        String githubUrl,
        String portfolioUrl) {
}
