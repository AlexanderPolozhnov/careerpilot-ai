package com.alexanderpolozhnov.careerpilot.config;

import com.alexanderpolozhnov.careerpilot.auth.security.JwtAuthenticationFilter;
import com.alexanderpolozhnov.careerpilot.auth.oauth2.CustomOAuth2UserService;
import com.alexanderpolozhnov.careerpilot.auth.oauth2.OAuth2SuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity httpSecurity,
                        JwtAuthenticationFilter jwtAuthenticationFilter,
                        CustomOAuth2UserService customOAuth2UserService,
                        OAuth2SuccessHandler oAuth2SuccessHandler) throws Exception {
                httpSecurity
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(Customizer.withDefaults())
                                // .sessionManagement(session ->
                                // session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // Note: OAuth2 login requires session to store the authorization request.
                                // We keep session for OAuth2, but use JWT for API authentication.
                                .exceptionHandling(exception -> exception
                                                .authenticationEntryPoint((request, response, authException) -> response
                                                                .sendError(HttpServletResponse.SC_UNAUTHORIZED,
                                                                                "Unauthorized"))
                                                .accessDeniedHandler((request, response,
                                                                accessDeniedException) -> response.sendError(
                                                                                HttpServletResponse.SC_FORBIDDEN,
                                                                                "Access denied")))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/auth/register",
                                                                "/api/auth/login", "/api/auth/telegram-webapp", "/api/auth/forgot-password",
                                                                "/api/auth/reset-password", "/api/auth/refresh",
                                                                "/api/auth/logout", "/api/telegram/webhook", "/api/payments/webhook/telegram")
                                                .permitAll()
                                                .requestMatchers("/api/auth/oauth2/**", "/login/oauth2/**",
                                                                "/oauth2/authorization/**")
                                                .permitAll()
                                                .requestMatchers("/api/**").authenticated()
                                                .anyRequest().permitAll())
                                .oauth2Login(oauth2 -> oauth2
                                                .userInfoEndpoint(userInfo -> userInfo
                                                                .userService(customOAuth2UserService))
                                                .successHandler(oAuth2SuccessHandler))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return httpSecurity.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:5173",
                                "https://careerpilot-frontend-213199819151.europe-west1.run.app",
                                "https://careerpilot-ai.ru",
                                "https://www.careerpilot-ai.ru"));
                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}
