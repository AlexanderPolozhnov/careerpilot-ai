package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.entity.AiEntity;
import com.alexanderpolozhnov.careerpilot.ai.exception.AiNotFoundException;
import com.alexanderpolozhnov.careerpilot.ai.mapper.AiMapper;
import com.alexanderpolozhnov.careerpilot.ai.repository.AiRepository;
import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiCoverLetterRequest;
import com.alexanderpolozhnov.careerpilot.ai.request.AiInterviewQuestionsRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiServiceImplTest {

    @Mock
    private LlmProvider llmProvider;
    @Mock
    private AiRepository aiRepository;
    @Mock
    private AiMapper aiMapper;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @Mock
    private AiResultCacheService aiResultCacheService;
    @InjectMocks
    private AiServiceImpl aiService;

    private AuthEntity currentUser;
    private AuthEntity otherUser;

    @BeforeEach
    void setUp() {
        currentUser = new AuthEntity();
        currentUser.setId(UUID.randomUUID());
        currentUser.setEmail("user@example.com");

        otherUser = new AuthEntity();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");
    }

    @Test
    void analyzeVacancySavesResultForCurrentUser() {
        UUID vacancyId = UUID.randomUUID();
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(aiResultCacheService.getCachedResult(any(), any(), any(), any()))
            .thenAnswer(invocation -> ((java.util.function.Supplier<String>) invocation.getArgument(3)).get());
        when(llmProvider.generate(any())).thenReturn("## Analysis result");
        AiEntity saved = makeEntity(currentUser, "VACANCY_ANALYSIS", vacancyId);
        when(aiRepository.save(any(AiEntity.class))).thenReturn(saved);
        AiResultDto dto = makeDto(saved);
        when(aiMapper.toDto(saved)).thenReturn(dto);

        AiAnalyzeVacancyRequest request = new AiAnalyzeVacancyRequest(vacancyId, "Senior Java Developer");
        AiResponse response = aiService.analyzeVacancy(request);

        assertThat(response.result().userId()).isEqualTo(currentUser.getId());
        assertThat(response.result().type()).isEqualTo("VACANCY_ANALYSIS");
        assertThat(response.result().vacancyId()).isEqualTo(vacancyId);
        verify(aiRepository).save(any(AiEntity.class));
    }

    @Test
    void historyReturnsOnlyCurrentUserRecords() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        AiEntity e1 = makeEntity(currentUser, "VACANCY_ANALYSIS", null);
        AiEntity e2 = makeEntity(currentUser, "RESUME_MATCH", null);
        when(aiRepository.findAllByUserIdOrderByCreatedAtDesc(currentUser.getId()))
            .thenReturn(List.of(e1, e2));
        AiResultDto dto1 = makeDto(e1);
        AiResultDto dto2 = makeDto(e2);
        when(aiMapper.toDto(e1)).thenReturn(dto1);
        when(aiMapper.toDto(e2)).thenReturn(dto2);

        List<AiResultDto> result = aiService.history(null);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(d -> d.userId().equals(currentUser.getId()));
    }

    @Test
    void historyFilterByTypeReturnsOnlyMatchingRecords() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        AiEntity e1 = makeEntity(currentUser, "VACANCY_ANALYSIS", null);
        when(aiRepository.findAllByUserIdAndTypeOrderByCreatedAtDesc(currentUser.getId(), "VACANCY_ANALYSIS"))
            .thenReturn(List.of(e1));
        AiResultDto dto1 = makeDto(e1);
        when(aiMapper.toDto(e1)).thenReturn(dto1);

        List<AiResultDto> result = aiService.history("VACANCY_ANALYSIS");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).type()).isEqualTo("VACANCY_ANALYSIS");
    }

    @Test
    void historyByIdThrowsNotFoundForOtherUserRecord() {
        UUID id = UUID.randomUUID();
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(aiRepository.findByIdAndUserId(id, currentUser.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> aiService.historyById(id))
            .isInstanceOf(AiNotFoundException.class);
    }

    @Test
    void historyByIdReturnsOwnRecord() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        AiEntity entity = makeEntity(currentUser, "INTERVIEW_QUESTIONS", null);
        when(aiRepository.findByIdAndUserId(entity.getId(), currentUser.getId()))
            .thenReturn(Optional.of(entity));
        AiResultDto dto = makeDto(entity);
        when(aiMapper.toDto(entity)).thenReturn(dto);

        AiResultDto result = aiService.historyById(entity.getId());

        assertThat(result.id()).isEqualTo(entity.getId());
        assertThat(result.userId()).isEqualTo(currentUser.getId());
    }

    @Test
    void interviewQuestionsUsesDefaultCountWhenNull() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(llmProvider.generate(any())).thenReturn("## Questions");
        AiEntity saved = makeEntity(currentUser, "INTERVIEW_QUESTIONS", null);
        when(aiRepository.save(any(AiEntity.class))).thenReturn(saved);
        AiResultDto dto = makeDto(saved);
        when(aiMapper.toDto(saved)).thenReturn(dto);

        AiInterviewQuestionsRequest request = new AiInterviewQuestionsRequest(null, null, "Java", null);
        AiResponse response = aiService.interviewQuestions(request);

        assertThat(response.result().type()).isEqualTo("INTERVIEW_QUESTIONS");
        verify(aiResultCacheService, org.mockito.Mockito.never()).getCachedResult(any(), any(), any(), any());
    }

    @Test
    void coverLetterDoesNotUseCache() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(llmProvider.generate(any())).thenReturn("## Cover Letter");
        AiEntity saved = makeEntity(currentUser, "COVER_LETTER", null);
        when(aiRepository.save(any(AiEntity.class))).thenReturn(saved);
        AiResultDto dto = makeDto(saved);
        when(aiMapper.toDto(saved)).thenReturn(dto);

        AiCoverLetterRequest request = new AiCoverLetterRequest(null, "job", null, "me", "prof", "more");
        AiResponse response = aiService.coverLetter(request);

        assertThat(response.result().type()).isEqualTo("COVER_LETTER");
        verify(aiResultCacheService, org.mockito.Mockito.never()).getCachedResult(any(), any(), any(), any());
    }

    private AiEntity makeEntity(AuthEntity user, String type, UUID vacancyId) {
        AiEntity e = new AiEntity();
        e.setId(UUID.randomUUID());
        e.setUser(user);
        e.setType(type);
        e.setVacancyId(vacancyId);
        e.setPrompt("test prompt");
        e.setResult("test result");
        e.setInputHash("hash");
        e.setInputPayload("payload");
        e.setOutputPayload("output");
        e.setCreatedAt(Instant.now());
        return e;
    }

    private AiResultDto makeDto(AiEntity e) {
        return new AiResultDto(
            e.getId(),
            e.getUser().getId(),
            e.getType(),
            e.getPrompt(),
            e.getResult(),
            e.getVacancyId(),
            e.getCreatedAt(),
            null
        );
    }
}
