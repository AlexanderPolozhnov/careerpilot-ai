# Task: Исправление утечки сессий OAuth2 (Cross-User Data Leakage)

## Контекст и цель
При входе пользователя через Google OAuth2 создается сессия `HttpSession` и кука `JSESSIONID`. При последующем выходе (logout) и входе под другим аккаунтом по паролю, из-за неправильного порядка очистки токена на фронтенде и отсутствия принудительной очистки сессионного контекста безопасности на бэкенде, запросы к API выполнялись от имени предыдущего пользователя Google (у которого всё пусто).
Цель — гарантировать полную изоляцию пользователей, инвалидацию сессий и очистку контекста безопасности.

## Затрагиваемые файлы

### Изменить существующие
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/security/JwtAuthenticationFilter.java` — Очищать контекст безопасности для непубличных путей API, если в запросе отсутствует или невалиден JWT.
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/auth/controller/AuthController.java` — Добавить удаление куки `JSESSIONID` в ответе на логаут.
- `frontend/src/services/auth.service.ts` — Поменять порядок вызовов в методе `logout()`, чтобы запрос уходил с JWT.

## Backend: точная реализация

### JwtAuthenticationFilter.java
Добавить логику проверки пути и принудительную очистку контекста безопасности.

```java
package com.alexanderpolozhnov.careerpilot.auth.security;

import com.alexanderpolozhnov.careerpilot.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final String AUTHORIZATION = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Если это публичный эндпоинт, просто пропускаем дальше
        if (isPublicPath(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader(AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            // ПРИНУДИТЕЛЬНО очищаем контекст безопасности для защищенных путей,
            // чтобы сессия HttpSession (например, от OAuth2) не подставила старого пользователя
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(BEARER_PREFIX.length());
        if (!jwtService.isTokenValid(token)) {
            // То же самое, если токен невалиден
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        String subject = jwtService.extractSubject(token);
        if (subject != null) {
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(subject, null, List.of());
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.contains("/api/auth/login") ||
               path.contains("/api/auth/register") ||
               path.contains("/api/auth/forgot-password") ||
               path.contains("/api/auth/reset-password") ||
               path.contains("/api/auth/refresh") ||
               path.contains("/api/auth/logout") ||
               path.contains("/api/auth/oauth2") ||
               path.contains("/oauth2/") ||
               path.contains("/login/oauth2");
    }
}
```

### AuthController.java
В метод `logout` добавить удаление куки `JSESSIONID`:

```java
    @PostMapping("/logout")
    @Auditable(action = "USER_LOGOUT", entityType = "USER")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@CookieValue(name = "refresh_token", required = false) String refreshToken,
            jakarta.servlet.http.HttpServletRequest request,
            HttpServletResponse response) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        jakarta.servlet.http.HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        
        // Принудительное удаление куки JSESSIONID из браузера
        jakarta.servlet.http.Cookie cookieJSession = new jakarta.servlet.http.Cookie("JSESSIONID", null);
        cookieJSession.setPath("/");
        cookieJSession.setMaxAge(0);
        response.addCookie(cookieJSession);

        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
```

## Frontend: точная реализация

### auth.service.ts
Изменить метод `logout` так, чтобы запрос к API отправлялся до очистки токена:

```typescript
  logout: (): void => {
    if (!USE_MOCKS) {
      api.post<void>('/auth/logout').catch(e => console.error('Logout API call failed', e))
    }
    clearToken()
  },
```

## Порядок реализации для SWE-1.6
1. Применить изменения в `JwtAuthenticationFilter.java`.
2. Добавить удаление куки `JSESSIONID` в `AuthController.java`.
3. Поменять порядок очистки токена в `auth.service.ts` на фронтенде.
4. Выполнить компиляцию бэкенда и сборку фронтенда для проверки отсутствия синтаксических ошибок.

## Риски и что проверить
- Убедиться, что при выходе сессия успешно инвалидируется на сервере, а в браузере пропадает кука `JSESSIONID`.
- Проверить, что после входа под вторым пользователем все настройки, вакансии и канбан-доска отображают корректные данные именно второго пользователя.

## Проверки после реализации
**Backend:** `.\mvnw.cmd test -Dtest="AuthControllerTest"`
**Frontend:** `cd frontend && npm.cmd run build`
