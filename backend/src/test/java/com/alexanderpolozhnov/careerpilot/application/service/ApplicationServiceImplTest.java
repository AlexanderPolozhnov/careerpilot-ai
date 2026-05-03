package com.alexanderpolozhnov.careerpilot.application.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.application.exception.ApplicationNotFoundException;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.application.request.ApplicationRequest;
import com.alexanderpolozhnov.careerpilot.application.response.ApplicationResponse;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.pagination.PagedResponse;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

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
class ApplicationServiceImplTest {

    @Mock
    private ApplicationRepository applicationRepository;
    @Mock
    private VacancyRepository vacancyRepository;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @InjectMocks
    private ApplicationServiceImpl applicationService;

    private AuthEntity currentUser;
    private AuthEntity otherUser;
    private VacancyEntity vacancy;
    private ApplicationEntity application;

    @BeforeEach
    void setUp() {
        currentUser = new AuthEntity();
        currentUser.setId(UUID.randomUUID());
        currentUser.setEmail("user@example.com");

        otherUser = new AuthEntity();
        otherUser.setId(UUID.randomUUID());
        otherUser.setEmail("other@example.com");

        vacancy = new VacancyEntity();
        vacancy.setId(UUID.randomUUID());
        vacancy.setUser(currentUser);
        vacancy.setTitle("Backend Engineer");

        application = new ApplicationEntity();
        application.setId(UUID.randomUUID());
        application.setUser(currentUser);
        application.setVacancy(vacancy);
        application.setStatus(ApplicationStatus.NEW);
        application.setCreatedAt(Instant.parse("2026-04-27T10:00:00Z"));
        application.setUpdatedAt(Instant.parse("2026-04-27T10:00:00Z"));
    }

    @Test
    void createApplicationForCurrentUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(vacancyRepository.findByIdAndUserId(vacancy.getId(), currentUser.getId()))
            .thenReturn(Optional.of(vacancy));
        when(applicationRepository.save(any(ApplicationEntity.class))).thenAnswer(inv -> {
            ApplicationEntity entity = inv.getArgument(0);
            if (entity.getId() == null) entity.setId(UUID.randomUUID());
            entity.setCreatedAt(Instant.now());
            entity.setUpdatedAt(Instant.now());
            return entity;
        });

        ApplicationRequest request = new ApplicationRequest(vacancy.getId(), ApplicationStatus.SAVED,
            "Interesting role", null, null);
        ApplicationResponse response = applicationService.create(request);

        assertThat(response.vacancyId()).isEqualTo(vacancy.getId());
        assertThat(response.status()).isEqualTo(ApplicationStatus.SAVED);
        assertThat(response.notes()).isEqualTo("Interesting role");
        verify(applicationRepository).save(any(ApplicationEntity.class));
    }

    @Test
    void listReturnsOnlyOwnApplications() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(applicationRepository.findAllByUserId(any(UUID.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(application)));

        PagedResponse<ApplicationResponse> response = applicationService.list(0, 20, null, null);

        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).vacancyId()).isEqualTo(vacancy.getId());
        assertThat(response.totalElements()).isEqualTo(1);
    }

    @Test
    void getByIdOwnedApplication() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        ApplicationResponse response = applicationService.getById(application.getId());

        assertThat(response.id()).isEqualTo(application.getId());
        assertThat(response.vacancyId()).isEqualTo(vacancy.getId());
    }

    @Test
    void getByIdOtherUserApplicationThrowsNotFound() {
        // Заявка принадлежит другому пользователю
        application.setUser(otherUser);
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        assertThatThrownBy(() -> applicationService.getById(application.getId()))
            .isInstanceOf(ApplicationNotFoundException.class);
    }

    @Test
    void getByIdNotExistingApplicationThrowsNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(applicationRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> applicationService.getById(unknownId))
            .isInstanceOf(ApplicationNotFoundException.class);
    }

    @Test
    void updateApplicationOwnedByUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));
        when(vacancyRepository.findByIdAndUserId(vacancy.getId(), currentUser.getId()))
            .thenReturn(Optional.of(vacancy));
        when(applicationRepository.save(any(ApplicationEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ApplicationRequest request = new ApplicationRequest(vacancy.getId(), ApplicationStatus.APPLIED, "Updated notes",
            null, "resume-1");
        ApplicationResponse response = applicationService.update(application.getId(), request);

        assertThat(response.status()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(response.notes()).isEqualTo("Updated notes");
        assertThat(response.resumeId()).isEqualTo("resume-1");
    }

    @Test
    void deleteApplicationOwnedByUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(applicationRepository.findById(application.getId())).thenReturn(Optional.of(application));

        applicationService.delete(application.getId());

        verify(applicationRepository).delete(application);
    }
}
