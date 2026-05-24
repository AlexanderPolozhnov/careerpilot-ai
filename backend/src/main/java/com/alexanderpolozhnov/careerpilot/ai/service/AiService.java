package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeGenerationRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeMatchRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public interface AiService {

    CompletableFuture<AiResponse> analyzeVacancy(AiAnalyzeVacancyRequest request);

    CompletableFuture<AiResponse> resumeMatch(AiResumeMatchRequest request);

    CompletableFuture<AiResponse> coverLetter(AiCoverLetterRequest request);

    CompletableFuture<AiResponse> interviewQuestions(AiInterviewQuestionsRequest request);

    CompletableFuture<AiResponse> generateResume(AiResumeGenerationRequest request);

    List<AiResultDto> history(String type);

    AiResultDto historyById(UUID id);
}
