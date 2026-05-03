package com.alexanderpolozhnov.careerpilot.user.service;

import com.alexanderpolozhnov.careerpilot.user.request.UpdateUserRequest;
import com.alexanderpolozhnov.careerpilot.user.response.UserResponse;

public interface UserService {
    UserResponse getMe();

    UserResponse updateMe(UpdateUserRequest request);
}
