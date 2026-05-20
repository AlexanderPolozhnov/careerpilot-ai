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
