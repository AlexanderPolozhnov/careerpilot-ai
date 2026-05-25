package com.alexanderpolozhnov.careerpilot.export.service;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.repository.ApplicationRepository;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.company.entity.CompanyEntity;
import com.alexanderpolozhnov.careerpilot.company.repository.CompanyRepository;
import com.alexanderpolozhnov.careerpilot.interview.entity.InterviewEntity;
import com.alexanderpolozhnov.careerpilot.interview.repository.InterviewRepository;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.task.entity.TaskEntity;
import com.alexanderpolozhnov.careerpilot.task.repository.TaskRepository;
import com.alexanderpolozhnov.careerpilot.vacancy.entity.VacancyEntity;
import com.alexanderpolozhnov.careerpilot.vacancy.repository.VacancyRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final InterviewRepository interviewRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserResolver currentUserResolver;
    private final PreferencesRepository preferencesRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm")
            .withZone(ZoneId.of("UTC"));

    @Override
    @Transactional(readOnly = true)
    public byte[] exportUserDataToExcel() {
        AuthEntity user = currentUserResolver.resolveRequired();
        UUID userId = user.getId();
        String language = preferencesRepository.findByUserId(userId)
                .map(prefs -> prefs.getLanguage())
                .orElse("en");

        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            // Create sheets with localized names
            Sheet vacanciesSheet = workbook.createSheet(getLocalizedHeader("Vacancies", "Вакансии", language));
            Sheet applicationsSheet = workbook.createSheet(getLocalizedHeader("Applications", "Отклики", language));
            Sheet companiesSheet = workbook.createSheet(getLocalizedHeader("Companies", "Компании", language));
            Sheet interviewsSheet = workbook.createSheet(getLocalizedHeader("Interviews", "Собеседования", language));
            Sheet tasksSheet = workbook.createSheet(getLocalizedHeader("Tasks", "Задачи", language));

            // Fill vacancies
            fillVacanciesSheet(vacanciesSheet, vacancyRepository.findAllByUserId(userId), language);

            // Fill applications
            fillApplicationsSheet(applicationsSheet, applicationRepository.findAllByUserId(userId), language);

            // Fill companies
            fillCompaniesSheet(companiesSheet, companyRepository.findAllByUserId(userId), language);

            // Fill interviews
            fillInterviewsSheet(interviewsSheet, interviewRepository.findAllByApplication_User_Id(userId), language);

            // Fill tasks
            fillTasksSheet(tasksSheet, taskRepository.findAllByUserId(userId), language);

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    private void fillVacanciesSheet(Sheet sheet, List<VacancyEntity> vacancies, String language) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue(getLocalizedHeader("Title", "Название", language));
        headerRow.createCell(2).setCellValue(getLocalizedHeader("Company", "Компания", language));
        headerRow.createCell(3).setCellValue(getLocalizedHeader("Status", "Статус", language));
        headerRow.createCell(4).setCellValue(getLocalizedHeader("Location", "Локация", language));
        headerRow.createCell(5).setCellValue(getLocalizedHeader("Remote Type", "Тип работы", language));
        headerRow.createCell(6).setCellValue(getLocalizedHeader("Salary From", "Зарплата от", language));
        headerRow.createCell(7).setCellValue(getLocalizedHeader("Salary To", "Зарплата до", language));
        headerRow.createCell(8).setCellValue(getLocalizedHeader("Currency", "Валюта", language));
        headerRow.createCell(9).setCellValue(getLocalizedHeader("Source URL", "Ссылка", language));
        headerRow.createCell(10).setCellValue(getLocalizedHeader("Deadline", "Дедлайн", language));
        headerRow.createCell(11).setCellValue(getLocalizedHeader("Created At", "Создано", language));

        int rowNum = 1;
        for (VacancyEntity vacancy : vacancies) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(vacancy.getId().toString());
            row.createCell(1).setCellValue(vacancy.getTitle());
            row.createCell(2).setCellValue(vacancy.getCompany() != null ? vacancy.getCompany().getName() : "");
            row.createCell(3).setCellValue(vacancy.getStatus() != null ? vacancy.getStatus().name() : "");
            row.createCell(4).setCellValue(vacancy.getLocation() != null ? vacancy.getLocation() : "");
            row.createCell(5).setCellValue(vacancy.getRemoteType() != null ? vacancy.getRemoteType().name() : "");
            row.createCell(6).setCellValue(vacancy.getSalaryFrom() != null ? vacancy.getSalaryFrom() : 0);
            row.createCell(7).setCellValue(vacancy.getSalaryTo() != null ? vacancy.getSalaryTo() : 0);
            row.createCell(8).setCellValue(vacancy.getCurrency() != null ? vacancy.getCurrency() : "");
            row.createCell(9).setCellValue(vacancy.getSourceUrl() != null ? vacancy.getSourceUrl() : "");
            row.createCell(10)
                    .setCellValue(vacancy.getDeadline() != null ? DATE_FORMATTER.format(vacancy.getDeadline()) : "");
            row.createCell(11)
                    .setCellValue(vacancy.getCreatedAt() != null ? DATE_FORMATTER.format(vacancy.getCreatedAt()) : "");
        }

        // Auto-size columns
        for (int i = 0; i < 12; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void fillApplicationsSheet(Sheet sheet, List<ApplicationEntity> applications, String language) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue(getLocalizedHeader("Vacancy Title", "Вакансия", language));
        headerRow.createCell(2).setCellValue(getLocalizedHeader("Company", "Компания", language));
        headerRow.createCell(3).setCellValue(getLocalizedHeader("Status", "Статус", language));
        headerRow.createCell(4).setCellValue(getLocalizedHeader("Applied At", "Отклик", language));
        headerRow.createCell(5).setCellValue(getLocalizedHeader("Next Follow Up At", "След. контакт", language));
        headerRow.createCell(6).setCellValue(getLocalizedHeader("Last Contact At", "Посл. контакт", language));
        headerRow.createCell(7).setCellValue(getLocalizedHeader("Notes", "Заметки", language));
        headerRow.createCell(8).setCellValue(getLocalizedHeader("Resume ID", "ID резюме", language));
        headerRow.createCell(9).setCellValue(getLocalizedHeader("First Interview At", "Первое интервью", language));

        int rowNum = 1;
        for (ApplicationEntity application : applications) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(application.getId().toString());
            row.createCell(1).setCellValue(application.getVacancy() != null ? application.getVacancy().getTitle() : "");
            row.createCell(2)
                    .setCellValue(application.getVacancy() != null && application.getVacancy().getCompany() != null
                            ? application.getVacancy().getCompany().getName()
                            : "");
            row.createCell(3).setCellValue(application.getStatus() != null ? application.getStatus().name() : "");
            row.createCell(4).setCellValue(
                    application.getAppliedAt() != null ? DATE_FORMATTER.format(application.getAppliedAt()) : "");
            row.createCell(5)
                    .setCellValue(application.getNextFollowUpAt() != null
                            ? DATE_FORMATTER.format(application.getNextFollowUpAt())
                            : "");
            row.createCell(6)
                    .setCellValue(application.getLastContactAt() != null
                            ? DATE_FORMATTER.format(application.getLastContactAt())
                            : "");
            row.createCell(7).setCellValue(application.getNotes() != null ? application.getNotes() : "");
            row.createCell(8).setCellValue(application.getResumeId() != null ? application.getResumeId() : "");
            row.createCell(9)
                    .setCellValue(application.getFirstInterviewAt() != null
                            ? DATE_FORMATTER.format(application.getFirstInterviewAt())
                            : "");
        }

        // Auto-size columns
        for (int i = 0; i < 10; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void fillCompaniesSheet(Sheet sheet, List<CompanyEntity> companies, String language) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue(getLocalizedHeader("Name", "Название", language));
        headerRow.createCell(2).setCellValue(getLocalizedHeader("Website", "Веб-сайт", language));
        headerRow.createCell(3).setCellValue(getLocalizedHeader("Industry", "Индустрия", language));
        headerRow.createCell(4).setCellValue(getLocalizedHeader("Size", "Размер", language));
        headerRow.createCell(5).setCellValue(getLocalizedHeader("Location", "Локация", language));
        headerRow.createCell(6).setCellValue(getLocalizedHeader("LinkedIn URL", "LinkedIn", language));
        headerRow.createCell(7).setCellValue(getLocalizedHeader("Description", "Описание", language));

        int rowNum = 1;
        for (CompanyEntity company : companies) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(company.getId().toString());
            row.createCell(1).setCellValue(company.getName());
            row.createCell(2).setCellValue(company.getWebsite() != null ? company.getWebsite() : "");
            row.createCell(3).setCellValue(company.getIndustry() != null ? company.getIndustry() : "");
            row.createCell(4).setCellValue(company.getSize() != null ? company.getSize().name() : "");
            row.createCell(5).setCellValue(company.getLocation() != null ? company.getLocation() : "");
            row.createCell(6).setCellValue(company.getLinkedinUrl() != null ? company.getLinkedinUrl() : "");
            row.createCell(7).setCellValue(company.getDescription() != null ? company.getDescription() : "");
        }

        // Auto-size columns
        for (int i = 0; i < 8; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void fillInterviewsSheet(Sheet sheet, List<InterviewEntity> interviews, String language) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue(getLocalizedHeader("Application ID", "ID отклика", language));
        headerRow.createCell(2).setCellValue(getLocalizedHeader("Vacancy Title", "Вакансия", language));
        headerRow.createCell(3).setCellValue(getLocalizedHeader("Type", "Тип", language));
        headerRow.createCell(4).setCellValue(getLocalizedHeader("Scheduled At", "Запланировано", language));
        headerRow.createCell(5).setCellValue(getLocalizedHeader("Timezone", "Часовой пояс", language));
        headerRow.createCell(6).setCellValue(getLocalizedHeader("Meeting Link", "Ссылка", language));
        headerRow.createCell(7).setCellValue(getLocalizedHeader("Result", "Результат", language));
        headerRow.createCell(8).setCellValue(getLocalizedHeader("Notes", "Заметки", language));

        int rowNum = 1;
        for (InterviewEntity interview : interviews) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(interview.getId().toString());
            row.createCell(1).setCellValue(
                    interview.getApplication() != null ? interview.getApplication().getId().toString() : "");
            row.createCell(2)
                    .setCellValue(interview.getApplication() != null && interview.getApplication().getVacancy() != null
                            ? interview.getApplication().getVacancy().getTitle()
                            : "");
            row.createCell(3).setCellValue(interview.getType() != null ? interview.getType().name() : "");
            row.createCell(4).setCellValue(
                    interview.getScheduledAt() != null ? DATE_FORMATTER.format(interview.getScheduledAt()) : "");
            row.createCell(5).setCellValue(interview.getTimezone() != null ? interview.getTimezone() : "");
            row.createCell(6).setCellValue(interview.getMeetingLink() != null ? interview.getMeetingLink() : "");
            row.createCell(7).setCellValue(interview.getResult() != null ? interview.getResult().name() : "");
            row.createCell(8).setCellValue(interview.getNotes() != null ? interview.getNotes() : "");
        }

        // Auto-size columns
        for (int i = 0; i < 9; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void fillTasksSheet(Sheet sheet, List<TaskEntity> tasks, String language) {
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("ID");
        headerRow.createCell(1).setCellValue(getLocalizedHeader("Title", "Название", language));
        headerRow.createCell(2).setCellValue(getLocalizedHeader("Description", "Описание", language));
        headerRow.createCell(3).setCellValue(getLocalizedHeader("Due At", "Срок", language));
        headerRow.createCell(4).setCellValue(getLocalizedHeader("Done", "Выполнено", language));
        headerRow.createCell(5).setCellValue(getLocalizedHeader("Priority", "Приоритет", language));
        headerRow.createCell(6).setCellValue(getLocalizedHeader("Application ID", "ID отклика", language));

        int rowNum = 1;
        for (TaskEntity task : tasks) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(task.getId().toString());
            row.createCell(1).setCellValue(task.getTitle());
            row.createCell(2).setCellValue(task.getDescription() != null ? task.getDescription() : "");
            row.createCell(3).setCellValue(task.getDueAt() != null ? DATE_FORMATTER.format(task.getDueAt()) : "");
            row.createCell(4).setCellValue(task.getDone() != null ? task.getDone() : false);
            row.createCell(5).setCellValue(task.getPriority() != null ? task.getPriority().name() : "");
            row.createCell(6)
                    .setCellValue(task.getApplication() != null ? task.getApplication().getId().toString() : "");
        }

        // Auto-size columns
        for (int i = 0; i < 7; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String getLocalizedHeader(String english, String russian, String language) {
        return "ru".equalsIgnoreCase(language) ? russian : english;
    }
}
