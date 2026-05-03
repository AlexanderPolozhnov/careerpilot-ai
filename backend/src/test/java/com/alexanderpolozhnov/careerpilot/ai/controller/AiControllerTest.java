package com.alexanderpolozhnov.careerpilot.ai.controller;

import com.alexanderpolozhnov.careerpilot.ai.exception.AiNotFoundException;
import com.alexanderpolozhnov.careerpilot.ai.request.AiAnalyzeVacancyRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import com.alexanderpolozhnov.careerpilot.ai.service.AiService;
import com.alexanderpolozhnov.careerpilot.common.api.error.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AiControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private MockMvc mockMvc;
    @Mock
    private AiService aiService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new AiController(aiService))
            .setControllerAdvice(new GlobalExceptionHandler())
            .build();
    }

    @Test
    @Disabled("TODO: добавить integration security test с реальным SecurityFilterChain")
    void unauthorizedReturns401() {
    }

    @Test
    void analyzeVacancyReturnsResultWrapper() throws Exception {
        UUID vacancyId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID resultId = UUID.randomUUID();
        AiResultDto dto = new AiResultDto(resultId, userId, "VACANCY_ANALYSIS",
            "Analyze vacancy", "## Analysis", vacancyId, Instant.now(), 100);
        when(aiService.analyzeVacancy(any())).thenReturn(new AiResponse(dto));

        mockMvc.perform(post("/api/ai/analyze-vacancy")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(
                    new AiAnalyzeVacancyRequest(vacancyId, "Senior Java Developer"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.result.type").value("VACANCY_ANALYSIS"))
            .andExpect(jsonPath("$.result.userId").value(userId.toString()))
            .andExpect(jsonPath("$.result.vacancyId").value(vacancyId.toString()));
    }

    @Test
    void historyReturnsListForCurrentUser() throws Exception {
        UUID userId = UUID.randomUUID();
        AiResultDto dto = new AiResultDto(UUID.randomUUID(), userId, "RESUME_MATCH",
            "Match resume", "## Match", null, Instant.now(), null);
        when(aiService.history(null)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/ai/history"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").value("RESUME_MATCH"))
            .andExpect(jsonPath("$[0].userId").value(userId.toString()));
    }

    @Test
    void historyWithTypeFilterPassesTypeToService() throws Exception {
        UUID userId = UUID.randomUUID();
        AiResultDto dto = new AiResultDto(UUID.randomUUID(), userId, "VACANCY_ANALYSIS",
            "Analyze", "## Analysis", null, Instant.now(), null);
        when(aiService.history(eq("VACANCY_ANALYSIS"))).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/ai/history").param("type", "VACANCY_ANALYSIS"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").value("VACANCY_ANALYSIS"));
    }

    @Test
    void historyByIdReturnsRecord() throws Exception {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        AiResultDto dto = new AiResultDto(id, userId, "COVER_LETTER",
            "Cover letter", "## Letter", null, Instant.now(), null);
        when(aiService.historyById(id)).thenReturn(dto);

        mockMvc.perform(get("/api/ai/history/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(id.toString()))
            .andExpect(jsonPath("$.type").value("COVER_LETTER"));
    }

    @Test
    void historyByIdNotFoundReturns404() throws Exception {
        UUID id = UUID.randomUUID();
        when(aiService.historyById(id)).thenThrow(new AiNotFoundException(id));

        mockMvc.perform(get("/api/ai/history/" + id))
            .andExpect(status().isNotFound());
    }
}
