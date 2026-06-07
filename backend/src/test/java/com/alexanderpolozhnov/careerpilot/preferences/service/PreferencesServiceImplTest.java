package com.alexanderpolozhnov.careerpilot.preferences.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import com.alexanderpolozhnov.careerpilot.preferences.entity.AiProviderMode;
import com.alexanderpolozhnov.careerpilot.preferences.entity.CustomAiProvider;
import com.alexanderpolozhnov.careerpilot.preferences.entity.NotificationProvider;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.preferences.request.PreferencesRequest;
import com.alexanderpolozhnov.careerpilot.preferences.response.PreferencesResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PreferencesServiceImplTest {

    @Mock
    private PreferencesRepository preferencesRepository;

    @Mock
    private AuthRepository authRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private PreferencesServiceImpl preferencesService;

    private AuthEntity user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new AuthEntity();
        user.setId(userId);
        user.setEmail("test@example.com");

        SecurityContextHolder.setContext(securityContext);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void updatePreferences_WithNullCustomAiProvider_ShouldWork() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(user.getEmail());
        when(authRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        PreferencesEntity existingPrefs = new PreferencesEntity();
        existingPrefs.setUserId(userId);
        existingPrefs.setCustomAiProvider(CustomAiProvider.OPENAI);
        
        when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(existingPrefs));
        when(preferencesRepository.save(any(PreferencesEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        PreferencesRequest request = new PreferencesRequest(
                true, true, true, true,
                AiProviderMode.LOCAL, "ru",
                null, "gpt-4", "http://localhost:11434", "llama3",
                null, // customAiProvider is null
                null, "gemini-1.5-flash", 
                NotificationProvider.EMAIL, null
        );

        // Act
        PreferencesResponse response = preferencesService.updatePreferences(request);

        // Assert
        assertNotNull(response);
        // If it was null, the service logic 'if (request.customAiProvider() != null)' should skip updating it
        assertEquals(CustomAiProvider.OPENAI.name(), response.customAiProvider());
        verify(preferencesRepository).save(any(PreferencesEntity.class));
    }

    @Test
    void updatePreferences_WithAllOptionalFieldsNull_ShouldWork() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(user.getEmail());
        when(authRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        PreferencesEntity existingPrefs = new PreferencesEntity();
        existingPrefs.setUserId(userId);

        when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(existingPrefs));
        when(preferencesRepository.save(any(PreferencesEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        // Request with all optional fields as null
        PreferencesRequest request = new PreferencesRequest(
                true, true, true, true,
                AiProviderMode.LOCAL, "en",
                null, null, null, null,
                null, null, null, 
                NotificationProvider.EMAIL, null
        );

        // Act
        PreferencesResponse response = preferencesService.updatePreferences(request);

        // Assert
        assertNotNull(response);
        assertEquals(AiProviderMode.LOCAL.name(), response.aiProviderMode());
        assertNull(response.openAiApiKey());
        assertNull(response.geminiApiKey());
        verify(preferencesRepository).save(any(PreferencesEntity.class));
    }

    @Test
    void updatePreferences_WithGemini_ShouldUpdateCorrectly() {
        // Arrange
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn(user.getEmail());
        when(authRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        PreferencesEntity existingPrefs = new PreferencesEntity();
        existingPrefs.setUserId(userId);

        when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(existingPrefs));
        when(preferencesRepository.save(any(PreferencesEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        PreferencesRequest request = new PreferencesRequest(
                true, true, true, true,
                AiProviderMode.BRING_YOUR_OWN_KEY, "en",
                null, "gpt-4", "http://localhost:11434", "llama3",
                CustomAiProvider.GEMINI,
                "new-gemini-key", "gemini-2.0-flash-exp", 
                NotificationProvider.EMAIL, null
        );

        // Act
        PreferencesResponse response = preferencesService.updatePreferences(request);

        // Assert
        assertNotNull(response);
        assertEquals(CustomAiProvider.GEMINI.name(), response.customAiProvider());
        assertEquals("gemini-2.0-flash-exp", response.geminiModel());
        assertTrue(response.geminiApiKey().contains("..."));
    }
}
