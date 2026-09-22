package com.nexcart.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {

        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(
                    "JWT secret is missing"
            );
        }

        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 32 bytes long"
            );
        }

        this.secretKey =
                Keys.hmacShaKeyFor(
                        secret.getBytes(StandardCharsets.UTF_8)
                );

        this.expiration = expiration;
    }


    // =====================================================
    // GENERATE TOKEN
    // =====================================================

    public String generateToken(
            UUID userId,
            String email
    ) {

        if (userId == null) {
            throw new IllegalArgumentException(
                    "User ID cannot be null"
            );
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException(
                    "Email cannot be empty"
            );
        }

        Date now = new Date();

        Date expiry =
                new Date(
                        now.getTime() + expiration
                );

        return Jwts.builder()

                .subject(
                        userId.toString()
                )

                .claim(
                        "email",
                        email
                )

                .issuedAt(now)

                .expiration(expiry)

                .signWith(secretKey)

                .compact();
    }


    // =====================================================
    // EXTRACT USER ID
    // =====================================================

    public UUID extractUserId(
            String token
    ) {

        Claims claims =
                extractAllClaims(token);

        String subject =
                claims.getSubject();

        if (subject == null ||
                subject.isBlank()) {

            throw new IllegalArgumentException(
                    "JWT subject is missing"
            );
        }

        return UUID.fromString(subject);
    }


    // =====================================================
    // EXTRACT EMAIL
    // =====================================================

    public String extractEmail(
            String token
    ) {

        Claims claims =
                extractAllClaims(token);

        String email =
                claims.get(
                        "email",
                        String.class
                );

        if (email == null ||
                email.isBlank()) {

            throw new IllegalArgumentException(
                    "JWT email is missing"
            );
        }

        return email;
    }


    // =====================================================
    // VALIDATE TOKEN
    // =====================================================

    public boolean isTokenValid(
            String token
    ) {

        if (token == null ||
                token.isBlank()) {

            return false;
        }

        try {

            extractAllClaims(token);

            return true;

        } catch (Exception e) {

            System.out.println(
                    "JWT VALIDATION ERROR: " +
                    e.getClass().getSimpleName() +
                    " - " +
                    e.getMessage()
            );

            return false;
        }
    }


    // =====================================================
    // PARSE JWT CLAIMS
    // =====================================================

    private Claims extractAllClaims(
            String token
    ) {

        if (token == null ||
                token.isBlank()) {

            throw new IllegalArgumentException(
                    "JWT token is empty"
            );
        }

        return Jwts.parser()

                .verifyWith(secretKey)

                .build()

                .parseSignedClaims(token)

                .getPayload();
    }
}