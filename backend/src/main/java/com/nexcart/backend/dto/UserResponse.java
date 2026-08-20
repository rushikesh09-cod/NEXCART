package com.nexcart.backend.dto;

import com.nexcart.backend.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private Set<String> roles;

    public static UserResponse fromUser(User user) {

        Set<String> roleNames = user.getRoles()
                .stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhone(),
                user.getStatus(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                roleNames
        );
    }
}