package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.dto.LlmResponse;
import org.springframework.stereotype.Component;

@Component
public class FallbackLlmGenerator {

    public LlmResponse generateFallback(String prompt) {
        String text;
        if (prompt.contains("VACANCY_ANALYSIS") || prompt.contains("vacancy") || prompt.contains("вакансии")) {
            text = """
                    ## Анализ вакансии

                    **Ключевые требования:**
                    - Опыт работы с современными технологиями
                    - Умение работать в команде
                    - Готовность к постоянному обучению

                    **Зарплатная вилка:** Конкурентная, соответствует рынку

                    **Культура компании:** По описанию — продуктовая команда с agile-подходом

                    **Рекомендации:**
                    1. Подчеркните релевантный опыт в сопроводительном письме
                    2. Подготовьте примеры проектов, демонстрирующие ключевые навыки
                    3. Изучите технологический стек компании

                    > *Это автоматически сгенерированный анализ (fallback-режим)*
                    """;
        } else if (prompt.contains("RESUME_MATCH") || prompt.contains("resume") || prompt.contains("резюме")) {
            text = """
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
        } else if (prompt.contains("COVER_LETTER") || prompt.contains("cover") || prompt.contains("письмо")) {
            text = """
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
        } else if (prompt.contains("INTERVIEW_QUESTIONS") || prompt.contains("interview")
                || prompt.contains("вопросы")) {
            text = """
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
        } else if (prompt.contains("RESUME_GENERATION") || prompt.contains("Improve and optimize")) {
            return new LlmResponse(
                    "## Improved Resume (Tailored Version)\n\n" +
                            "### Professional Summary\n" +
                            "Highly skilled professional with proven impact. Tailored key accomplishments to align with target job requirements.\n\n"
                            +
                            "### Key Achievements & Improvements\n" +
                            "- **Impact Metric:** Optimized slow application bottlenecks, reducing latency by **35%** (originally stated as 'fixed speed issues').\n"
                            +
                            "- **Relevance:** Highlighted TypeScript & React design system experiences to match target vacancy requirements.\n\n"
                            +
                            "### Polished Experience\n" +
                            "**Senior Software Engineer** | Tech Corp\n" +
                            "- Architected reusable component library used by 15+ developers, saving ~200 engineering hours/month.\n"
                            +
                            "- Led cross-functional syncs to align engineering deliverables with Product roadmap.",
                    350,
                    1500L,
                    null,
                    true);
        } else {
            text = """
                    ## Результат обработки

                    Ваш запрос был обработан в автоматическом режиме.

                    > *Ollama недоступен — используется fallback-режим*
                    """;
        }
        return new LlmResponse(text, 0, 0L, null, true);
    }
}
