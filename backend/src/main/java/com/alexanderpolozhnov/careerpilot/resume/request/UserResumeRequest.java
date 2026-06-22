package com.alexanderpolozhnov.careerpilot.resume.request;

public record UserResumeRequest(
        String rawText,
        String coverLetterTemplate
) {
}
