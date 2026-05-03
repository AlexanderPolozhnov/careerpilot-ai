package com.alexanderpolozhnov.careerpilot.ai.controller;

import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeMatchRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import com.alexanderpolozhnov.careerpilot.ai.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/analyze-vacancy")
    public AiResponse analyzeVacancy(@RequestBody AiAnalyzeVacancyRequest request) {
        return aiService.analyzeVacancy(request);
    }

    @PostMapping("/resume-match")
    public AiResponse resumeMatch(@RequestBody AiResumeMatchRequest request) {
        return aiService.resumeMatch(request);
    }

    @PostMapping("/cover-letter")
    public AiResponse coverLetter(@RequestBody AiCoverLetterRequest request) {
        return aiService.coverLetter(request);
    }

    @PostMapping("/interview-questions")
    public AiResponse interviewQuestions(@RequestBody AiInterviewQuestionsRequest request) {
        return aiService.interviewQuestions(request);
    }

    @GetMapping("/history")
    public List<AiResultDto> history(@RequestParam(required = false) String type) {
        return aiService.history(type);
    }

    @GetMapping("/history/{id}")
    public AiResultDto historyById(@PathVariable UUID id) {
        return aiService.historyById(id);
    }
}
