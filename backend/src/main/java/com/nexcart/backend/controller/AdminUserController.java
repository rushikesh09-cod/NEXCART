package com.nexcart.backend.controller;

import com.nexcart.backend.dto.AdminUserResponse;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(
            UserRepository userRepository
    ) {
        this.userRepository = userRepository;
    }


    // =====================================================
    // GET ALL USERS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {

        List<AdminUserResponse> users =
                userRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(AdminUserResponse::fromUser)
                        .toList();

        return ResponseEntity.ok(users);
    }


    // =====================================================
    // GET SINGLE USER
    // =====================================================

    @GetMapping("/{userId}")
    public ResponseEntity<AdminUserResponse> getUser(
            @PathVariable UUID userId
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "User not found"
                                )
                        );

        return ResponseEntity.ok(
                AdminUserResponse.fromUser(user)
        );
    }


    // =====================================================
    // UPDATE USER STATUS
    // =====================================================

    @PutMapping("/{userId}/status")
    public ResponseEntity<AdminUserResponse> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam String status
    ) {

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "User not found"
                                )
                        );


        if (status == null ||
                status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "User status is required"
            );
        }


        String newStatus =
                status
                        .trim()
                        .toUpperCase();


        if (
                !newStatus.equals("ACTIVE") &&
                !newStatus.equals("INACTIVE")
        ) {

            throw new IllegalArgumentException(
                    "Invalid user status: " +
                            newStatus
            );
        }


        user.setStatus(newStatus);


        user.setUpdatedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );


        User savedUser =
                userRepository.save(user);


        return ResponseEntity.ok(
                AdminUserResponse.fromUser(savedUser)
        );
    }
}