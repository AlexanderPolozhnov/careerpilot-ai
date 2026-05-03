package com.alexanderpolozhnov.careerpilot.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class OllamaLlmProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(OllamaLlmProvider.class);
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;
    @Value("${ollama.model:llama3}")
    private String ollamaModel;

    @Override
    public String generate(String prompt) {
        try {
            String url = ollamaBaseUrl + "/api/generate";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Object> body = Map.of(
                "model", ollamaModel,
                "prompt", prompt,
                "stream", false
            );
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object responseText = response.getBody().get("response");
                if (responseText != null) {
                    return responseText.toString();
                }
            }
        } catch (Exception e) {
            log.warn("Ollama unavailable, using fallback: {}", e.getMessage());
        }
        return generateFallback(prompt);
    }

    private String generateFallback(String prompt) {
        if (prompt.contains("VACANCY_ANALYSIS") || prompt.contains("vacancy") || prompt.contains("вакансии")) {
            return """
                ## Анализ вакансии
                
                **Ключевые требования:**
                - Опыт работы с современными технологиями
                - Умение работать в команде
                - Готовность к постоянному обучению
                
                **Зарплатная вилка:** Конкурентная, соответствует рынку
                
                **Культура компании:** По описанию — продуктовая команда с agile-подходом
                
                **Рекомендации:**
                1. Подчеркните релевантный опыт в сопроводительном письме
                2. Подготовьте примеры проектов, демонстрирующих ключевые навыки
                3. Изучите технологический стек компании
                
                > *Это автоматически сгенерированный анализ (fallback-режим)*
                """;
        }
        if (prompt.contains("RESUME_MATCH") || prompt.contains("resume") || prompt.contains("резюме")) {
            return """
                ## Соответствие резюме вакансии
                
                **Общее соответствие: 72%**
                
                ### Совпадающие навыки
                - Основные технические навыки совпадают
                - Опыт работы в схожей области
                
                ### Недостающие навыки
                - Некоторые специфические технологии требуют изучения
                - Опыт в конкретной индустрии может быть усилен
                
                ### Рекомендации
                1. Выделите наиболее релевантные проекты
                2. Добавьте количественные результаты достижений
                3. Изучите ключевые технологии из описания вакансии
                
                > *Это автоматически сгенерированный анализ (fallback-режим)*
                """;
        }
        if (prompt.contains("COVER_LETTER") || prompt.contains("cover") || prompt.contains("письмо")) {
            return """
                ## Сопроводительное письмо
                
                Уважаемая команда по подбору персонала,
                
                Я хотел бы выразить свой интерес к данной позиции. Мой опыт и навыки \
                хорошо соответствуют требованиям, описанным в вакансии.
                
                За время своей карьеры я успешно реализовал ряд проектов, \
                которые демонстрируют мои компетенции в данной области. \
                Я уверен, что смогу внести значительный вклад в развитие вашей команды.
                
                Буду рад обсудить детали на собеседовании.
                
                С уважением,
                [Ваше имя]
                
                > *Это автоматически сгенерированный шаблон (fallback-режим)*
                """;
        }
        if (prompt.contains("INTERVIEW_QUESTIONS") || prompt.contains("interview") || prompt.contains("вопросы")) {
            return """
                ## Вопросы для подготовки к собеседованию
                
                ### Технические вопросы
                1. Расскажите о наиболее сложном техническом решении, которое вы реализовали
                2. Как вы подходите к оптимизации производительности в проектах?
                3. Опишите ваш опыт работы с командой в agile-среде
                
                ### Вопросы о поведении
                4. Приведите пример ситуации, когда вам пришлось принять сложное решение под давлением времени
                5. Как вы справляетесь с конфликтами в команде?
                
                ### Вопросы о компании
                6. Что привлекает вас именно в нашей компании?
                7. Как вы видите свой карьерный рост в течение следующих 2-3 лет?
                
                > *Это автоматически сгенерированный список (fallback-режим)*
                """;
        }
        return """
            ## Результат обработки
            
            Ваш запрос был обработан в автоматическом режиме.
            
            > *Ollama недоступен — используется fallback-режим*
            """;
    }
}
