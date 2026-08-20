package com.nexcart.backend.service;

import com.nexcart.backend.dto.LoginRequest;
import com.nexcart.backend.dto.RegisterRequest;
import com.nexcart.backend.entity.Role;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.RoleRepository;
import com.nexcart.backend.repository.UserRepository;
import com.nexcart.backend.security.JwtService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    public User register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        if (request.getPhone() != null &&
                userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException(
                    "Phone already registered"
            );
        }

        Role customerRole = roleRepository.findAll()
                .stream()
                .filter(role -> "CUSTOMER".equals(role.getName()))
                .findFirst()
                .orElseThrow(() ->
                        new IllegalStateException(
                                "CUSTOMER role not found"
                        )
                );

        User user = new User();

        user.setId(UUID.randomUUID());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());

        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setPhone(request.getPhone());
        user.setStatus("ACTIVE");

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        user.setRoles(Set.of(customerRole));

        return userRepository.save(user);
    }

    // =========================
    // LOGIN
    // =========================

    public LoginResult login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        boolean passwordMatches =
                passwordEncoder.matches(
                        request.getPassword(),
                        user.getPasswordHash()
                );

        if (!passwordMatches) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new IllegalStateException(
                    "User account is not active"
            );
        }

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail()
        );

        return new LoginResult(user, token);
    }

    // =========================
    // LOGIN RESULT
    // =========================

    public record LoginResult(
            User user,
            String token
    ) {
    }
}