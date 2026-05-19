package com.alexanderpolozhnov.careerpilot.auth.oauth2;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.auth.entity.AuthProvider;
import com.alexanderpolozhnov.careerpilot.auth.exception.AuthException;
import com.alexanderpolozhnov.careerpilot.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthRepository authRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    OAuth2User processOAuth2User(OAuth2UserRequest userRequest, OAuth2User oAuth2User) {
        String registrationId = userRequest.getClientRegistration().getRegistrationId().toUpperCase();
        AuthProvider provider;
        try {
            provider = AuthProvider.valueOf(registrationId);
        } catch (IllegalArgumentException e) {
            throw new AuthException("Sorry! Login with " + registrationId + " is not supported yet.");
        }

        String email = null;
        String name = null;
        String providerId = null;

        if (provider == AuthProvider.GOOGLE) {
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            providerId = oAuth2User.getAttribute("sub");
        } else if (provider == AuthProvider.GITHUB) {
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            if (name == null) {
                name = oAuth2User.getAttribute("login");
            }
            Integer id = oAuth2User.getAttribute("id");
            providerId = id != null ? id.toString() : null;

            if (email == null) {
                email = fetchGithubEmail(userRequest.getAccessToken().getTokenValue());
            }
        }

        if (email == null) {
            throw new AuthException("Email not found from OAuth2 provider");
        }
        
        email = email.trim().toLowerCase();

        Optional<AuthEntity> userOptional = authRepository.findByEmail(email);
        AuthEntity user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
        } else {
            user = new AuthEntity();
            user.setEmail(email);
            user.setProvider(provider);
            user.setProviderId(providerId);
            user.setFullName(name != null ? name : email);
            user = authRepository.save(user);
        }

        return new CustomOAuth2User(oAuth2User, user);
    }

    private String fetchGithubEmail(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                    "https://api.github.com/user/emails",
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            if (response.getBody() != null) {
                for (Map<String, Object> emailObj : response.getBody()) {
                    if (Boolean.TRUE.equals(emailObj.get("primary")) && Boolean.TRUE.equals(emailObj.get("verified"))) {
                        return (String) emailObj.get("email");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to fetch GitHub email", e);
        }
        return null;
    }
}
