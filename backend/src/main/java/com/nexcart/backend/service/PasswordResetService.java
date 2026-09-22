package com.nexcart.backend.service;

import com.nexcart.backend.entity.PasswordResetToken;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.PasswordResetTokenRepository;
import com.nexcart.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import java.util.Base64;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    private final SecureRandom secureRandom =
            new SecureRandom();

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    @Transactional
    public void forgotPassword(String email) {

        if (email == null ||
                email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        String normalizedEmail =
                email.trim().toLowerCase();

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElse(null);

        /*
         * Do not reveal whether an email exists.
         */
        if (user == null) {
            return;
        }

        // -------------------------------------------------
        // DELETE OLD TOKENS
        // -------------------------------------------------

        tokenRepository.deleteByUser(user);

        // -------------------------------------------------
        // GENERATE RANDOM TOKEN
        // -------------------------------------------------

        byte[] randomBytes = new byte[32];

        secureRandom.nextBytes(randomBytes);

        String rawToken =
                Base64.getUrlEncoder()
                        .withoutPadding()
                        .encodeToString(randomBytes);

        // -------------------------------------------------
        // HASH TOKEN
        // -------------------------------------------------

        String tokenHash =
                hashToken(rawToken);

        // -------------------------------------------------
        // CREATE RESET TOKEN
        // -------------------------------------------------

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        PasswordResetToken resetToken =
                new PasswordResetToken();

        resetToken.setUser(user);
        resetToken.setTokenHash(tokenHash);
        resetToken.setCreatedAt(now);
        resetToken.setExpiresAt(
                now.plusMinutes(15)
        );
        resetToken.setUsed(false);

        tokenRepository.save(resetToken);

        // -------------------------------------------------
        // CREATE RESET LINK
        // -------------------------------------------------

        String resetLink =
                frontendUrl
                        + "/reset-password?token="
                        + rawToken;

        // -------------------------------------------------
        // SEND EMAIL
        // -------------------------------------------------

        sendResetEmail(
                user,
                resetLink
        );
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @Transactional
    public void resetPassword(
            String rawToken,
            String newPassword
    ) {

        if (rawToken == null ||
                rawToken.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Reset token is required"
            );
        }

        if (newPassword == null ||
                newPassword.length() < 8) {

            throw new IllegalArgumentException(
                    "Password must be at least 8 characters"
            );
        }

        String tokenHash =
                hashToken(
                        rawToken.trim()
                );

        // -------------------------------------------------
        // FIND TOKEN
        // -------------------------------------------------

        PasswordResetToken resetToken =
                tokenRepository
                        .findByTokenHashAndUsedFalse(
                                tokenHash
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid or expired reset token"
                                )
                        );

        // -------------------------------------------------
        // CHECK EXPIRATION
        // -------------------------------------------------

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        if (resetToken.getExpiresAt() == null ||
                resetToken.getExpiresAt().isBefore(now)) {

            throw new IllegalArgumentException(
                    "Invalid or expired reset token"
            );
        }

        // -------------------------------------------------
        // GET USER
        // -------------------------------------------------

        User user =
                resetToken.getUser();

        if (user == null) {

            throw new IllegalArgumentException(
                    "Invalid reset token"
            );
        }

        // -------------------------------------------------
        // UPDATE PASSWORD
        // -------------------------------------------------

        user.setPasswordHash(
                passwordEncoder.encode(
                        newPassword
                )
        );

        user.setUpdatedAt(now);

        userRepository.save(user);

        // -------------------------------------------------
        // DELETE ALL RESET TOKENS
        // -------------------------------------------------

        tokenRepository.deleteByUser(user);
    }

    // =====================================================
    // SEND RESET EMAIL
    // =====================================================

    private void sendResetEmail(
            User user,
            String resetLink
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(
                user.getEmail()
        );

        message.setSubject(
                "NEXCART - Reset Your Password"
        );

        message.setText(
                "Hello "
                        + user.getFirstName()
                        + ",\n\n"

                        + "We received a request to reset "
                        + "your NEXCART password.\n\n"

                        + "Click the link below to reset "
                        + "your password:\n\n"

                        + resetLink
                        + "\n\n"

                        + "This link will expire in "
                        + "15 minutes.\n\n"

                        + "If you did not request a password "
                        + "reset, you can safely ignore this email.\n\n"

                        + "Regards,\n"
                        + "NEXCART Team"
        );

        mailSender.send(message);
    }

    // =====================================================
    // SHA-256
    // =====================================================

    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hash =
                    digest.digest(
                            token.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder hex =
                    new StringBuilder();

            for (byte b : hash) {

                hex.append(
                        String.format(
                                "%02x",
                                b
                        )
                );
            }

            return hex.toString();

        } catch (NoSuchAlgorithmException e) {

            throw new IllegalStateException(
                    "SHA-256 algorithm not available",
                    e
            );
        }
    }
}