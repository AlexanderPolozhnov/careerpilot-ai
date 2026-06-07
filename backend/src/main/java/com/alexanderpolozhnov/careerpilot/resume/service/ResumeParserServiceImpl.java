package com.alexanderpolozhnov.careerpilot.resume.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ResumeParserServiceImpl implements ResumeParserService {

    @Override
    public String extractText(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        String contentType = file.getContentType() != null ? file.getContentType() : "";

        try {
            if (originalFilename.endsWith(".pdf") || "application/pdf".equals(contentType)) {
                return parsePdf(file);
            } else if (originalFilename.endsWith(".docx") || "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)) {
                return parseDocx(file);
            } else {
                throw new IllegalArgumentException("Unsupported file format. Only PDF and DOCX are allowed.");
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to extract text from file", e);
        }
    }

    private String parsePdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document).trim();
        }
    }

    private String parseDocx(MultipartFile file) throws IOException {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText().trim();
        }
    }
}
