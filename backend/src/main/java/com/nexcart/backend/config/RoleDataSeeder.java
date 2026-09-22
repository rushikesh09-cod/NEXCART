package com.nexcart.backend.config;

import com.nexcart.backend.entity.Role;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.RoleRepository;
import com.nexcart.backend.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class RoleDataSeeder {

    @Bean
    CommandLineRunner seedRoles(
            RoleRepository roleRepository,
            UserRepository userRepository
    ) {

        return args -> {

            OffsetDateTime now =
                    OffsetDateTime.now(
                            ZoneOffset.UTC
                    );

            // =====================================================
            // CREATE CUSTOMER ROLE
            // =====================================================

            Role customerRole =
                    roleRepository
                            .findByNameIgnoreCase("CUSTOMER")
                            .orElseGet(() -> {

                                Role role =
                                        new Role();

                                role.setName(
                                        "CUSTOMER"
                                );

                                role.setCreatedAt(
                                        now
                                );

                                return roleRepository.save(
                                        role
                                );
                            });


            // =====================================================
            // CREATE ADMIN ROLE
            // =====================================================

            Role adminRole =
                    roleRepository
                            .findByNameIgnoreCase("ADMIN")
                            .orElseGet(() -> {

                                Role role =
                                        new Role();

                                role.setName(
                                        "ADMIN"
                                );

                                role.setCreatedAt(
                                        now
                                );

                                return roleRepository.save(
                                        role
                                );
                            });


            System.out.println(
                    "NEXCART: Roles ready."
            );


            // =====================================================
            // ADMIN ACCOUNT
            // =====================================================
            //
            // CHANGE THIS EMAIL to the email of
            // your existing account.
            //
            // Example:
            // admin@gmail.com
            //
            // =====================================================

            String adminEmail =
                    "admin@nexcart.com";


            userRepository
                    .findByEmail(adminEmail)
                    .ifPresent(user -> {

                        Set<Role> roles =
                                new HashSet<>();

                        roles.add(adminRole);

                        user.setRoles(roles);

                        user.setUpdatedAt(
                                OffsetDateTime.now(
                                        ZoneOffset.UTC
                                )
                        );

                        userRepository.save(user);

                        System.out.println(
                                "NEXCART: ADMIN role assigned to "
                                        + adminEmail
                        );
                    });


            // =====================================================
            // FINISHED
            // =====================================================

            System.out.println(
                    "NEXCART: Role seeding completed."
            );
        };
    }
}