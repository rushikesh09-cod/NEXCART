package com.nexcart.backend.dto;

import com.nexcart.backend.entity.Role;
import com.nexcart.backend.entity.User;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class AdminUserResponse {

    // =====================================================
    // USER ID
    // =====================================================

    private UUID id;


    // =====================================================
    // USER DETAILS
    // =====================================================

    private String firstName;

    private String lastName;

    private String email;

    private String phone;


    // =====================================================
    // ROLES
    // =====================================================

    private List<String> roles;


    // =====================================================
    // STATUS
    // =====================================================

    private String status;


    // =====================================================
    // TIMESTAMPS
    // =====================================================

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;


    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    public static AdminUserResponse fromUser(
            User user
    ) {

        List<String> roles =
                user.getRoles() == null
                        ? List.of()
                        : user.getRoles()
                                .stream()
                                .map(Role::getName)
                                .toList();


        return new AdminUserResponse(

                user.getId(),

                user.getFirstName(),

                user.getLastName(),

                user.getEmail(),

                user.getPhone(),

                roles,

                user.getStatus(),

                user.getCreatedAt(),

                user.getUpdatedAt()
        );
    }
}