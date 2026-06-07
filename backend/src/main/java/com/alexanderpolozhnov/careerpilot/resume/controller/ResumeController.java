package com.alexanderpolozhnov.careerpilot.resume.controller;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.resume.request.ResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;
import com.alexanderpolozhnov.careerpilot.resume.service.ResumeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@Validated
@RequiredArgsConstructor
public class ResumeController {
    private final ResumeService service;
    private final com.alexanderpolozhnov.careerpilot.resume.service.ResumeParserService resumeParserService;

    @GetMapping
    public List<ResumeResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public ResumeResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @PostMapping
    @Auditable(action = "RESUME_CREATE", entityType = "RESUME")
    public ResumeResponse create(@Valid @RequestBody ResumeRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Auditable(action = "RESUME_UPDATE", entityType = "RESUME")
    public ResumeResponse update(@PathVariable UUID id, @Valid @RequestBody ResumeRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/default")
    @Auditable(action = "RESUME_SET_DEFAULT", entityType = "RESUME")
    public ResumeResponse setAsDefault(@PathVariable UUID id) {
        return service.setAsDefault(id);
    }

    @DeleteMapping("/{id}")
    @Auditable(action = "RESUME_DELETE", entityType = "RESUME")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PostMapping(value = "/extract", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Auditable(action = "RESUME_EXTRACT", entityType = "RESUME")
    public com.alexanderpolozhnov.careerpilot.resume.response.ResumeExtractionResponse extractText(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String extractedText = resumeParserService.extractText(file);
        return new com.alexanderpolozhnov.careerpilot.resume.response.ResumeExtractionResponse(extractedText);
    }
}
