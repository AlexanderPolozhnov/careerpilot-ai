package com.alexanderpolozhnov.careerpilot.profile.service;

import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;

public interface ProfileService {
    ProfileResponse getMyProfile();

    ProfileResponse updateMyProfile(ProfileRequest request);
}
