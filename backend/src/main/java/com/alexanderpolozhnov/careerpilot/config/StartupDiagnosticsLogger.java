package com.alexanderpolozhnov.careerpilot.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class StartupDiagnosticsLogger {

    private final Environment environment;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupDiagnostics() {
        log.info("Active profiles: {}", List.of(environment.getActiveProfiles()));
        log.info("Datasource URL: {}", environment.getProperty("spring.datasource.url", "n/a"));

        List<Map<String, Object>> history = jdbcTemplate.queryForList(
                "SELECT installed_rank, version, script, success " +
                        "FROM careerpilot.flyway_schema_history " +
                        "ORDER BY installed_rank DESC LIMIT 5"
        );
        log.info("Flyway latest entries: {}", history);

        Integer users = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM careerpilot.users", Integer.class);
        Integer companies = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM careerpilot.companies", Integer.class);
        Integer vacancies = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM careerpilot.vacancies", Integer.class);
        Integer applications = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM careerpilot.applications", Integer.class);
        log.info("Seed entity counts users={}, companies={}, vacancies={}, applications={}",
                users, companies, vacancies, applications);
    }
}
