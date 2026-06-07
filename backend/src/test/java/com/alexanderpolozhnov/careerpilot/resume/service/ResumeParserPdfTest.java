package com.alexanderpolozhnov.careerpilot.resume.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResumeParserPdfTest {
    @Test
    void testPdf() throws Exception {
        ResumeParserService resumeParserService = new ResumeParserServiceImpl();
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "application/pdf", "%PDF-1.4\n%EOF".getBytes());
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            resumeParserService.extractText(file);
        });
        assertTrue(exception.getMessage().contains("Failed to extract text from file"));
    }
}
