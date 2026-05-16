package com.alexanderpolozhnov.careerpilot.profile.service;

import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import com.alexanderpolozhnov.careerpilot.profile.mapper.ProfileMapper;
import com.alexanderpolozhnov.careerpilot.profile.repository.ProfileRepository;
import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final CurrentUserResolver currentUserResolver; // ВАЖНО: использовать его

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        ProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(userId));
        return profileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public ProfileResponse updateMyProfile(ProfileRequest request) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        ProfileEntity profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(userId));

        profileMapper.updateEntity(request, profile);
        return profileMapper.toResponse(profileRepository.save(profile));
    }

    private ProfileEntity createDefaultProfile(UUID userId) {
        ProfileEntity profile = new ProfileEntity();
        profile.setUserId(userId);
        profile.setSkills(new ArrayList<>());
        return profileRepository.save(profile);
    }
}
