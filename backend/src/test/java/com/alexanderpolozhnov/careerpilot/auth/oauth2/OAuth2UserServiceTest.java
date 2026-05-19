package com.alexanderpolozhnov.careerpilot.auth.oauth2;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthProvider;
import com.alexanderpolozhnov.careerpilot.auth.exception.AuthException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2UserServiceTest {

    @Mock
    private AuthRepository authRepository;

    @InjectMocks
    private CustomOAuth2UserService oauth2UserService;

    @Test
    void loadUser_newGithubUser_createsUser() {
        ClientRegistration clientRegistration = ClientRegistration.withRegistrationId("github")
                .clientId("test")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("test")
                .authorizationUri("test")
                .tokenUri("test")
                .build();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "token", null, null);
        OAuth2UserRequest userRequest = new OAuth2UserRequest(clientRegistration, accessToken);

        OAuth2User defaultOAuth2User = new DefaultOAuth2User(Collections.emptyList(),
                Map.of("email", "test@github.com", "name", "Github User", "id", 12345), "email");

        when(authRepository.findByEmail("test@github.com")).thenReturn(Optional.empty());
        when(authRepository.save(any(AuthEntity.class))).thenAnswer(invocation -> {
            AuthEntity entity = invocation.getArgument(0);
            entity.setId(java.util.UUID.randomUUID());
            return entity;
        });

        OAuth2User user = oauth2UserService.processOAuth2User(userRequest, defaultOAuth2User);

        assertNotNull(user);
        verify(authRepository).save(any(AuthEntity.class));
    }

    @Test
    void loadUser_existingUser_returnsExistingUser() {
        ClientRegistration clientRegistration = ClientRegistration.withRegistrationId("google")
                .clientId("test")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("test")
                .authorizationUri("test")
                .tokenUri("test")
                .build();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "token", null, null);
        OAuth2UserRequest userRequest = new OAuth2UserRequest(clientRegistration, accessToken);

        OAuth2User defaultOAuth2User = new DefaultOAuth2User(Collections.emptyList(),
                Map.of("email", "test@google.com", "name", "Google User", "sub", "google-sub-id"), "email");
        
        AuthEntity existingUser = new AuthEntity();
        existingUser.setEmail("test@google.com");
        existingUser.setProvider(AuthProvider.LOCAL);
        
        when(authRepository.findByEmail("test@google.com")).thenReturn(Optional.of(existingUser));

        OAuth2User user = oauth2UserService.processOAuth2User(userRequest, defaultOAuth2User);

        assertNotNull(user);
        verify(authRepository, never()).save(any());
        assertEquals("test@google.com", user.getName());
    }

    @Test
    void loadUser_noEmail_throwsException() {
        ClientRegistration clientRegistration = ClientRegistration.withRegistrationId("github")
                .clientId("test")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("test")
                .authorizationUri("test")
                .tokenUri("test")
                .build();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, "token", null, null);
        OAuth2UserRequest userRequest = new OAuth2UserRequest(clientRegistration, accessToken);

        OAuth2User defaultOAuth2User = new DefaultOAuth2User(Collections.emptyList(),
                Map.of("name", "Github User", "id", 12345), "name");

        assertThrows(AuthException.class, () -> oauth2UserService.processOAuth2User(userRequest, defaultOAuth2User));
    }
}
