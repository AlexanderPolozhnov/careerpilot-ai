package com.alexanderpolozhnov.careerpilot.profile.controller;

import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import com.alexanderpolozhnov.careerpilot.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Validated
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/me")
    public ProfileResponse getMyProfile() {
        return profileService.getMyProfile();
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(@Valid @RequestBody ProfileRequest request) {
        return profileService.updateMyProfile(request);
    }
}
