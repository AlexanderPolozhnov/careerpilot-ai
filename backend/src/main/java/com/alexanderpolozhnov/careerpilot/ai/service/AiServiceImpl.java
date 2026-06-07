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
import com.alexanderpolozhnov.careerpilot.ai.request.AiProviderConfigRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiTestConnectionResponse;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;
import com.alexanderpolozhnov.careerpilot.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StopWatch;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

        private final LlmProviderFactory llmProviderFactory;
        private final AiRepository aiRepository;
        private final AiMapper aiMapper;
        private final CurrentUserResolver currentUserResolver;
        private final AiResultCacheService aiResultCacheService;
        private final ResumeService resumeService;
        private final PreferencesRepository preferencesRepository;

        private String getUserLanguage(AuthEntity user) {
                return preferencesRepository.findByUserId(user.getId())
                                .map(prefs -> prefs.getLanguage())
                                .orElse("en");
        }

        private PreferencesEntity getUserPreferences(AuthEntity user) {
                return preferencesRepository.findByUserId(user.getId())
                                .orElseGet(() -> {
                                        PreferencesEntity prefs = new PreferencesEntity();
                                        prefs.setUserId(user.getId());
                                        return preferencesRepository.save(prefs);
                                });
        }

        @Async("aiTaskExecutor")
        @Override
        public CompletableFuture<AiResponse> analyzeVacancy(AiAnalyzeVacancyRequest request) {
                AuthEntity user = currentUserResolver.resolveRequired();
                String language = getUserLanguage(user);
                String prompt = buildVacancyAnalysisPrompt(request, language);
                String textHash = Integer.toHexString(prompt.hashCode());

                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                PreferencesEntity preferences = getUserPreferences(user);
                LlmResponse llmResponse = aiResultCacheService.getCachedResult(
                                "VACANCY_ANALYSIS",
                                request.vacancyId(),
                                textHash,
                                () -> llmProviderFactory.getProvider(preferences)
                                                .generate("VACANCY_ANALYSIS\n" + prompt, preferences));
                stopWatch.stop();

                Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs()
                                : stopWatch.getTotalTimeMillis();
                LlmResponse responseWithLatency = new LlmResponse(
                                llmResponse.text(),
                                llmResponse.tokens(),
                                latencyMs,
                                llmResponse.errorMessage(),
                                llmResponse.isFallback());

                AiEntity entity = createAndSave(user, "VACANCY_ANALYSIS", prompt, responseWithLatency,
                                request.vacancyId());
                return CompletableFuture.completedFuture(new AiResponse(aiMapper.toDto(entity)));
        }

        @Async("aiTaskExecutor")
        @Override
        public CompletableFuture<AiResponse> resumeMatch(AiResumeMatchRequest request) {
                AuthEntity user = currentUserResolver.resolveRequired();
                String language = getUserLanguage(user);

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

                String prompt = buildResumeMatchPrompt(finalRequest, language);
                String textHash = Integer.toHexString(prompt.hashCode());

                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                PreferencesEntity preferences = getUserPreferences(user);
                LlmResponse llmResponse = aiResultCacheService.getCachedResult(
                                "RESUME_MATCH",
                                request.vacancyId(),
                                textHash,
                                () -> llmProviderFactory.getProvider(preferences)
                                                .generate("RESUME_MATCH\n" + prompt, preferences));
                stopWatch.stop();

                Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs()
                                : stopWatch.getTotalTimeMillis();
                LlmResponse responseWithLatency = new LlmResponse(
                                llmResponse.text(),
                                llmResponse.tokens(),
                                latencyMs,
                                llmResponse.errorMessage(),
                                llmResponse.isFallback());

                AiEntity entity = createAndSave(user, "RESUME_MATCH", prompt, responseWithLatency, request.vacancyId());
                return CompletableFuture.completedFuture(new AiResponse(aiMapper.toDto(entity)));
        }

        @Async("aiTaskExecutor")
        @Override
        public CompletableFuture<AiResponse> coverLetter(AiCoverLetterRequest request) {
                AuthEntity user = currentUserResolver.resolveRequired();
                String language = getUserLanguage(user);

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

                String prompt = buildCoverLetterPrompt(finalRequest, language);

                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                PreferencesEntity preferences = getUserPreferences(user);
                LlmResponse llmResponse = llmProviderFactory.getProvider(preferences)
                                .generate("COVER_LETTER\n" + prompt, preferences);
                stopWatch.stop();

                Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs()
                                : stopWatch.getTotalTimeMillis();
                LlmResponse responseWithLatency = new LlmResponse(
                                llmResponse.text(),
                                llmResponse.tokens(),
                                latencyMs,
                                llmResponse.errorMessage(),
                                llmResponse.isFallback());

                AiEntity entity = createAndSave(user, "COVER_LETTER", prompt, responseWithLatency, request.vacancyId());
                return CompletableFuture.completedFuture(new AiResponse(aiMapper.toDto(entity)));
        }

        @Async("aiTaskExecutor")
        @Override
        public CompletableFuture<AiResponse> interviewQuestions(AiInterviewQuestionsRequest request) {
                AuthEntity user = currentUserResolver.resolveRequired();
                String language = getUserLanguage(user);
                String prompt = buildInterviewQuestionsPrompt(request, language);

                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                PreferencesEntity preferences = getUserPreferences(user);
                LlmResponse llmResponse = llmProviderFactory.getProvider(preferences)
                                .generate("INTERVIEW_QUESTIONS\n" + prompt, preferences);
                stopWatch.stop();

                Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs()
                                : stopWatch.getTotalTimeMillis();
                LlmResponse responseWithLatency = new LlmResponse(
                                llmResponse.text(),
                                llmResponse.tokens(),
                                latencyMs,
                                llmResponse.errorMessage(),
                                llmResponse.isFallback());

                AiEntity entity = createAndSave(user, "INTERVIEW_QUESTIONS", prompt, responseWithLatency,
                                request.vacancyId());
                return CompletableFuture.completedFuture(new AiResponse(aiMapper.toDto(entity)));
        }

        @Async("aiTaskExecutor")
        @Override
        public CompletableFuture<AiResponse> generateResume(AiResumeGenerationRequest request) {
                AuthEntity user = currentUserResolver.resolveRequired();
                String language = getUserLanguage(user);

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

                String prompt = buildResumeGenerationPrompt(finalRequest, language);

                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                PreferencesEntity preferences = getUserPreferences(user);
                LlmResponse llmResponse = llmProviderFactory.getProvider(preferences)
                                .generate("RESUME_GENERATION\n" + prompt, preferences);
                stopWatch.stop();

                Long latencyMs = llmResponse.latencyMs() != null ? llmResponse.latencyMs()
                                : stopWatch.getTotalTimeMillis();
                LlmResponse responseWithLatency = new LlmResponse(
                                llmResponse.text(),
                                llmResponse.tokens(),
                                latencyMs,
                                llmResponse.errorMessage(),
                                llmResponse.isFallback());

                AiEntity entity = createAndSave(user, "RESUME_GENERATION", prompt, responseWithLatency,
                                request.vacancyId());
                return CompletableFuture.completedFuture(new AiResponse(aiMapper.toDto(entity)));
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

        @Override
        public AiTestConnectionResponse testConnection(com.alexanderpolozhnov.careerpilot.ai.request.AiProviderConfigRequest request) {
                PreferencesEntity prefs = buildTempPreferences(request);
                LlmProvider provider = llmProviderFactory.getProvider(prefs);
                StopWatch stopWatch = new StopWatch();
                stopWatch.start();
                try {
                        LlmResponse response = provider.generate("Say exactly: OK", prefs);
                        stopWatch.stop();
                        if (response.errorMessage() != null) {
                                return new AiTestConnectionResponse(false, response.errorMessage(), null);
                        }
                        if (response.isFallback()) {
                                return new AiTestConnectionResponse(false, "API key is missing or invalid (fallback activated)", null);
                        }
                        Long latency = response.latencyMs() != null ? response.latencyMs() : stopWatch.getTotalTimeMillis();
                        return new AiTestConnectionResponse(true, "OK", latency);
                } catch (Exception e) {
                        return new AiTestConnectionResponse(false, e.getMessage(), null);
                }
        }

        @Override
        public List<String> syncModels(com.alexanderpolozhnov.careerpilot.ai.request.AiProviderConfigRequest request) {
                PreferencesEntity prefs = buildTempPreferences(request);
                LlmProvider provider = llmProviderFactory.getProvider(prefs);
                return provider.getAvailableModels(prefs);
        }

        private PreferencesEntity buildTempPreferences(com.alexanderpolozhnov.careerpilot.ai.request.AiProviderConfigRequest request) {
                PreferencesEntity prefs = new PreferencesEntity();
                prefs.setAiProviderMode(request.aiProviderMode());
                prefs.setCustomAiProvider(request.customAiProvider());
                
                AuthEntity user = currentUserResolver.resolveRequired();
                PreferencesEntity savedPrefs = preferencesRepository.findByUserId(user.getId()).orElse(null);

                String openAiKey = request.openAiApiKey();
                if (openAiKey != null && openAiKey.contains("...") && savedPrefs != null) {
                        openAiKey = savedPrefs.getOpenAiApiKey();
                }
                prefs.setOpenAiApiKey(openAiKey);
                
                String geminiKey = request.geminiApiKey();
                if (geminiKey != null && geminiKey.contains("...") && savedPrefs != null) {
                        geminiKey = savedPrefs.getGeminiApiKey();
                }
                prefs.setGeminiApiKey(geminiKey);

                prefs.setOllamaUrl(request.ollamaUrl());

                prefs.setOpenAiModel(request.openAiModel() != null && !request.openAiModel().isBlank() ? request.openAiModel() : "gpt-4o-mini");
                prefs.setGeminiModel(request.geminiModel() != null && !request.geminiModel().isBlank() ? request.geminiModel() : "gemini-1.5-flash");
                prefs.setOllamaModel(request.ollamaModel() != null && !request.ollamaModel().isBlank() ? request.ollamaModel() : "llama3");

                return prefs;
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
                entity.setIsFallback(llmResponse.isFallback());
                entity.setInputHash(Integer.toHexString(prompt.hashCode()));
                entity.setInputPayload(prompt);
                entity.setOutputPayload(llmResponse.text());
                return aiRepository.save(entity);
        }

        private String getPromptTemplate(String type, String language) {
                try {
                        ClassPathResource resource = new ClassPathResource("prompts/" + language + "/" + type + ".md");
                        if (!resource.exists()) {
                                resource = new ClassPathResource("prompts/en/" + type + ".md");
                        }
                        return resource.getContentAsString(StandardCharsets.UTF_8);
                } catch (IOException e) {
                        throw new RuntimeException("Failed to load prompt template for " + type, e);
                }
        }

        private String buildVacancyAnalysisPrompt(AiAnalyzeVacancyRequest req, String language) {
                String template = getPromptTemplate("VACANCY_ANALYSIS", language);
                return template.replace("{{VACANCY_TEXT}}",
                                req.vacancyText() != null && !req.vacancyText().isBlank() ? req.vacancyText()
                                                : "(None)");
        }

        private String buildResumeMatchPrompt(AiResumeMatchRequest req, String language) {
                String template = getPromptTemplate("RESUME_MATCH", language);
                template = template.replace("{{VACANCY_TEXT}}",
                                req.vacancyText() != null && !req.vacancyText().isBlank() ? req.vacancyText()
                                                : "(None)");
                template = template.replace("{{RESUME_TEXT}}",
                                req.resumeText() != null && !req.resumeText().isBlank() ? req.resumeText() : "(None)");
                return template;
        }

        private String buildCoverLetterPrompt(AiCoverLetterRequest req, String language) {
                String template = getPromptTemplate("COVER_LETTER", language);
                template = template.replace("{{TONE}}", req.tone() != null ? req.tone() : "PROFESSIONAL");
                template = template.replace("{{VACANCY_TEXT}}",
                                req.vacancyText() != null && !req.vacancyText().isBlank() ? req.vacancyText()
                                                : "(None)");
                template = template.replace("{{RESUME_TEXT}}",
                                req.resumeText() != null && !req.resumeText().isBlank() ? req.resumeText() : "(None)");
                template = template.replace("{{ADDITIONAL_CONTEXT}}",
                                req.additionalContext() != null && !req.additionalContext().isBlank()
                                                ? req.additionalContext()
                                                : "(None)");
                return template;
        }

        private String buildInterviewQuestionsPrompt(AiInterviewQuestionsRequest req, String language) {
                String template = getPromptTemplate("INTERVIEW_QUESTIONS", language);
                String count = req.count() != null ? String.valueOf(req.count()) : "5";
                String focusArea = req.focusArea() != null && !req.focusArea().isBlank() ? req.focusArea()
                                : "Provide a balanced mix of technical deep-dives, system design, and behavioral questions tailored to the role.";

                template = template.replace("{{COUNT}}", count);
                template = template.replace("{{FOCUS_AREA}}", focusArea);
                template = template.replace("{{VACANCY_TEXT}}",
                                req.vacancyText() != null && !req.vacancyText().isBlank() ? req.vacancyText()
                                                : "(None)");
                return template;
        }

        private String buildResumeGenerationPrompt(AiResumeGenerationRequest req, String language) {
                String template = getPromptTemplate("RESUME_GENERATION", language);
                template = template.replace("{{VACANCY_TEXT}}",
                                req.vacancyText() != null && !req.vacancyText().isBlank() ? req.vacancyText()
                                                : "(None)");
                template = template.replace("{{ADDITIONAL_CONTEXT}}",
                                req.additionalContext() != null && !req.additionalContext().isBlank()
                                                ? req.additionalContext()
                                                : "(None)");
                template = template.replace("{{RESUME_TEXT}}",
                                req.resumeText() != null && !req.resumeText().isBlank() ? req.resumeText() : "(None)");
                return template;
        }
}
