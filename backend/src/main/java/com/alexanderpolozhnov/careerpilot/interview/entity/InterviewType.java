package com.alexanderpolozhnov.careerpilot.interview.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum InterviewType {
    HR_SCREEN,
    TECH_SCREEN,
    TECH_INTERVIEW,
    FINAL,
    OTHER;

    @JsonCreator
    public static InterviewType fromJson(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return switch (value.trim().toUpperCase()) {
            case "PHONE", "HR" -> HR_SCREEN;
            case "TECHNICAL", "SYSTEM_DESIGN" -> TECH_INTERVIEW;
            case "CULTURE_FIT" -> OTHER;
            default -> InterviewType.valueOf(value.trim().toUpperCase());
        };
    }
}
