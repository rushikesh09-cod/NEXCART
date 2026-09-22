package com.nexcart.backend.config;

import com.nexcart.backend.entity.Role;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.RoleRepository;
import com.nexcart.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class AdminDataSeeder {

    @Value("${ADMIN_EMAIL:admin@nexcart.com}")
    private String adminEmail;

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;


    // =====================================================
    // SEED ADMIN
    // =====================================================

    @Bean
    CommandLineRunner seedAdmin(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {

        return args -> {

            // =================================================
            // CHECK ADMIN PASSWORD
            // =================================================

            if (adminPassword == null ||
                    adminPassword.isBlank()) {

                System.out.println(
                        "NEXCART: ADMIN_PASSWORD is not configured."
                );

                System.out.println(
                        "NEXCART: Admin user was not created."
                );

                return;
            }


            // =================================================
            // CREATE CUSTOMER ROLE IF MISSING
            // =================================================

            roleRepository
                    .findAll()
                    .stream()
                    .filter(role ->
                            "CUSTOMER".equalsIgnoreCase(
                                    role.getName()
                            )
                    )
                    .findFirst()
                    .orElseGet(() -> {

                        Role role =
                                new Role();

                        role.setName(
                                "CUSTOMER"
                        );

                        role.setCreatedAt(
                                OffsetDateTime.now(
                                        ZoneOffset.UTC
                                )
                        );

                        return roleRepository.save(
                                role
                        );
                    });


            // =================================================
            // CREATE ADMIN ROLE IF MISSING
            // =================================================

            Role adminRole =
                    roleRepository
                            .findAll()
                            .stream()
                            .filter(role ->
                                    "ADMIN".equalsIgnoreCase(
                                            role.getName()
                                    )
                            )
                            .findFirst()
                            .orElseGet(() -> {

                                Role role =
                                        new Role();

                                role.setName(
                                        "ADMIN"
                                );

                                role.setCreatedAt(
                                        OffsetDateTime.now(
                                                ZoneOffset.UTC
                                        )
                                );

                                return roleRepository.save(
                                        role
                                );
                            });


            // =================================================
            // FIND ADMIN USER
            // =================================================

            User admin =
                    userRepository
                            .findByEmail(
                                    adminEmail
                            )
                            .orElse(null);


            // =================================================
            // CREATE ADMIN USER
            // =================================================

            if (admin == null) {

                OffsetDateTime now =
                        OffsetDateTime.now(
                                ZoneOffset.UTC
                        );


                admin =
                        new User();

                admin.setFirstName(
                        "NEXCART"
                );

                admin.setLastName(
                        "Admin"
                );

                admin.setEmail(
                        adminEmail
                );

                admin.setPasswordHash(
                        passwordEncoder.encode(
                                adminPassword
                        )
                );

                admin.setStatus(
                        "ACTIVE"
                );

                admin.setCreatedAt(
                        now
                );

                admin.setUpdatedAt(
                        now
                );


                // -------------------------------------------------
                // ADMIN ROLE
                // -------------------------------------------------

                Set<Role> roles =
                        new HashSet<>();

                roles.add(
                        adminRole
                );

                admin.setRoles(
                        roles
                );


                userRepository.save(
                        admin
                );


                System.out.println(
                        "===================================="
                );

                System.out.println(
                        "NEXCART: ADMIN USER CREATED"
                );

                System.out.println(
                        "EMAIL: " +
                        adminEmail
                );

                System.out.println(
                        "ROLE: ADMIN"
                );

                System.out.println(
                        "===================================="
                );

            } else {

                // =================================================
                // EXISTING ADMIN USER
                // =================================================

                Set<Role> roles =
                        admin.getRoles();


                if (roles == null) {

                    roles =
                            new HashSet<>();

                    admin.setRoles(
                            roles
                    );
                }


                // -------------------------------------------------
                // CHECK ADMIN ROLE
                // -------------------------------------------------

                boolean hasAdminRole =
                        roles.stream()
                                .anyMatch(role ->
                                        "ADMIN".equalsIgnoreCase(
                                                role.getName()
                                        )
                                );


                // -------------------------------------------------
                // ADD ADMIN ROLE
                // -------------------------------------------------

                if (!hasAdminRole) {

                    roles.add(
                            adminRole
                    );

                    admin.setRoles(
                            roles
                    );

                    admin.setUpdatedAt(
                            OffsetDateTime.now(
                                    ZoneOffset.UTC
                            )
                    );

                    userRepository.save(
                            admin
                    );


                    System.out.println(
                            "NEXCART: ADMIN role added to existing user."
                    );

                } else {

                    System.out.println(
                            "NEXCART: Admin user already exists."
                    );
                }
            }
        };
    }
}