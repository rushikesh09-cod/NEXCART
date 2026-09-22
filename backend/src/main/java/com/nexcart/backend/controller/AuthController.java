package com.nexcart.backend.controller;

import com.nexcart.backend.dto.AuthResponse;
import com.nexcart.backend.dto.ForgotPasswordRequest;
import com.nexcart.backend.dto.LoginRequest;
import com.nexcart.backend.dto.RegisterRequest;
import com.nexcart.backend.dto.ResetPasswordRequest;
import com.nexcart.backend.dto.UserResponse;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.service.AuthService;
import com.nexcart.backend.service.PasswordResetService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(
            AuthService authService,
            PasswordResetService passwordResetService
    ) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        User user =
                authService.register(request);

        UserResponse response =
                UserResponse.fromUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        AuthService.LoginResult result =
                authService.login(request);

        UserResponse userResponse =
                UserResponse.fromUser(
                        result.user()
                );

        AuthResponse response =
                new AuthResponse(
                        result.token(),
                        "Bearer",
                        userResponse
                );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        passwordResetService.forgotPassword(
                request.getEmail()
        );

        /*
         * Always return the same response.
         * This prevents email enumeration.
         */

        return ResponseEntity.ok(
                "If an account exists with this email, "
                        + "a password reset link has been sent."
        );
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        passwordResetService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return ResponseEntity.ok(
                "Password has been reset successfully."
        );
    }
}