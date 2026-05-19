package com.alexanderpolozhnov.careerpilot.auth.oauth2;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class CustomOAuth2User implements OAuth2User {

    private final OAuth2User oauth2User;
    private final AuthEntity userEntity;

    public CustomOAuth2User(OAuth2User oauth2User, AuthEntity userEntity) {
        this.oauth2User = oauth2User;
        this.userEntity = userEntity;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oauth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userEntity.getRole().name()));
    }

    @Override
    public String getName() {
        return userEntity.getEmail();
    }
}
