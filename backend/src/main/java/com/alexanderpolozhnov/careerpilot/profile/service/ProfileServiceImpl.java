package com.alexanderpolozhnov.careerpilot.profile.service;
import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import org.springframework.stereotype.Service;
@Service public class ProfileServiceImpl implements ProfileService { public ProfileResponse create(ProfileRequest request){ return new ProfileResponse(null); } }
