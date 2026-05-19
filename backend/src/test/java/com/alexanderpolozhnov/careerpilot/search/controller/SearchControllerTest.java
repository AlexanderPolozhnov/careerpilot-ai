package com.alexanderpolozhnov.careerpilot.search.controller;

import com.alexanderpolozhnov.careerpilot.search.dto.SearchItemDto;
import com.alexanderpolozhnov.careerpilot.search.dto.SearchItemType;
import com.alexanderpolozhnov.careerpilot.search.dto.SearchResponseDto;
import com.alexanderpolozhnov.careerpilot.search.service.SearchService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class SearchControllerTest {
    @Mock
    private SearchService searchService;

    @Test
    void searchReturnsResults() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new SearchController(searchService)).build();
        
        SearchItemDto item = new SearchItemDto(
            UUID.randomUUID(),
            SearchItemType.VACANCY,
            "Backend Engineer",
            "Stripe",
            "ACTIVE",
            "/app/vacancies/" + UUID.randomUUID()
        );
        
        SearchResponseDto response = new SearchResponseDto(List.of(item));
        when(searchService.search(anyString())).thenReturn(response);

        mockMvc.perform(get("/api/search?q=backend"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].type").value("VACANCY"))
                .andExpect(jsonPath("$.results[0].title").value("Backend Engineer"));
    }

    @Test
    void searchWithEmptyQueryReturnsEmptyResults() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new SearchController(searchService)).build();
        
        SearchResponseDto response = new SearchResponseDto(List.of());
        when(searchService.search(anyString())).thenReturn(response);

        mockMvc.perform(get("/api/search?q="))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isEmpty());
    }
}
