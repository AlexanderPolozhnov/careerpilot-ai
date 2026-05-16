package com.alexanderpolozhnov.careerpilot.profile.controller;

import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import com.alexanderpolozhnov.careerpilot.profile.service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {
    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    @Mock
    private ProfileService profileService;

    private UUID userId;
    private UUID profileId;
    private ProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new ProfileController(profileService)).build();
        
        userId = UUID.randomUUID();
        profileId = UUID.randomUUID();
        
        profileResponse = new ProfileResponse(
            profileId,
            userId,
            "Senior Frontend Engineer",
            "Remote",
            5,
            List.of("React", "TypeScript", "Java"),
            "https://linkedin.com/in/test",
            "https://github.com/test",
            "https://portfolio.test"
        );
    }

    @Test
    void getMyProfileHappyPath() throws Exception {
        when(profileService.getMyProfile()).thenReturn(profileResponse);

        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(profileId.toString()))
                .andExpect(jsonPath("$.userId").value(userId.toString()))
                .andExpect(jsonPath("$.headline").value("Senior Frontend Engineer"))
                .andExpect(jsonPath("$.location").value("Remote"))
                .andExpect(jsonPath("$.yearsOfExperience").value(5))
                .andExpect(jsonPath("$.skills[0]").value("React"))
                .andExpect(jsonPath("$.linkedinUrl").value("https://linkedin.com/in/test"));
    }

    @Test
    void updateMyProfileHappyPath() throws Exception {
        ProfileRequest request = new ProfileRequest(
            "Senior Frontend Engineer",
            "Remote",
            5,
            List.of("React", "TypeScript", "Java"),
            "https://linkedin.com/in/test",
            "https://github.com/test",
            "https://portfolio.test"
        );
        
        when(profileService.updateMyProfile(any(ProfileRequest.class))).thenReturn(profileResponse);

        mockMvc.perform(put("/api/profile/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(profileId.toString()))
                .andExpect(jsonPath("$.headline").value("Senior Frontend Engineer"))
                .andExpect(jsonPath("$.location").value("Remote"))
                .andExpect(jsonPath("$.yearsOfExperience").value(5));
    }
}
