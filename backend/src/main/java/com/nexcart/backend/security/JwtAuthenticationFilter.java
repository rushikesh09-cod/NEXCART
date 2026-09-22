package com.nexcart.backend.security;

import com.nexcart.backend.entity.Role;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {


    private final JwtService jwtService;
    private final UserRepository userRepository;


    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }


    // =====================================================
    // FILTER
    // =====================================================

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {


        // =================================================
        // GET AUTHORIZATION HEADER
        // =================================================

        String authHeader =
                request.getHeader("Authorization");


        // =================================================
        // NO AUTHORIZATION HEADER
        //
        // Public endpoints such as:
        // POST /api/auth/login
        // POST /api/auth/register
        // POST /api/auth/forgot-password
        // POST /api/auth/reset-password
        //
        // must be allowed to continue without JWT.
        // =================================================

        if (
                authHeader == null ||
                authHeader.isBlank()
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =================================================
        // NOT A BEARER TOKEN
        // =================================================

        if (
                !authHeader
                        .regionMatches(
                                true,
                                0,
                                "Bearer ",
                                0,
                                7
                        )
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =================================================
        // EXTRACT JWT
        // =================================================

        String token =
                authHeader
                        .substring(7)
                        .trim();


        if (token.isEmpty()) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        try {


            // =============================================
            // CHECK JWT
            // =============================================

            if (!jwtService.isTokenValid(token)) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // EXTRACT USER ID
            // =============================================

            UUID userId =
                    jwtService.extractUserId(
                            token
                    );


            if (userId == null) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // EXTRACT EMAIL
            // =============================================

            String email =
                    jwtService.extractEmail(
                            token
                    );


            if (
                    email == null ||
                    email.isBlank()
            ) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // FIND USER
            // =============================================

            User user =
                    userRepository
                            .findById(userId)
                            .orElse(null);


            if (user == null) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // VERIFY EMAIL
            // =============================================

            if (
                    user.getEmail() == null ||
                    !user.getEmail()
                            .equalsIgnoreCase(email)
            ) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // VERIFY USER STATUS
            // =============================================

            if (
                    user.getStatus() == null ||
                    !"ACTIVE".equalsIgnoreCase(
                            user.getStatus()
                    )
            ) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // CHECK USER ROLES
            // =============================================

            if (
                    user.getRoles() == null ||
                    user.getRoles().isEmpty()
            ) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // CONVERT ROLES TO SPRING AUTHORITIES
            // =============================================

            List<SimpleGrantedAuthority> authorities =
                    user.getRoles()
                            .stream()

                            .map(Role::getName)

                            .filter(
                                    role ->
                                            role != null &&
                                            !role.isBlank()
                            )

                            .map(
                                    role -> {

                                        String normalized =
                                                role.trim()
                                                        .toUpperCase();

                                        if (
                                                !normalized
                                                        .startsWith(
                                                                "ROLE_"
                                                        )
                                        ) {

                                            normalized =
                                                    "ROLE_" +
                                                    normalized;
                                        }

                                        return normalized;
                                    }
                            )

                            .distinct()

                            .map(
                                    SimpleGrantedAuthority::new
                            )

                            .collect(
                                    Collectors.toList()
                            );


            // =============================================
            // NO VALID ROLE
            // =============================================

            if (authorities.isEmpty()) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            // =============================================
            // CREATE AUTHENTICATION
            // =============================================

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            null,
                            authorities
                    );


            // =============================================
            // STORE USER ID
            // =============================================

            authentication.setDetails(
                    userId
            );


            // =============================================
            // SET SECURITY CONTEXT
            // =============================================

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authentication
                    );


        } catch (Exception e) {

            // =============================================
            // INVALID TOKEN
            // =============================================

            SecurityContextHolder.clearContext();

            // Do NOT directly return 403/401 here.
            // Let Spring Security decide whether the
            // endpoint requires authentication.
        }


        // =================================================
        // CONTINUE REQUEST
        // =================================================

        filterChain.doFilter(
                request,
                response
        );
    }
}