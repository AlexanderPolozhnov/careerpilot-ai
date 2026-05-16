package com.alexanderpolozhnov.careerpilot.resume.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResumeRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 255, message = "Name must not exceed 255 characters")
        String name,

        @Size(max = 2048, message = "File URL must not exceed 2048 characters")
        String fileUrl,

        String textContent,

        Boolean isDefault
) {
}
