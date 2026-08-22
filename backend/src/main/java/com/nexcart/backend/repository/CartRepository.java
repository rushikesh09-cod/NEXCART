package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Cart;
import com.nexcart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartRepository extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByUser(User user);

    Optional<Cart> findByUserId(UUID userId);
}