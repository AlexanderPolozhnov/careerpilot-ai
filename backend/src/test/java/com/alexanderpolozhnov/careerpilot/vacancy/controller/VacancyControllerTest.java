package com.alexanderpolozhnov.careerpilot.vacancy.controller;

import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.CreateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.VacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import com.alexanderpolozhnov.careerpilot.vacancy.service.VacancyService;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class VacancyControllerTest {
    @Mock
    private VacancyService vacancyService;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    @Disabled("TODO: добавить integration security test с реальным SecurityFilterChain")
    void unauthorizedRequestReturns401() {
    }

    @Test
    void listVacanciesAuthorized() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new VacancyController(vacancyService)).build();
        VacancyDto dto = vacancyDto();
        when(vacancyService.list(0, 20, "createdAt", "DESC", null, null, null, null, null))
                .thenReturn(new PagedResponse<>(List.of(dto), 1, 1, 20, 0, true, true));

        mockMvc.perform(get("/api/vacancies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Backend Engineer"));
    }

    @Test
    void createVacancyAuthorized() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new VacancyController(vacancyService)).build();
        VacancyDto dto = vacancyDto();
        when(vacancyService.create(any(CreateVacancyDto.class))).thenReturn(dto);

        mockMvc.perform(post("/api/vacancies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVacancyDto(
                                "Backend Engineer", null, null, null, null, RemoteType.REMOTE,
                                1000, 2000, "USD", null, null, null
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void getVacancyByIdAuthorized() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new VacancyController(vacancyService)).build();
        VacancyDto dto = vacancyDto();
        when(vacancyService.getById(dto.id())).thenReturn(dto);

        mockMvc.perform(get("/api/vacancies/" + dto.id()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(dto.id().toString()));
    }

    private VacancyDto vacancyDto() {
        return new VacancyDto(
                UUID.randomUUID(),
                "Backend Engineer",
                null,
                null,
                null,
                "Desc",
                "Remote",
                RemoteType.REMOTE,
                1000,
                2000,
                "USD",
                null,
                List.of(),
                VacancyStatus.ACTIVE,
                null,
                null,
                Instant.parse("2026-04-27T10:00:00Z"),
                Instant.parse("2026-04-27T10:00:00Z"),
                null
        );
    }
}
