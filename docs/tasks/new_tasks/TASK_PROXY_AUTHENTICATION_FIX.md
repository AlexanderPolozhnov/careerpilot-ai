# Task: Fix Proxy Authentication Required (407) for hh.ru API

## Контекст и цель
При работе бэкенда на Cloud Run запросы к API hh.ru выполняются через прокси-сервер с Basic-аутентификацией.
В настоящее время возникает ошибка `407 Proxy Authentication Required` из-за того, что:
1. Системное свойство `jdk.http.auth.tunneling.disabledSchemes` устанавливается слишком поздно (в `@PostConstruct` сервиса `HhVacancyPollingService`), когда сетевые классы JVM уже инициализированы другими процессами (Redis, Flyway и т.д.).
2. Использование глобального `Authenticator.setDefault` может конфликтовать с другими сетевыми компонентами и ненадежно в многопоточной среде.

Цель задачи — гарантировать применение системного свойства до инициализации сети и перевести HTTP-клиент `RestTemplate` в `HhVacancyPollingService` на `JdkClientHttpRequestFactory` с изолированным аутентификатором.

## Затрагиваемые файлы

### Изменить существующие
- [CareerpilotAiApplication.java](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/backend/src/main/java/com/alexanderpolozhnov/careerpilot/CareerpilotAiApplication.java) — добавить `static {}` блок для установки сетевых свойств JVM в самом начале загрузки приложения.
- [HhVacancyPollingService.java](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/service/HhVacancyPollingService.java) — переписать инициализацию `RestTemplate` с использованием `JdkClientHttpRequestFactory` и локального `java.net.http.HttpClient`.

## Backend: точная реализация

### CareerpilotAiApplication.java
Добавить статический инициализатор:
```java
	static {
		// Разрешаем базовую аутентификацию для HTTPS-туннелей (иначе Java блокирует Basic авторизацию на CONNECT)
		System.setProperty("jdk.http.auth.tunneling.disabledSchemes", "");
		System.setProperty("jdk.http.auth.proxying.disabledSchemes", "");
	}
```

### HhVacancyPollingService.java
Изменить метод `init()`:
```java
    @PostConstruct
    public void init() {
        if (hhProxyEnabled && hhProxyHost != null && !hhProxyHost.isBlank()) {
            log.info("Configuring HH.ru API polling to use proxy {}:{}", hhProxyHost, hhProxyPort);
            
            java.net.http.HttpClient.Builder httpClientBuilder = java.net.http.HttpClient.newBuilder()
                    .followRedirects(java.net.http.HttpClient.Redirect.NORMAL);

            httpClientBuilder.proxy(java.net.http.ProxySelector.of(new InetSocketAddress(hhProxyHost, hhProxyPort)));

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
```

## Порядок реализации для агента реализации
1. [x] Добавить `static` блок в [CareerpilotAiApplication.java](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/backend/src/main/java/com/alexanderpolozhnov/careerpilot/CareerpilotAiApplication.java).
2. [x] Переписать метод `init()` в [HhVacancyPollingService.java](file:///C:/Projects/For%20GitHub/careerpilot-ai-public/backend/src/main/java/com/alexanderpolozhnov/careerpilot/monitoring/service/HhVacancyPollingService.java), используя `JdkClientHttpRequestFactory` и `java.net.http.HttpClient`.
3. [x] Выполнить компиляцию бэкенда для проверки синтаксиса: `.\mvnw.cmd clean compile -DskipTests` в папке `backend`.
4. [x] Запустить локальные тесты бэкенда: `.\mvnw.cmd test` в папке `backend` или проверить общую сборку проекта через `.\verify-all.ps1`.
5. [x] Обновить документацию (`docs/CONTEXT_BACKUP.md`), добавив запись о решении проблемы 407 ошибки.

## Риски и что проверить
- Возможные конфликты импортов: убедиться, что `Authenticator`, `InetSocketAddress`, `PasswordAuthentication` импортируются правильно.
- Совместимость с другими сетевыми запросами: так как `java.net.http.HttpClient` используется локально, он не затронет работу других HTTP-запросов (например, к провайдерам LLM или Telegram API).

## Проверки после реализации
**Backend:** `.\mvnw.cmd clean compile -DskipTests` и запуск тестов.
**Интеграция:** Проверить отсутствие ошибки `Unable to tunnel through proxy. Proxy returns "HTTP/1.0 407 Proxy Authentication Required"` при старте опроса вакансий.
