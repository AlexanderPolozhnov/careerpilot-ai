package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.entity.AiEntity;
import com.alexanderpolozhnov.careerpilot.ai.exception.AiNotFoundException;
import com.alexanderpolozhnov.careerpilot.ai.mapper.AiMapper;
import com.alexanderpolozhnov.careerpilot.ai.repository.AiRepository;
import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiResumeMatchRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    @Override
    public AiResponse analyzeVacancy(AiAnalyzeVacancyRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        String prompt = buildVacancyAnalysisPrompt(request);
        String textHash = Integer.toHexString(prompt.hashCode());

        String resultText = aiResultCacheService.getCachedResult(
            "VACANCY_ANALYSIS",
            request.vacancyId(),
            textHash,
            () -> llmProvider.generate("VACANCY_ANALYSIS\n" + prompt)
        );

        AiEntity entity = createAndSave(user, "VACANCY_ANALYSIS", prompt, resultText, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse resumeMatch(AiResumeMatchRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        String prompt = buildResumeMatchPrompt(request);
        String textHash = Integer.toHexString(prompt.hashCode());

        String resultText = aiResultCacheService.getCachedResult(
            "RESUME_MATCH",
            request.vacancyId(),
            textHash,
            () -> llmProvider.generate("RESUME_MATCH\n" + prompt)
        );

        AiEntity entity = createAndSave(user, "RESUME_MATCH", prompt, resultText, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse coverLetter(AiCoverLetterRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        String prompt = buildCoverLetterPrompt(request);
        String resultText = llmProvider.generate("COVER_LETTER\n" + prompt);
        AiEntity entity = createAndSave(user, "COVER_LETTER", prompt, resultText, request.vacancyId());
        return new AiResponse(aiMapper.toDto(entity));
    }

    @Override
    public AiResponse interviewQuestions(AiInterviewQuestionsRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        String prompt = buildInterviewQuestionsPrompt(request);
        String resultText = llmProvider.generate("INTERVIEW_QUESTIONS\n" + prompt);
        AiEntity entity = createAndSave(user, "INTERVIEW_QUESTIONS", prompt, resultText, request.vacancyId());
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

    private AiEntity createAndSave(AuthEntity user, String type, String prompt, String result, UUID vacancyId) {
        AiEntity entity = new AiEntity();
        entity.setUser(user);
        entity.setType(type);
        entity.setPrompt(prompt);
        entity.setResult(result);
        entity.setVacancyId(vacancyId);
        entity.setInputHash(Integer.toHexString(prompt.hashCode()));
        entity.setInputPayload(prompt);
        entity.setOutputPayload(result);
        return aiRepository.save(entity);
    }

    private String buildVacancyAnalysisPrompt(AiAnalyzeVacancyRequest req) {
        StringBuilder sb = new StringBuilder("Analyze the following vacancy");
        if (req.vacancyId() != null) sb.append(" (id: ").append(req.vacancyId()).append(")");
        sb.append(":\n");
        if (req.vacancyText() != null && !req.vacancyText().isBlank()) sb.append(req.vacancyText());
        return sb.toString();
    }

    private String buildResumeMatchPrompt(AiResumeMatchRequest req) {
        StringBuilder sb = new StringBuilder("Match resume against vacancy");
        if (req.vacancyId() != null) sb.append(" (id: ").append(req.vacancyId()).append(")");
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
        if (req.tone() != null) sb.append(" with ").append(req.tone()).append(" tone");
        if (req.vacancyId() != null) sb.append(" for vacancy (id: ").append(req.vacancyId()).append(")");
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
        if (req.vacancyId() != null) sb.append(" for vacancy (id: ").append(req.vacancyId()).append(")");
        sb.append(":\n");
        if (req.vacancyText() != null && !req.vacancyText().isBlank()) {
            sb.append(req.vacancyText());
        }
        return sb.toString();
    }
}
