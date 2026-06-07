package com.alexanderpolozhnov.careerpilot.resume.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertThrows;

class ResumeParserServiceImplTest {

    private final ResumeParserService resumeParserService = new ResumeParserServiceImpl();

    @Test
    void extractText_shouldThrowIfFileIsEmpty() {
        MockMultipartFile file = new MockMultipartFile("file", new byte[0]);
        assertThrows(IllegalArgumentException.class, () -> resumeParserService.extractText(file));
    }

    @Test
    void extractText_shouldThrowIfFormatIsUnsupported() {
        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "Hello".getBytes());
        assertThrows(IllegalArgumentException.class, () -> resumeParserService.extractText(file));
    }
}
