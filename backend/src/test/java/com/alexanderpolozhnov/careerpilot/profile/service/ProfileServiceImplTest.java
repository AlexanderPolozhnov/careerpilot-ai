package com.alexanderpolozhnov.careerpilot.profile.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import com.alexanderpolozhnov.careerpilot.profile.mapper.ProfileMapper;
import com.alexanderpolozhnov.careerpilot.profile.repository.ProfileRepository;
import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceImplTest {
    @Mock
    private ProfileRepository profileRepository;
    @Mock
    private ProfileMapper profileMapper;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @InjectMocks
    private ProfileServiceImpl profileService;

    private UUID userId;
    private AuthEntity authEntity;
    private ProfileEntity profileEntity;
    private ProfileRequest profileRequest;
    private ProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        authEntity = new AuthEntity();
        authEntity.setId(userId);
        authEntity.setEmail("user@example.com");
        authEntity.setPasswordHash("hashed");
        authEntity.setCreatedAt(Instant.now());

        profileEntity = new ProfileEntity();
        profileEntity.setId(UUID.randomUUID());
        profileEntity.setUserId(userId);
        profileEntity.setHeadline("Senior Frontend Engineer");
        profileEntity.setLocation("Remote");
        profileEntity.setYearsOfExperience(5);
        profileEntity.setSkills(List.of("React", "TypeScript", "Java"));
        profileEntity.setLinkedinUrl("https://linkedin.com/in/test");
        profileEntity.setGithubUrl("https://github.com/test");
        profileEntity.setPortfolioUrl("https://portfolio.test");

        profileRequest = new ProfileRequest(
                "Senior Frontend Engineer",
                "Remote",
                5,
                List.of("React", "TypeScript", "Java"),
                "https://linkedin.com/in/test",
                "https://github.com/test",
                "https://portfolio.test");

        profileResponse = new ProfileResponse(
                profileEntity.getId(),
                userId,
                "Senior Frontend Engineer",
                "Remote",
                5,
                List.of("React", "TypeScript", "Java"),
                "https://linkedin.com/in/test",
                "https://github.com/test",
                "https://portfolio.test");
    }

    @Test
    void getMyProfile_existingProfile() {
        when(currentUserResolver.resolveRequired()).thenReturn(authEntity);
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profileEntity));
        when(profileMapper.toResponse(profileEntity)).thenReturn(profileResponse);

        ProfileResponse result = profileService.getMyProfile();

        assertThat(result).isEqualTo(profileResponse);
        verify(profileRepository).findByUserId(userId);
        verify(profileMapper).toResponse(profileEntity);
        verify(profileRepository, never()).save(any());
    }

    @Test
    void getMyProfile_createsDefaultProfile() {
        when(currentUserResolver.resolveRequired()).thenReturn(authEntity);
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(profileRepository.save(any(ProfileEntity.class))).thenReturn(profileEntity);
        when(profileMapper.toResponse(profileEntity)).thenReturn(profileResponse);

        ProfileResponse result = profileService.getMyProfile();

        assertThat(result).isEqualTo(profileResponse);
        verify(profileRepository).findByUserId(userId);
        ArgumentCaptor<ProfileEntity> captor = ArgumentCaptor.forClass(ProfileEntity.class);
        verify(profileRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(userId);
        assertThat(captor.getValue().getSkills()).isEmpty();
    }

    @Test
    void updateMyProfile_existingProfile() {
        when(currentUserResolver.resolveRequired()).thenReturn(authEntity);
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.of(profileEntity));
        when(profileRepository.save(any(ProfileEntity.class))).thenReturn(profileEntity);
        when(profileMapper.toResponse(profileEntity)).thenReturn(profileResponse);

        ProfileResponse result = profileService.updateMyProfile(profileRequest);

        assertThat(result).isEqualTo(profileResponse);
        verify(profileRepository).findByUserId(userId);
        verify(profileMapper).updateEntity(profileRequest, profileEntity);
        verify(profileRepository).save(profileEntity);
    }

    @Test
    void updateMyProfile_createsDefaultProfile() {
        when(currentUserResolver.resolveRequired()).thenReturn(authEntity);
        when(profileRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(profileRepository.save(any(ProfileEntity.class))).thenReturn(profileEntity);
        when(profileMapper.toResponse(profileEntity)).thenReturn(profileResponse);

        ProfileResponse result = profileService.updateMyProfile(profileRequest);

        assertThat(result).isEqualTo(profileResponse);
        verify(profileRepository).findByUserId(userId);
        verify(profileMapper).updateEntity(profileRequest, profileEntity);
        verify(profileRepository).save(profileEntity);
    }
}
