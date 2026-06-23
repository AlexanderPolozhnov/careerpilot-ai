package com.alexanderpolozhnov.careerpilot.monitoring.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import com.alexanderpolozhnov.careerpilot.ai.service.LlmProvider;
import com.alexanderpolozhnov.careerpilot.ai.service.LlmProviderFactory;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.monitoring.entity.VacancyFilterEntity;
import com.alexanderpolozhnov.careerpilot.monitoring.repository.VacancyFilterRepository;
import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import com.alexanderpolozhnov.careerpilot.preferences.repository.PreferencesRepository;
import com.alexanderpolozhnov.careerpilot.resume.entity.UserResumeEntity;
import com.alexanderpolozhnov.careerpilot.resume.repository.UserResumeRepository;
import com.alexanderpolozhnov.careerpilot.telegram.service.TelegramBotHandler;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.alexanderpolozhnov.careerpilot.notification.service.ReminderScheduler;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import jakarta.annotation.PostConstruct;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.net.Authenticator;
import java.net.InetSocketAddress;
import java.net.PasswordAuthentication;
import java.net.Proxy;

@Service
@Slf4j
@RequiredArgsConstructor
public class HhVacancyPollingService {

    private final VacancyFilterRepository vacancyFilterRepository;
    private final UserResumeRepository userResumeRepository;
    private final PreferencesRepository preferencesRepository;
    private final LlmProviderFactory llmProviderFactory;
    private final TelegramBotHandler telegramBotHandler;
    private final CacheManager cacheManager;
    private final ObjectMapper objectMapper;
    private final ReminderScheduler reminderScheduler;

    @Value("${hh.user-agent:CareerPilot-AI/1.0 (support@careerpilot-ai.ru)}")
    private String hhUserAgent;

    @Value("${hh.proxy.enabled:false}")
    private boolean hhProxyEnabled;

    @Value("${hh.proxy.host:}")
    private String hhProxyHost;

    @Value("${hh.proxy.port:8080}")
    private int hhProxyPort;

    @Value("${hh.proxy.username:}")
    private String hhProxyUsername;

    @Value("${hh.proxy.password:}")
    private String hhProxyPassword;

    private RestTemplate restTemplate;

    @PostConstruct
    public void init() {
        if (hhProxyEnabled && hhProxyHost != null && !hhProxyHost.isBlank()) {
            log.info("Configuring HH.ru API polling to use proxy {}:{}", hhProxyHost, hhProxyPort);
            
            java.net.http.HttpClient.Builder httpClientBuilder = java.net.http.HttpClient.newBuilder()
                    .followRedirects(java.net.http.HttpClient.Redirect.NORMAL);

            httpClientBuilder.proxy(java.net.ProxySelector.of(new InetSocketAddress(hhProxyHost, hhProxyPort)));

            if (hhProxyUsername != null && !hhProxyUsername.isBlank()) {
                httpClientBuilder.authenticator(new Authenticator() {
                    @Override
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(hhProxyUsername, hhProxyPassword.toCharArray());
                    }
                });
            }

            java.net.http.HttpClient httpClient = httpClientBuilder.build();
            org.springframework.http.client.JdkClientHttpRequestFactory requestFactory = 
                    new org.springframework.http.client.JdkClientHttpRequestFactory(httpClient);
            this.restTemplate = new RestTemplate(requestFactory);
        } else {
            this.restTemplate = new RestTemplate();
        }
    }

    @Scheduled(fixedRate = 300000) // Раз в 5 минут
    public void pollVacancies() {
        log.info("HhVacancyPollingService starting polling cycle...");
        
        try {
            reminderScheduler.checkAndSendReminders();
        } catch (Exception e) {
            log.error("Error running reminder check inside polling cycle", e);
        }

        try {
            List<VacancyFilterEntity> activeFilters = vacancyFilterRepository.findByIsActiveTrue();
            log.info("Found {} active vacancy filters for polling", activeFilters.size());

            for (VacancyFilterEntity filter : activeFilters) {
                try {
                    // Проверяем индивидуальный интервал опроса
                    Instant lastPolled = filter.getLastPolledAt();
                    Integer intervalMin = filter.getPollingInterval() != null ? filter.getPollingInterval() : 30;
                    if (lastPolled != null) {
                        Instant nextPollTime = lastPolled.plus(java.time.Duration.ofMinutes(intervalMin));
                        if (Instant.now().isBefore(nextPollTime)) {
                            continue; // Время опроса для данного фильтра еще не подошло
                        }
                    }
                    processFilter(filter);
                } catch (Exception e) {
                    log.error("Error processing vacancy filter id={}", filter.getId(), e);
                    telegramBotHandler.sendAdminAlert("Ошибка при обработке фильтра ID=" + filter.getId() + "\n" +
                            "Запрос: " + filter.getSearchQuery() + "\n" +
                            "Пользователь: " + filter.getUser().getEmail() + "\n" +
                            "Ошибка: " + e.getMessage() + "\n\n" +
                            "Что сказать агенту: 'Проверь логи HhVacancyPollingService и корректность запросов к hh.ru или LLM-провайдеру.'");
                }
            }
        } catch (Exception e) {
            log.error("Error in pollVacancies scheduler cycle", e);
            telegramBotHandler.sendAdminAlert("Критическая ошибка в планировщике hh.ru:\n" + e.getMessage() + "\n\n" +
                    "Что сказать агенту: 'Проверь планировщик HhVacancyPollingService.pollVacancies и целостность базы данных.'");
        }
        log.info("HhVacancyPollingService polling cycle finished.");
    }

    private void processFilter(VacancyFilterEntity filter) throws Exception {
        AuthEntity user = filter.getUser();
        log.info("Processing filter id={} for user={}", filter.getId(), user.getEmail());

        // Получаем настройки телеграм чата. Если telegramChatId не привязан, пропускаем
        PreferencesEntity preferences = preferencesRepository.findByUserId(user.getId()).orElse(null);
        if (preferences == null || preferences.getTelegramChatId() == null || preferences.getTelegramChatId().isBlank()) {
            log.warn("User {} has no telegramChatId configured. Skipping filter processing.", user.getEmail());
            return;
        }

        // HH.ru API GET /vacancies
        String url = "https://api.hh.ru/vacancies";
        UriComponentsBuilder uriBuilder = UriComponentsBuilder.fromHttpUrl(url)
                .queryParam("text", filter.getSearchQuery())
                .queryParam("period", 1)
                .queryParam("per_page", 10);

        if (filter.getTargetSalary() != null) {
            uriBuilder.queryParam("salary", filter.getTargetSalary());
        }

        if (filter.getExperience() != null && !filter.getExperience().isBlank()) {
            for (String val : filter.getExperience().split(",")) {
                String trimmed = val.trim();
                if (!trimmed.isEmpty()) {
                    uriBuilder.queryParam("experience", trimmed);
                }
            }
        }
        if (filter.getEmployment() != null && !filter.getEmployment().isBlank()) {
            for (String val : filter.getEmployment().split(",")) {
                String trimmed = val.trim();
                if (!trimmed.isEmpty()) {
                    uriBuilder.queryParam("employment", trimmed);
                }
            }
        }
        if (filter.getSchedule() != null && !filter.getSchedule().isBlank()) {
            for (String val : filter.getSchedule().split(",")) {
                String trimmed = val.trim();
                if (!trimmed.isEmpty()) {
                    uriBuilder.queryParam("schedule", trimmed);
                }
            }
        }
        if (filter.getArea() != null && !filter.getArea().isBlank()) {
            for (String a : filter.getArea().split(",")) {
                String trimmed = a.trim();
                if (!trimmed.isEmpty()) {
                    uriBuilder.queryParam("area", trimmed);
                }
            }
        }
        if (Boolean.TRUE.equals(filter.getOnlyWithSalary())) {
            uriBuilder.queryParam("only_with_salary", true);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", hhUserAgent);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        ResponseEntity<HhVacanciesResponse> response;
        try {
            response = restTemplate.exchange(
                    uriBuilder.toUriString(),
                    HttpMethod.GET,
                    entity,
                    HhVacanciesResponse.class
            );
        } catch (Exception e) {
            log.error("Failed to query hh.ru vacancies for filter query={}", filter.getSearchQuery(), e);
            telegramBotHandler.sendAdminAlert("Ошибка запроса к API hh.ru для фильтра ID=" + filter.getId() + " (" + filter.getSearchQuery() + "):\n" + e.getMessage() + "\n\n" +
                    "Что сказать агенту: 'Проверь сетевое подключение к api.hh.ru, лимиты запросов (Rate Limiting) или формат ответа.'");
            return;
        }

        HhVacanciesResponse body = response.getBody();
        if (body == null || body.getItems() == null || body.getItems().isEmpty()) {
            log.info("No new vacancies found for filter query={}", filter.getSearchQuery());
            filter.setLastPolledAt(Instant.now());
            vacancyFilterRepository.save(filter);
            return;
        }

        log.info("Found {} vacancies for filter query={}", body.getItems().size(), filter.getSearchQuery());

        Cache cache = cacheManager.getCache("notified_vacancies");

        for (HhVacancyItem item : body.getItems()) {
            String cacheKey = user.getId() + ":" + item.getId();
            if (cache != null && cache.get(cacheKey) != null) {
                // Уже обрабатывали эту вакансию для этого пользователя
                continue;
            }

            // Делаем паузу перед запросами к HH API
            Thread.sleep(1500);

            // Получаем полную информацию о вакансии
            String fullDescription = fetchVacancyDescription(item.getId());
            if (fullDescription == null) {
                fullDescription = (item.getSnippet() != null ? item.getSnippet().getRequirement() + " " + item.getSnippet().getResponsibility() : "");
            }

            // Получаем резюме пользователя
            UserResumeEntity resume = userResumeRepository.findByUserId(user.getId()).orElse(null);
            if (resume == null || resume.getRawText() == null || resume.getRawText().isBlank()) {
                log.warn("User {} has no raw resume text configured. Cannot perform AI matching.", user.getEmail());
                break; // Нет смысла опрашивать остальные, пока нет резюме
            }

            // Вызываем LLM для сравнения
            LlmMatchResult matchResult = checkMatchAndGenerateLetter(user, preferences, resume, item.getName(), fullDescription);

            // Записываем в кэш, чтобы больше не обрабатывать
            if (cache != null) {
                cache.put(cacheKey, Boolean.TRUE);
            }

            if (matchResult.isMatch()) {
                log.info("Vacancy matched! Sending Telegram alert for vacancy id={} user={}", item.getId(), user.getEmail());
                telegramBotHandler.sendVacancyAlert(
                        preferences.getTelegramChatId(),
                        item.getAlternateUrl(),
                        matchResult.getCoverLetter()
                );
            } else {
                log.info("Vacancy did not match. (Match score < 80%)");
            }
        }

        filter.setLastPolledAt(Instant.now());
        vacancyFilterRepository.save(filter);
    }

    private String fetchVacancyDescription(String vacancyId) {
        String url = "https://api.hh.ru/vacancies/" + vacancyId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", hhUserAgent);
        HttpEntity<?> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            Map body = response.getBody();
            if (body != null && body.containsKey("description")) {
                String descHtml = (String) body.get("description");
                if (descHtml != null) {
                    return descHtml.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
                }
            }
        } catch (Exception e) {
            log.error("Error fetching full description for vacancy id={}", vacancyId, e);
        }
        return null;
    }

    private LlmMatchResult checkMatchAndGenerateLetter(
            AuthEntity user,
            PreferencesEntity preferences,
            UserResumeEntity resume,
            String vacancyTitle,
            String vacancyDescription
    ) {
        String prompt = buildPrompt(resume, vacancyTitle, vacancyDescription);

        try {
            LlmProvider provider = llmProviderFactory.getProvider(preferences);
            LlmResponse response = provider.generate(prompt, preferences);

            String responseText = response.text();
            if (responseText == null || responseText.isBlank()) {
                log.warn("LLM returned empty response for vacancy match check");
                return new LlmMatchResult(false, "");
            }

            // Очищаем от Markdown блоков (```json ... ```) если LLM их добавила
            String cleanedJson = responseText.trim();
            if (cleanedJson.startsWith("```")) {
                int firstLineEnd = cleanedJson.indexOf("\n");
                int lastBackticks = cleanedJson.lastIndexOf("```");
                if (firstLineEnd != -1 && lastBackticks != -1 && lastBackticks > firstLineEnd) {
                    cleanedJson = cleanedJson.substring(firstLineEnd + 1, lastBackticks).trim();
                }
            }

            return objectMapper.readValue(cleanedJson, LlmMatchResult.class);
        } catch (Exception e) {
            log.error("Failed to parse or execute LLM response for vacancy matching", e);
            return new LlmMatchResult(false, "");
        }
    }

    private String buildPrompt(UserResumeEntity resume, String vacancyTitle, String vacancyDescription) {
        return "You are an AI Job Search Assistant. Compare the candidate's resume with the vacancy description.\n" +
                "Evaluate if the match is greater than 80% based on skills, experience, and requirements.\n" +
                "Apply the following evaluation leniency rules:\n" +
                "1. Job Title Match: Do not require strict title matches (e.g., 'Middle React Developer' should match well with 'Frontend Developer' if tech stack matches).\n" +
                "2. Experience Leniency: Be flexible with experience years. If vacancy requires 3 years, and candidate has 2 or 2.5 years, do not reject solely because of this.\n" +
                "3. Education: Ignore strict higher education requirements (university degree) unless it is a highly regulated medical/legal field.\n" +
                "4. Tech Stack: Focus on core technologies. If candidate knows React and TypeScript, but vacancy also lists Redux/Next.js (which candidate can easily learn), do not reject.\n" +
                "5. Overall Fit: If candidate's skills align well with the vacancy's day-to-day responsibilities, consider it a match.\n\n" +
                "If the match is > 80%, generate a tailored cover letter using the candidate's Cover Letter Template (fill in details or adjust tone to fit this vacancy).\n" +
                "If the match is <= 80%, set isMatch to false.\n\n" +
                "Candidate Resume Text:\n" +
                resume.getRawText() + "\n\n" +
                "Cover Letter Template (adjust/complete this template if matched):\n" +
                (resume.getCoverLetterTemplate() != null ? resume.getCoverLetterTemplate() : "") + "\n\n" +
                "Vacancy Title: " + vacancyTitle + "\n" +
                "Vacancy Description:\n" +
                vacancyDescription + "\n\n" +
                "You must return response STRICTLY as a JSON object, without any markdown formatting or surrounding text. Format:\n" +
                "{\n" +
                "  \"isMatch\": boolean,\n" +
                "  \"coverLetter\": \"string (generated cover letter, or empty string if not matched)\"\n" +
                "}";
    }

    @Data
    public static class HhVacanciesResponse {
        private List<HhVacancyItem> items;
    }

    @Data
    public static class HhVacancyItem {
        private String id;
        private String name;
        @JsonProperty("alternate_url")
        private String alternateUrl;
        private HhSnippet snippet;
    }

    @Data
    public static class HhSnippet {
        private String requirement;
        private String responsibility;
    }

    @Data
    public static class LlmMatchResult {
        @JsonProperty("isMatch")
        private boolean isMatch;
        private String coverLetter;

        public LlmMatchResult() {}

        public LlmMatchResult(boolean isMatch, String coverLetter) {
            this.isMatch = isMatch;
            this.coverLetter = coverLetter;
        }
    }
}
