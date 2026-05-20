package com.alexanderpolozhnov.careerpilot.user.controller;

import com.alexanderpolozhnov.careerpilot.audit.annotation.Auditable;
import com.alexanderpolozhnov.careerpilot.auth.request.AccountDeletionRequest;
import com.alexanderpolozhnov.careerpilot.auth.service.AuthService;
import com.alexanderpolozhnov.careerpilot.user.request.UpdateUserRequest;
import com.alexanderpolozhnov.careerpilot.user.response.UserResponse;
import com.alexanderpolozhnov.careerpilot.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @GetMapping("/me")
    public UserResponse getMe() {
        return userService.getMe();
    }

    @PutMapping("/me")
    public UserResponse updateMe(@Valid @RequestBody UpdateUserRequest request) {
        return userService.updateMe(request);
    }

    @DeleteMapping("/me")
    @Auditable(action = "ACCOUNT_DELETE", entityType = "USER")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMe(@Valid @RequestBody AccountDeletionRequest request) {
        authService.deleteAccount(request);
    }
}
