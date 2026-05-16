package com.alexanderpolozhnov.careerpilot.resume.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.resume.entity.ResumeEntity;
import com.alexanderpolozhnov.careerpilot.resume.mapper.ResumeMapper;
import com.alexanderpolozhnov.careerpilot.resume.repository.ResumeRepository;
import com.alexanderpolozhnov.careerpilot.resume.request.ResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResumeServiceImplTest {
    @Mock
    private ResumeRepository resumeRepository;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @Mock
    private ResumeMapper resumeMapper;
    @InjectMocks
    private ResumeServiceImpl resumeService;

    private AuthEntity currentUser;
    private ResumeEntity resume;

    @BeforeEach
    void setUp() {
        currentUser = new AuthEntity();
        currentUser.setId(UUID.randomUUID());
        currentUser.setEmail("user@example.com");

        resume = new ResumeEntity();
        resume.setId(UUID.randomUUID());
        resume.setUser(currentUser);
        resume.setName("Software Engineer Resume");
        resume.setFileUrl("https://example.com/resume.pdf");
        resume.setTextContent("Resume text content");
        resume.setIsDefault(false);
        resume.setCreatedAt(Instant.now());
        resume.setUpdatedAt(Instant.now());
    }

    @Test
    void listReturnsUserResumes() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findAllByUserId(currentUser.getId())).thenReturn(List.of(resume));
        when(resumeMapper.toResponse(resume)).thenReturn(new ResumeResponse(resume.getId(), currentUser.getId(), resume.getName(), resume.getFileUrl(), resume.getTextContent(), resume.getIsDefault(), resume.getCreatedAt(), resume.getUpdatedAt()));

        var responses = resumeService.list();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).name()).isEqualTo("Software Engineer Resume");
        verify(resumeRepository).findAllByUserId(currentUser.getId());
    }

    @Test
    void createWithIsDefaultFalse() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.save(any(ResumeEntity.class))).thenAnswer(invocation -> {
            ResumeEntity entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            return entity;
        });
        when(resumeMapper.toResponse(any(ResumeEntity.class))).thenAnswer(invocation -> {
            ResumeEntity entity = invocation.getArgument(0);
            return new ResumeResponse(entity.getId(), currentUser.getId(), entity.getName(), entity.getFileUrl(), entity.getTextContent(), entity.getIsDefault(), Instant.now(), Instant.now());
        });

        var request = new ResumeRequest("New Resume", "https://example.com/new.pdf", "Content", false);
        var response = resumeService.create(request);

        assertThat(response.name()).isEqualTo("New Resume");
        assertThat(response.isDefault()).isFalse();
        verify(resumeRepository).save(any(ResumeEntity.class));
    }

    @Test
    void createWithIsDefaultTrueResetsOthers() {
        ResumeEntity defaultResume = new ResumeEntity();
        defaultResume.setId(UUID.randomUUID());
        defaultResume.setUser(currentUser);
        defaultResume.setIsDefault(true);

        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByUserIdAndIsDefaultTrue(currentUser.getId())).thenReturn(List.of(defaultResume));
        when(resumeRepository.saveAll(any(List.class))).thenReturn(List.of(defaultResume));
        when(resumeRepository.save(any(ResumeEntity.class))).thenAnswer(invocation -> {
            ResumeEntity entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            return entity;
        });
        when(resumeMapper.toResponse(any(ResumeEntity.class))).thenAnswer(invocation -> {
            ResumeEntity entity = invocation.getArgument(0);
            return new ResumeResponse(entity.getId(), currentUser.getId(), entity.getName(), entity.getFileUrl(), entity.getTextContent(), entity.getIsDefault(), Instant.now(), Instant.now());
        });

        var request = new ResumeRequest("New Default Resume", null, null, true);
        var response = resumeService.create(request);

        assertThat(response.name()).isEqualTo("New Default Resume");
        assertThat(response.isDefault()).isTrue();
        verify(resumeRepository).findByUserIdAndIsDefaultTrue(currentUser.getId());
        verify(resumeRepository).saveAll(any(List.class));
    }

    @Test
    void getByIdOwnedByUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(resume.getId(), currentUser.getId())).thenReturn(Optional.of(resume));
        when(resumeMapper.toResponse(resume)).thenReturn(new ResumeResponse(resume.getId(), currentUser.getId(), resume.getName(), resume.getFileUrl(), resume.getTextContent(), resume.getIsDefault(), resume.getCreatedAt(), resume.getUpdatedAt()));

        var response = resumeService.getById(resume.getId());

        assertThat(response.id()).isEqualTo(resume.getId());
        assertThat(response.name()).isEqualTo("Software Engineer Resume");
    }

    @Test
    void getByIdNotFoundForOtherUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(any(UUID.class), eq(currentUser.getId()))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.getById(UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Resume not found");
    }

    @Test
    void updateWithIsDefaultTrueResetsOthers() {
        ResumeEntity defaultResume = new ResumeEntity();
        defaultResume.setId(UUID.randomUUID());
        defaultResume.setUser(currentUser);
        defaultResume.setIsDefault(true);

        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(resume.getId(), currentUser.getId())).thenReturn(Optional.of(resume));
        when(resumeRepository.findByUserIdAndIsDefaultTrue(currentUser.getId())).thenReturn(List.of(defaultResume));
        when(resumeRepository.saveAll(any(List.class))).thenReturn(List.of(defaultResume));
        when(resumeRepository.save(any(ResumeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resumeMapper.toResponse(any(ResumeEntity.class))).thenAnswer(invocation -> {
            ResumeEntity entity = invocation.getArgument(0);
            return new ResumeResponse(entity.getId(), currentUser.getId(), entity.getName(), entity.getFileUrl(), entity.getTextContent(), entity.getIsDefault(), Instant.now(), Instant.now());
        });

        var request = new ResumeRequest("Updated Resume", null, null, true);
        var response = resumeService.update(resume.getId(), request);

        assertThat(response.name()).isEqualTo("Updated Resume");
        assertThat(response.isDefault()).isTrue();
        verify(resumeRepository).findByUserIdAndIsDefaultTrue(currentUser.getId());
        verify(resumeRepository).saveAll(any(List.class));
    }

    @Test
    void setAsDefaultResetsOthers() {
        ResumeEntity defaultResume = new ResumeEntity();
        defaultResume.setId(UUID.randomUUID());
        defaultResume.setUser(currentUser);
        defaultResume.setIsDefault(true);

        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(resume.getId(), currentUser.getId())).thenReturn(Optional.of(resume));
        when(resumeRepository.findByUserIdAndIsDefaultTrue(currentUser.getId())).thenReturn(List.of(defaultResume));
        when(resumeRepository.saveAll(any(List.class))).thenReturn(List.of(defaultResume));
        when(resumeRepository.save(any(ResumeEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(resumeMapper.toResponse(any(ResumeEntity.class))).thenAnswer(invocation -> {
            ResumeEntity entity = invocation.getArgument(0);
            return new ResumeResponse(entity.getId(), currentUser.getId(), entity.getName(), entity.getFileUrl(), entity.getTextContent(), entity.getIsDefault(), Instant.now(), Instant.now());
        });

        var response = resumeService.setAsDefault(resume.getId());

        assertThat(response.isDefault()).isTrue();
        verify(resumeRepository).findByUserIdAndIsDefaultTrue(currentUser.getId());
        verify(resumeRepository).saveAll(any(List.class));
        verify(resumeRepository).save(any(ResumeEntity.class));
    }

    @Test
    void setAsDefaultWhenAlreadyDefault() {
        resume.setIsDefault(true);
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(resume.getId(), currentUser.getId())).thenReturn(Optional.of(resume));
        when(resumeMapper.toResponse(resume)).thenReturn(new ResumeResponse(resume.getId(), currentUser.getId(), resume.getName(), resume.getFileUrl(), resume.getTextContent(), resume.getIsDefault(), resume.getCreatedAt(), resume.getUpdatedAt()));

        var response = resumeService.setAsDefault(resume.getId());

        assertThat(response.isDefault()).isTrue();
        verify(resumeRepository).findByIdAndUserId(resume.getId(), currentUser.getId());
    }

    @Test
    void deleteOwnedResume() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(resume.getId(), currentUser.getId())).thenReturn(Optional.of(resume));

        resumeService.delete(resume.getId());

        verify(resumeRepository).delete(resume);
    }

    @Test
    void deleteNotFoundForOtherUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(resumeRepository.findByIdAndUserId(any(UUID.class), eq(currentUser.getId()))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resumeService.delete(UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Resume not found");
    }
}
