package com.alexanderpolozhnov.careerpilot.profile.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.List;

public record ProfileRequest(
        @Size(max = 255) String headline,
        @Size(max = 255) String location,
        @Min(0) @Max(50) Integer yearsOfExperience,
        List<String> skills,
        @Size(max = 255) @URL String linkedinUrl,
        @Size(max = 255) @URL String githubUrl,
        @Size(max = 255) @URL String portfolioUrl) {
}
