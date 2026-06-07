package com.alexanderpolozhnov.careerpilot.ai.controller;

import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeGenerationRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeMatchRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import com.alexanderpolozhnov.careerpilot.ai.service.AiService;
import com.alexanderpolozhnov.careerpilot.ai.request.AiProviderConfigRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiTestConnectionResponse;
import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.common.ratelimit.RateLimit;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @RateLimit(key = "ai_generation", capacity = 10, refillTokens = 10, refillDurationMinutes = 60)
    @Auditable(action = "AI_USE", entityType = "AI")
    @PostMapping("/analyze-vacancy")
    public CompletableFuture<AiResponse> analyzeVacancy(@Valid @RequestBody AiAnalyzeVacancyRequest request) {
        return aiService.analyzeVacancy(request);
    }

    @RateLimit(key = "ai_generation", capacity = 10, refillTokens = 10, refillDurationMinutes = 60)
    @Auditable(action = "AI_USE", entityType = "AI")
    @PostMapping("/resume-match")
    public CompletableFuture<AiResponse> resumeMatch(@Valid @RequestBody AiResumeMatchRequest request) {
        return aiService.resumeMatch(request);
    }

    @RateLimit(key = "ai_generation", capacity = 10, refillTokens = 10, refillDurationMinutes = 60)
    @Auditable(action = "AI_USE", entityType = "AI")
    @PostMapping("/cover-letter")
    public CompletableFuture<AiResponse> coverLetter(@Valid @RequestBody AiCoverLetterRequest request) {
        return aiService.coverLetter(request);
    }

    @RateLimit(key = "ai_generation", capacity = 10, refillTokens = 10, refillDurationMinutes = 60)
    @Auditable(action = "AI_USE", entityType = "AI")
    @PostMapping("/interview-questions")
    public CompletableFuture<AiResponse> interviewQuestions(@Valid @RequestBody AiInterviewQuestionsRequest request) {
        return aiService.interviewQuestions(request);
    }

    @RateLimit(key = "ai_generation", capacity = 10, refillTokens = 10, refillDurationMinutes = 60)
    @Auditable(action = "AI_USE", entityType = "AI")
    @PostMapping("/generate-resume")
    public CompletableFuture<AiResponse> generateResume(@Valid @RequestBody AiResumeGenerationRequest request) {
        return aiService.generateResume(request);
    }

    @GetMapping("/history")
    public List<AiResultDto> history(@RequestParam(required = false) String type) {
        return aiService.history(type);
    }

    @PostMapping("/test-connection")
    public AiTestConnectionResponse testConnection(@Valid @RequestBody AiProviderConfigRequest request) {
        return aiService.testConnection(request);
    }

    @PostMapping("/models/sync")
    public List<String> syncModels(@Valid @RequestBody AiProviderConfigRequest request) {
        return aiService.syncModels(request);
    }

    @GetMapping("/history/{id}")
    public AiResultDto historyById(@PathVariable UUID id) {
        return aiService.historyById(id);
    }
}
