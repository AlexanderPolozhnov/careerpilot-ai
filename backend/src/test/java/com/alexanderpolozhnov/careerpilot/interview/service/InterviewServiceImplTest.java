package com.alexanderpolozhnov.careerpilot.interview.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewResult;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewType;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InterviewServiceImplTest {

    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository applicationRepository;
    @Mock
    private CurrentUserResolver currentUserResolver;
    @InjectMocks
    private InterviewServiceImpl interviewService;

    private AuthEntity currentUser;
    private ApplicationEntity application;
    private InterviewEntity interview;

    @BeforeEach
    void setUp() {
        currentUser = new AuthEntity();
        currentUser.setId(UUID.randomUUID());
        currentUser.setEmail("user@example.com");

        application = new ApplicationEntity();
        application.setId(UUID.randomUUID());
        application.setUser(currentUser);

        interview = new InterviewEntity();
        interview.setId(UUID.randomUUID());
        interview.setApplication(application);
        interview.setType(InterviewType.TECH_INTERVIEW);
        interview.setScheduledAt(Instant.parse("2026-05-25T10:00:00Z"));
        interview.setMeetingLink("https://zoom.us/j/123456789");
        interview.setNotes("Prepare for system design questions");
        interview.setResult(InterviewResult.PENDING);
    }

    @Test
    void exportToIcsGeneratesValidIcsContent() {
        when(currentUserResolver.resolveOrCreate()).thenReturn(currentUser);
        when(interviewRepository.findById(interview.getId())).thenReturn(Optional.of(interview));

        byte[] icsData = interviewService.exportToIcs(interview.getId());
        String icsContent = new String(icsData, java.nio.charset.StandardCharsets.UTF_8);

        assertThat(icsContent).contains("BEGIN:VCALENDAR");
        assertThat(icsContent).contains("VERSION:2.0");
        assertThat(icsContent).contains("PRODID:-//CareerPilot AI//EN");
        assertThat(icsContent).contains("CALSCALE:GREGORIAN");
        assertThat(icsContent).contains("BEGIN:VEVENT");
        assertThat(icsContent).contains("UID:" + interview.getId() + "@careerpilot.ai");
        assertThat(icsContent).contains("DTSTART:");
        assertThat(icsContent).contains("DTEND:");
        assertThat(icsContent).contains("SUMMARY:Собеседование (TECH_INTERVIEW)");
        assertThat(icsContent).contains("DESCRIPTION:");
        assertThat(icsContent).contains("LOCATION:https://zoom.us/j/123456789");
        assertThat(icsContent).contains("END:VEVENT");
        assertThat(icsContent).contains("END:VCALENDAR");
    }

    @Test
    void exportToIcsFormatsDatesInUtc() {
        when(currentUserResolver.resolveOrCreate()).thenReturn(currentUser);
        when(interviewRepository.findById(interview.getId())).thenReturn(Optional.of(interview));

        byte[] icsData = interviewService.exportToIcs(interview.getId());
        String icsContent = new String(icsData, java.nio.charset.StandardCharsets.UTF_8);

        // Check UTC format (yyyyMMdd'T'HHmmss'Z')
        assertThat(icsContent).containsPattern("DTSTART:\\d{8}T\\d{6}Z");
        assertThat(icsContent).containsPattern("DTEND:\\d{8}T\\d{6}Z");
        assertThat(icsContent).containsPattern("DTSTAMP:\\d{8}T\\d{6}Z");
    }

    @Test
    void exportToIcsHandlesEmptyNotesAndMeetingLink() {
        interview.setNotes(null);
        interview.setMeetingLink(null);

        when(currentUserResolver.resolveOrCreate()).thenReturn(currentUser);
        when(interviewRepository.findById(interview.getId())).thenReturn(Optional.of(interview));

        byte[] icsData = interviewService.exportToIcs(interview.getId());
        String icsContent = new String(icsData, java.nio.charset.StandardCharsets.UTF_8);

        assertThat(icsContent).contains("BEGIN:VCALENDAR");
        assertThat(icsContent).contains("END:VCALENDAR");
        // Should not crash with null values
    }
}
