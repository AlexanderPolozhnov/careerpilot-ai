package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeMatchRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;

import java.util.List;
import java.util.UUID;

public interface AiService {

    AiResponse analyzeVacancy(AiAnalyzeVacancyRequest request);

    AiResponse resumeMatch(AiResumeMatchRequest request);

    AiResponse coverLetter(AiCoverLetterRequest request);

    AiResponse interviewQuestions(AiInterviewQuestionsRequest request);

    List<AiResultDto> history(String type);

    AiResultDto historyById(UUID id);
}
