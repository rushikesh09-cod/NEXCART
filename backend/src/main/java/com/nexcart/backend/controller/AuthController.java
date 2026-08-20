package com.nexcart.backend.controller;

import com.nexcart.backend.dto.AuthResponse;
import com.nexcart.backend.dto.LoginRequest;
import com.nexcart.backend.dto.RegisterRequest;
import com.nexcart.backend.dto.UserResponse;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        User user = authService.register(request);

        UserResponse response =
                UserResponse.fromUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        AuthService.LoginResult result =
                authService.login(request);

        UserResponse userResponse =
                UserResponse.fromUser(result.user());

        AuthResponse response =
                new AuthResponse(
                        result.token(),
                        "Bearer",
                        userResponse
                );

        return ResponseEntity.ok(response);
    }
}