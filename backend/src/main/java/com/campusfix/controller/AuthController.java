package com.campusfix.controller;

import com.campusfix.dto.AuthResponse;
import com.campusfix.dto.LoginRequest;
import com.campusfix.dto.MessageResponse;
import com.campusfix.dto.RegisterRequest;
import com.campusfix.dto.UserResponse;
import com.campusfix.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Public endpoints: register and login. Logout is explained below. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * JWT is stateless: the server does not keep a session, so "logout" simply means the
     * client deletes its token. This endpoint exists so the frontend has a clear API call
     * for logout and so it can be extended later (e.g. a token blacklist).
     */
    @PostMapping("/logout")
    public MessageResponse logout() {
        return new MessageResponse("Logged out successfully. Please discard the token on the client.");
    }
}
