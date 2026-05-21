package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.ai.entity.AiEntity;
import com.alexanderpolozhnov.careerpilot.ai.exception.AiNotFoundException;
import com.alexanderpolozhnov.careerpilot.ai.mapper.AiMapper;
import com.alexanderpolozhnov.careerpilot.ai.repository.AiRepository;
import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeGenerationRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeMatchRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;
import com.alexanderpolozhnov.careerpilot.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final LlmProvider llmProvider;
    private final AiRepository aiRepository;
    private final AiMapper aiMapper;
    private final CurrentUserResolver currentUserResolver;
    private final AiResultCacheService aiResultCacheService;
    private final ResumeService resumeService;

    @Override
    public AiResponse analyzeVacancy(AiAnalyzeVacancyRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        String prompt = buildVacancyAnalysisPrompt(request);
        String textHash = Integer.toHexString(prompt.hashCode());

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LlmResponse llmResponse = aiResultCacheService.getCachedResult(
                "VACANCY_ANALYSIS",
                request.vacancyId(),
                textHash,
                () -> llmProvider.generate("VACANCY_ANALYSIS\n" + prompt));
        stopWatch.stop();

        Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs() : stopWatch.getTotalTimeMillis();
        LlmResponse responseWithLatency = new LlmResponse(
                llmResponse.text(),
                llmResponse.tokens(),
                latencyMs,
                llmResponse.errorMessage());

        AiEntity entity = createAndSave(user, "VACANCY_ANALYSIS", prompt, responseWithLatency, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse resumeMatch(AiResumeMatchRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();

        // Fetch resume text if resumeId is provided and resumeText is not
        String resumeText = request.resumeText();
        if (request.resumeId() != null && (resumeText == null || resumeText.isBlank())) {
            UUID resumeUuid = UUID.fromString(request.resumeId());
            ResumeResponse resume = resumeService.getById(resumeUuid);
            resumeText = resume.textContent();
        }

        // Build request with fetched text
        AiResumeMatchRequest finalRequest = new AiResumeMatchRequest(
                request.vacancyId(),
                request.vacancyText(),
                request.resumeId(),
                resumeText != null ? resumeText : "");

        String prompt = buildResumeMatchPrompt(finalRequest);
        String textHash = Integer.toHexString(prompt.hashCode());

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LlmResponse llmResponse = aiResultCacheService.getCachedResult(
                "RESUME_MATCH",
                request.vacancyId(),
                textHash,
                () -> llmProvider.generate("RESUME_MATCH\n" + prompt));
        stopWatch.stop();

        Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs() : stopWatch.getTotalTimeMillis();
        LlmResponse responseWithLatency = new LlmResponse(
                llmResponse.text(),
                llmResponse.tokens(),
                latencyMs,
                llmResponse.errorMessage());

        AiEntity entity = createAndSave(user, "RESUME_MATCH", prompt, responseWithLatency, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse coverLetter(AiCoverLetterRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();

        // Fetch resume text if resumeId is provided and resumeText is not
        String resumeText = request.resumeText();
        if (request.resumeId() != null && (resumeText == null || resumeText.isBlank())) {
            UUID resumeUuid = UUID.fromString(request.resumeId());
            ResumeResponse resume = resumeService.getById(resumeUuid);
            resumeText = resume.textContent();
        }

        // Build request with fetched text
        AiCoverLetterRequest finalRequest = new AiCoverLetterRequest(
                request.vacancyId(),
                request.vacancyText(),
                request.resumeId(),
                resumeText != null ? resumeText : "",
                request.tone(),
                request.additionalContext());

        String prompt = buildCoverLetterPrompt(finalRequest);

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LlmResponse llmResponse = llmProvider.generate("COVER_LETTER\n" + prompt);
        stopWatch.stop();

        Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs() : stopWatch.getTotalTimeMillis();
        LlmResponse responseWithLatency = new LlmResponse(
                llmResponse.text(),
                llmResponse.tokens(),
                latencyMs,
                llmResponse.errorMessage());

        AiEntity entity = createAndSave(user, "COVER_LETTER", prompt, responseWithLatency, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse interviewQuestions(AiInterviewQuestionsRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        String prompt = buildInterviewQuestionsPrompt(request);

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LlmResponse llmResponse = llmProvider.generate("INTERVIEW_QUESTIONS\n" + prompt);
        stopWatch.stop();

        Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs() : stopWatch.getTotalTimeMillis();
        LlmResponse responseWithLatency = new LlmResponse(
                llmResponse.text(),
                llmResponse.tokens(),
                latencyMs,
                llmResponse.errorMessage());

        AiEntity entity = createAndSave(user, "INTERVIEW_QUESTIONS", prompt, responseWithLatency, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse generateResume(AiResumeGenerationRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();

        // Fetch resume text if resumeId is provided and resumeText is not
        String resumeText = request.resumeText();
        if (request.resumeId() != null && (resumeText == null || resumeText.isBlank())) {
            ResumeResponse resume = resumeService.getById(request.resumeId());
            resumeText = resume.textContent();
        }

        // Build request with fetched text
        AiResumeGenerationRequest finalRequest = new AiResumeGenerationRequest(
                request.vacancyId(),
                request.vacancyText(),
                request.resumeId(),
                resumeText != null ? resumeText : "",
                request.additionalContext());

        String prompt = buildResumeGenerationPrompt(finalRequest);

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        LlmResponse llmResponse = llmProvider.generate("RESUME_GENERATION\n" + prompt);
        stopWatch.stop();

        Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs() : stopWatch.getTotalTimeMillis();
        LlmResponse responseWithLatency = new LlmResponse(
                llmResponse.text(),
                llmResponse.tokens(),
                latencyMs,
                llmResponse.errorMessage());

        AiEntity entity = createAndSave(user, "RESUME_GENERATION", prompt, responseWithLatency, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public List<AiResultDto> history(String type) {
        AuthEntity user = currentUserResolver.resolveRequired();
        List<AiEntity> entities;
        if (type != null && !type.isBlank()) {
            entities = aiRepository.findAllByUserIdAndTypeOrderByCreatedAtDesc(user.getId(), type);
        } else {
            entities = aiRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return entities.stream().map(aiMapper::toDto).toList();
    }

    @Override
    public AiResultDto historyById(UUID id) {
        AuthEntity user = currentUserResolver.resolveRequired();
        AiEntity entity = aiRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new AiNotFoundException(id));
        return aiMapper.toDto(entity);
    }

    private AiEntity createAndSave(AuthEntity user, String type, String prompt, LlmResponse llmResponse,
            UUID vacancyId) {
        AiEntity entity = new AiEntity();
        entity.setUser(user);
        entity.setType(type);
        entity.setPrompt(prompt);
        entity.setResult(llmResponse.text());
        entity.setVacancyId(vacancyId);
        entity.setTokensUsed(llmResponse.tokens());
        entity.setLatencyMs(llmResponse.latencyMs());
        entity.setErrorMessage(llmResponse.errorMessage());
        entity.setInputHash(Integer.toHexString(prompt.hashCode()));
        entity.setInputPayload(prompt);
        entity.setOutputPayload(llmResponse.text());
        return aiRepository.save(entity);
    }

    private String buildVacancyAnalysisPrompt(AiAnalyzeVacancyRequest req) {
        StringBuilder sb = new StringBuilder("Analyze the following vacancy");
        if (req.vacancyId() != null)
            sb.append(" (id: ").append(req.vacancyId()).append(")");
        sb.append(":\n");
        if (req.vacancyText() != null && !req.vacancyText().isBlank())
            sb.append(req.vacancyText());
        return sb.toString();
    }

    private String buildResumeMatchPrompt(AiResumeMatchRequest req) {
        StringBuilder sb = new StringBuilder("Match resume against vacancy");
        if (req.vacancyId() != null)
            sb.append(" (id: ").append(req.vacancyId()).append(")");
        sb.append(":\n");
        if (req.vacancyText() != null && !req.vacancyText().isBlank()) {
            sb.append("Vacancy: ").append(req.vacancyText()).append("\n");
        }
        if (req.resumeText() != null && !req.resumeText().isBlank()) {
            sb.append("Resume: ").append(req.resumeText());
        }
        return sb.toString();
    }

    private String buildCoverLetterPrompt(AiCoverLetterRequest req) {
        StringBuilder sb = new StringBuilder("Generate a cover letter");
        if (req.tone() != null)
            sb.append(" with ").append(req.tone()).append(" tone");
        if (req.vacancyId() != null)
            sb.append(" for vacancy (id: ").append(req.vacancyId()).append(")");
        sb.append(":\n");
        if (req.vacancyText() != null && !req.vacancyText().isBlank()) {
            sb.append("Vacancy: ").append(req.vacancyText()).append("\n");
        }
        if (req.resumeText() != null && !req.resumeText().isBlank()) {
            sb.append("Resume: ").append(req.resumeText()).append("\n");
        }
        if (req.additionalContext() != null && !req.additionalContext().isBlank()) {
            sb.append("Additional context: ").append(req.additionalContext());
        }
        return sb.toString();
    }

    private String buildInterviewQuestionsPrompt(AiInterviewQuestionsRequest req) {
        int count = req.count() != null ? req.count() : 5;
        StringBuilder sb = new StringBuilder("Generate ").append(count).append(" interview questions");
        if (req.focusArea() != null && !req.focusArea().isBlank()) {
            sb.append(" focused on: ").append(req.focusArea());
        }
        if (req.vacancyId() != null)
            sb.append(" for vacancy (id: ").append(req.vacancyId()).append(")");
        sb.append(":\n");
        if (req.vacancyText() != null && !req.vacancyText().isBlank()) {
            sb.append(req.vacancyText());
        }
        return sb.toString();
    }

    private String buildResumeGenerationPrompt(AiResumeGenerationRequest req) {
        StringBuilder sb = new StringBuilder("Improve and optimize the following resume");
        if (req.vacancyId() != null) {
            sb.append(" to tailor it specifically for vacancy (id: ").append(req.vacancyId()).append(")");
        }
        sb.append(":\n\n");

        sb.append("### Original Resume:\n").append(req.resumeText()).append("\n\n");

        if (req.vacancyText() != null && !req.vacancyText().isBlank()) {
            sb.append("### Target Vacancy Requirements:\n").append(req.vacancyText()).append("\n\n");
        }

        if (req.additionalContext() != null && !req.additionalContext().isBlank()) {
            sb.append("### User Instructions & Context:\n").append(req.additionalContext()).append("\n\n");
        }

        sb.append("### Instructions for AI:\n")
                .append("1. Rewrite and polish bullet points using high-impact action verbs and measurable metrics.\n")
                .append("2. Group skills logically and highlight matches with the target vacancy if provided.\n")
                .append("3. Fix grammatical issues and improve clarity while keeping the original experience truth-based.\n")
                .append("4. Present the response in beautifully formatted Markdown, highlighting changed sections.\n");

        return sb.toString();
    }
}
