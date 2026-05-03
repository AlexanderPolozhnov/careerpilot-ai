package com.alexanderpolozhnov.careerpilot.user.controller;

import com.alexanderpolozhnov.careerpilot.user.request.UpdateUserRequest;
import com.alexanderpolozhnov.careerpilot.user.response.UserResponse;
import com.alexanderpolozhnov.careerpilot.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getMe() {
        return userService.getMe();
    }

    @PutMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UpdateUserRequest request) {
        return userService.updateMe(request);
    }
}
