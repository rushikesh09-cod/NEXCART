package com.nexcart.backend;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();

        String password = "Password@123";

        String hash = encoder.encode(password);

        System.out.println("PASSWORD: " + password);
        System.out.println("BCRYPT HASH: " + hash);
    }
}