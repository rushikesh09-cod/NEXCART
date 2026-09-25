package com.nexcart.backend.config;

import com.nexcart.backend.security.JwtAuthenticationFilter;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }


    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =================================================
                // CORS
                // =================================================

                .cors(cors -> cors
                        .configurationSource(
                                corsConfigurationSource()
                        )
                )


                // =================================================
                // CSRF
                // =================================================

                .csrf(AbstractHttpConfigurer::disable)


                // =================================================
                // SESSION MANAGEMENT
                // =================================================

                .sessionManagement(session -> session
                        .sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =================================================
                // AUTHORIZATION
                // =================================================

                .authorizeHttpRequests(auth -> auth


                        // -----------------------------------------
                        // PUBLIC AUTH ENDPOINTS
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/login",
                                "/api/auth/register",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()


                        // -----------------------------------------
                        // PUBLIC PRODUCTS
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/products",
                                "/api/products/**"
                        ).permitAll()


                        // -----------------------------------------
                        // PUBLIC CATEGORIES
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categories",
                                "/api/categories/**"
                        ).permitAll()


                        // -----------------------------------------
                        // AI CHATBOT
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/chat"
                        ).permitAll()


                        // -----------------------------------------
                        // ADMIN ENDPOINTS
                        // -----------------------------------------

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")


                        // -----------------------------------------
                        // CUSTOMER ORDERS
                        // -----------------------------------------

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/users/me/orders"
                        ).authenticated()


                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/me/orders",
                                "/api/users/me/orders/**"
                        ).authenticated()


                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/users/me/orders/*/cancel"
                        ).authenticated()


                        // -----------------------------------------
                        // EVERYTHING ELSE
                        // -----------------------------------------

                        .anyRequest().authenticated()

                )


                // =================================================
                // DISABLE FORM LOGIN
                // =================================================

                .formLogin(AbstractHttpConfigurer::disable)


                // =================================================
                // DISABLE BASIC AUTHENTICATION
                // =================================================

                .httpBasic(AbstractHttpConfigurer::disable)


                // =================================================
                // JWT AUTHENTICATION FILTER
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }


    // =====================================================
    // CORS CONFIGURATION
    // =====================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        // -----------------------------------------
        // ALLOWED FRONTEND ORIGINS
        // -----------------------------------------

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:3000"
                )
        );


        // -----------------------------------------
        // ALLOWED HTTP METHODS
        // -----------------------------------------

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        // -----------------------------------------
        // ALLOWED HEADERS
        // -----------------------------------------

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type",
                        "Accept"
                )
        );


        // -----------------------------------------
        // CREDENTIALS
        // -----------------------------------------

        configuration.setAllowCredentials(true);


        // -----------------------------------------
        // REGISTER CORS CONFIGURATION
        // -----------------------------------------

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}