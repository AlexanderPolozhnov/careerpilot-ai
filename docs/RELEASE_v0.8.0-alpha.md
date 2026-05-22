# Release v0.8.0-alpha — Dynamic AI Provider Configuration & Secure Storage

**Тег:** `v0.8.0-alpha`
**Статус:** Выпущено
**Дата:** 2026-05-22

## Обзор
Этот релиз переводит систему интеграции с ИИ на новый уровень гибкости и безопасности. Теперь пользователи могут управлять провайдерами ИИ (Ollama и OpenAI) прямо из интерфейса настроек в реальном времени, при этом их персональные ключи надежно защищены шифрованием на стороне сервера. Это значительно упрощает настройку приложения и обеспечивает защиту конфиденциальных данных.

## Ключевые изменения

### 🚀 Новые функции (Features)
- **Dynamic AI Provider Switching:** Возможность выбора между LOCAL (Ollama), CLOUD (OpenAI) и BRING_YOUR_OWN_KEY через UI.
- **Secure Key Storage (Encryption at Rest):** Все персональные API-ключи OpenAI теперь шифруются алгоритмом AES-256 перед сохранением в базу данных.
- **Personal AI Keys & URLs:** Пользователи могут сохранять свои собственные API-ключи или кастомные адреса Ollama в профиле.
- **Enhanced Settings UI:** Улучшенный блок настроек с динамическими формами, поддержкой маскирования ключей и подсказками по Docker.
- **Fallback Mode Indication:** Визуальный бейдж "Fallback Mode" отображается при использовании mock-данных AI, что позволяет пользователям понимать, когда ИИ недоступен.
- **Default AI Settings:** Новые пользователи автоматически получают дефолтные значения Ollama URL (`http://localhost:11434`) и Model (`llama3`).
- **Empty Field Handling:** Если пользователь оставил поля Ollama URL/Model пустыми, система использует дефолтные значения вместо ошибки.
- **Gemini AI Provider:** Добавлена поддержка Google Gemini как альтернативного провайдера AI для режима "Свой ключ" (BRING_YOUR_OWN_KEY).
- **Custom Provider Selection:** Возможность выбора между OpenAI и Gemini в настройках AI.
- **CustomSelect Component:** Создан универсальный кастомный компонент для выпадающих списков с улучшенным UX, поддержкой цветных индикаторов, disabled-состояния и интеграцией с React Hook Form через Controller.

### 🛠 Улучшения и оптимизация (Improvements)
- **AI Provider Factory:** Архитектурный рефакторинг бэкенда: внедрена фабрика провайдеров для динамического выбора стратегии генерации.
- **API Response Masking:** Чувствительные данные (ключи) маскируются при передаче на фронтенд (`sk-...4a2b`), что предотвращает их компрометацию.
- **Ollama Docker Compatibility:** Возможность указания сетевых алиасов (например, `http://careerpilot-ollama:11434`) в UI для работы в контейнерах.
- **Fallback Consolidation:** Логика "заглушек" вынесена в отдельный компонент `FallbackLlmGenerator`.

### 🧪 Стабильность и тесты (Stability)
- **Security Logic Validation:** Проверены сценарии защиты ключей от случайного удаления при обновлении настроек профиля.
- **Backend Tests:** Обновлены тесты `AiServiceImplTest` и добавлены проверки для шифрования.
- **Frontend Hardening:** Проведена полная проверка сборки и линтинга фронтенда.

### 🔒 Безопасность (Security)
- **Encryption at Rest:** Внедрен `EncryptionConverter` для прозрачного шифрования полей БД через JPA.
- **Master Key Protection:** Ключ шифрования вынесен в переменные окружения (`ENCRYPTION_MASTER_KEY`).

## Технические детали
- **Backend:** Миграции `V25` (шифрование), `V26` (is_fallback), `V27` (Gemini provider), внедрение `LlmProviderFactory`, `EncryptionConverter`, `OpenAiLlmProvider`, `GeminiLlmProvider`, обновление `FallbackLlmGenerator`, `OllamaLlmProvider` (логика дефолтов), `AiServiceImpl` (сохранение isFallback, передача PreferencesEntity в factory), `AiMapper` (маппинг isFallback), `PreferencesServiceImpl` (инициализация дефолтов, обработка Gemini полей), новый enum `CustomAiProvider`.
- **Frontend:** Обновление `SettingsPage.tsx` с поддержкой маскированных ключей, динамических плейсхолдеров, подсказок о дефолтных значениях, селектора провайдера (OpenAI/Gemini); обновление `AiInsightCard.tsx` с визуальной индикацией fallback-режима; обновление `types/index.ts` с полем `isFallback`; обновление `settings.service.ts` с новыми полями для Gemini; создание нового компонента `CustomSelect.tsx` с поддержкой цветных индикаторов, disabled-состояния и интеграцией с React Hook Form через Controller; полная замена нативных `<select>` на `CustomSelect` в `TasksPage.tsx`, `InterviewsPage.tsx`, `VacanciesPage.tsx`, `TaskForm.tsx`, `InterviewForm.tsx`, `VacancyForm.tsx`, `CompanyForm.tsx`.
- **I18n:** Добавлены ключи для fallback mode, подсказок о дефолтных значениях и Gemini провайдера в `ru.json` и `en.json`.
- **Infra:** Обновлено руководство `docs/DEPLOYMENT.md` с описанием параметров шифрования и fallback mode.

## Что дальше?
- **Resume Text Generation:** Использование нового ИИ-движка для автоматической оптимизации текстов резюме.
- **Performance Optimization:** Дальнейшая работа над Code Splitting на фронтенде.
