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

    // =====================================================
    // REGISTER
    // =====================================================

    public User register(RegisterRequest request) {

        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        if (request == null) {
            throw new IllegalArgumentException(
                    "Registration request cannot be null"
            );
        }

        if (request.getFirstName() == null ||
                request.getFirstName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "First name is required"
            );
        }

        if (request.getLastName() == null ||
                request.getLastName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Last name is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isEmpty()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        // -------------------------------------------------
        // CLEAN VALUES
        // -------------------------------------------------

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        String firstName =
                request.getFirstName()
                        .trim();

        String lastName =
                request.getLastName()
                        .trim();

        // -------------------------------------------------
        // CHECK EMAIL
        // -------------------------------------------------

        if (userRepository.existsByEmail(email)) {

            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        // -------------------------------------------------
        // CHECK PHONE
        // -------------------------------------------------

        String phone = null;

        if (request.getPhone() != null &&
                !request.getPhone().trim().isEmpty()) {

            phone =
                    request.getPhone()
                            .trim();

            if (userRepository.existsByPhone(phone)) {

                throw new IllegalArgumentException(
                        "Phone already registered"
                );
            }
        }

        // -------------------------------------------------
        // FIND CUSTOMER ROLE
        // -------------------------------------------------

        Role customerRole =
                roleRepository
                        .findByNameIgnoreCase("CUSTOMER")
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "CUSTOMER role not found"
                                )
                        );

        // -------------------------------------------------
        // CREATE USER
        // -------------------------------------------------

        User user = new User();

        // DO NOT SET ID MANUALLY.
        // Hibernate generates UUID because User has:
        //
        // @GeneratedValue(strategy = GenerationType.UUID)

        user.setFirstName(firstName);

        user.setLastName(lastName);

        user.setEmail(email);

        // -------------------------------------------------
        // HASH PASSWORD
        // -------------------------------------------------

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        // -------------------------------------------------
        // PHONE
        // -------------------------------------------------

        user.setPhone(phone);

        // -------------------------------------------------
        // ACCOUNT STATUS
        // -------------------------------------------------

        user.setStatus("ACTIVE");

        // -------------------------------------------------
        // TIMESTAMPS
        // -------------------------------------------------

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        user.setCreatedAt(now);

        user.setUpdatedAt(now);

        // -------------------------------------------------
        // CUSTOMER ROLE
        // -------------------------------------------------

        user.setRoles(
                Set.of(customerRole)
        );

        // -------------------------------------------------
        // SAVE USER
        // -------------------------------------------------

        return userRepository.save(user);
    }

    // =====================================================
    // LOGIN
    // =====================================================

    public LoginResult login(LoginRequest request) {

        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        if (request == null) {

            throw new IllegalArgumentException(
                    "Login request cannot be null"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isEmpty()) {

            throw new IllegalArgumentException(
                    "Password is required"
            );
        }

        // -------------------------------------------------
        // CLEAN EMAIL
        // -------------------------------------------------

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid email or password"
                                )
                        );

        // -------------------------------------------------
        // CHECK PASSWORD
        // -------------------------------------------------

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

        // -------------------------------------------------
        // CHECK ACCOUNT STATUS
        // -------------------------------------------------

        if (!"ACTIVE".equalsIgnoreCase(
                user.getStatus()
        )) {

            throw new IllegalStateException(
                    "User account is not active"
            );
        }

        // -------------------------------------------------
        // CHECK ROLES
        // -------------------------------------------------

        if (user.getRoles() == null ||
                user.getRoles().isEmpty()) {

            throw new IllegalStateException(
                    "User has no assigned role"
            );
        }

        // -------------------------------------------------
        // GENERATE JWT
        // -------------------------------------------------

        String token =
                jwtService.generateToken(
                        user.getId(),
                        user.getEmail()
                );

        // -------------------------------------------------
        // RETURN LOGIN RESULT
        // -------------------------------------------------

        return new LoginResult(
                user,
                token
        );
    }

    // =====================================================
    // LOGIN RESULT
    // =====================================================

    public record LoginResult(
            User user,
            String token
    ) {
    }
}