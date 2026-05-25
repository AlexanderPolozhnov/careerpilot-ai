package com.alexanderpolozhnov.careerpilot.export.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExportServiceImplTest {

    @Mock
    private VacancyRepository vacancyRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private InterviewRepository interviewRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private CurrentUserResolver currentUserResolver;

    @Mock
    private PreferencesRepository preferencesRepository;

    @InjectMocks
    private ExportServiceImpl exportService;

    private AuthEntity user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new AuthEntity();
        user.setId(userId);

        PreferencesEntity prefs = new PreferencesEntity();
        prefs.setLanguage("en");
        when(preferencesRepository.findByUserId(userId)).thenReturn(Optional.of(prefs));
    }

    @Test
    void exportUserDataToExcel_shouldReturnByteArray() {
        // Arrange
        when(currentUserResolver.resolveRequired()).thenReturn(user);
        when(vacancyRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());
        when(applicationRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());
        when(companyRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());
        when(interviewRepository.findAllByApplication_User_Id(userId)).thenReturn(new ArrayList<>());
        when(taskRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());

        // Act
        byte[] result = exportService.exportUserDataToExcel();

        // Assert
        assertNotNull(result);
        assertTrue(result.length > 0);
        verify(currentUserResolver).resolveRequired();
        verify(vacancyRepository).findAllByUserId(userId);
        verify(applicationRepository).findAllByUserId(userId);
        verify(companyRepository).findAllByUserId(userId);
        verify(interviewRepository).findAllByApplication_User_Id(userId);
        verify(taskRepository).findAllByUserId(userId);
        verify(preferencesRepository).findByUserId(userId);
    }

    @Test
    void exportUserDataToExcel_withData_shouldReturnValidExcel() {
        // Arrange
        when(currentUserResolver.resolveRequired()).thenReturn(user);

        VacancyEntity vacancy = new VacancyEntity();
        vacancy.setId(UUID.randomUUID());
        vacancy.setTitle("Test Vacancy");
        vacancy.setStatus(com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyStatus.ACTIVE);

        when(vacancyRepository.findAllByUserId(userId)).thenReturn(List.of(vacancy));
        when(applicationRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());
        when(companyRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());
        when(interviewRepository.findAllByApplication_User_Id(userId)).thenReturn(new ArrayList<>());
        when(taskRepository.findAllByUserId(userId)).thenReturn(new ArrayList<>());

        // Act
        byte[] result = exportService.exportUserDataToExcel();

        // Assert
        assertNotNull(result);
        assertTrue(result.length > 0);
    }
}
