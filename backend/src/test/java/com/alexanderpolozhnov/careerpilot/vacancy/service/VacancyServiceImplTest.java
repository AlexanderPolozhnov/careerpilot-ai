package com.alexanderpolozhnov.careerpilot.vacancy.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.CreateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.dto.UpdateVacancyDto;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.RemoteType;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus;
import com.alexanderpolozhnov.careerpilot.vacancy.mapper.VacancyMapper;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

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
class VacancyServiceImplTest {
    @Mock
    private VacancyRepository vacancyRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @InjectMocks
    private VacancyServiceImpl vacancyService;

    private final VacancyMapper vacancyMapper = new VacancyMapper();
    private AuthEntity currentUser;
    private VacancyEntity vacancy;

    @BeforeEach
    void setUp() {
        vacancyService = new VacancyServiceImpl(vacancyRepository, companyRepository, currentUserResolver, vacancyMapper);
        currentUser = new AuthEntity();
        currentUser.setId(UUID.randomUUID());
        currentUser.setEmail("user@example.com");

        vacancy = new VacancyEntity();
        vacancy.setId(UUID.randomUUID());
        vacancy.setUser(currentUser);
        vacancy.setTitle("Backend Engineer");
        vacancy.setRemoteType(RemoteType.REMOTE);
        vacancy.setStatus(VacancyStatus.ACTIVE);
        vacancy.setCreatedAt(Instant.parse("2026-04-27T10:00:00Z"));
        vacancy.setUpdatedAt(Instant.parse("2026-04-27T10:00:00Z"));
    }

    @Test
    void createVacancyForCurrentUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(vacancyRepository.save(any(VacancyEntity.class))).thenAnswer(invocation -> {
            VacancyEntity entity = invocation.getArgument(0);
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            return entity;
        });

        var dto = vacancyService.create(new CreateVacancyDto(
                "Backend Engineer", null, null, "desc", "Remote", RemoteType.REMOTE,
                1000, 2000, "USD", null, List.of("java"), null
        ));

        assertThat(dto.title()).isEqualTo("Backend Engineer");
        assertThat(dto.status()).isEqualTo(VacancyStatus.ACTIVE);
        verify(vacancyRepository).save(any(VacancyEntity.class));
    }

    @Test
    void listReturnsPagedVacanciesForCurrentUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(vacancyRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(vacancy), PageRequest.of(0, 20), 1));

        var response = vacancyService.list(0, 20, "createdAt", "DESC", null, null, null, null, null);

        assertThat(response.content()).hasSize(1);
        assertThat(response.totalElements()).isEqualTo(1);
    }

    @Test
    void getByIdOwnedByUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(vacancyRepository.findByIdAndUserId(vacancy.getId(), currentUser.getId())).thenReturn(Optional.of(vacancy));

        var dto = vacancyService.getById(vacancy.getId());

        assertThat(dto.id()).isEqualTo(vacancy.getId());
    }

    @Test
    void getByIdNotFoundForOtherUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(vacancyRepository.findByIdAndUserId(any(UUID.class), eq(currentUser.getId()))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> vacancyService.getById(UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Vacancy not found");
    }

    @Test
    void updateVacancyOwnedByUser() {
        when(currentUserResolver.resolveRequired()).thenReturn(currentUser);
        when(vacancyRepository.findByIdAndUserId(vacancy.getId(), currentUser.getId())).thenReturn(Optional.of(vacancy));
        when(vacancyRepository.save(any(VacancyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var dto = vacancyService.update(vacancy.getId(), new UpdateVacancyDto(
                "Updated title", null, null, null, null, null,
                null, null, null, null, null, null, null
        ));

        assertThat(dto.title()).isEqualTo("Updated title");
    }

    @Test
    void validationFailsWhenSalaryRangeInvalid() {
        assertThatThrownBy(() -> vacancyService.create(new CreateVacancyDto(
                "Backend Engineer", null, null, null, null, RemoteType.REMOTE,
                3000, 1000, "USD", null, null, null
        ))).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("salaryMin must be less than or equal to salaryMax");
    }
}
