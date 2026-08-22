package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Cart;
import com.nexcart.backend.entity.CartItem;
import com.nexcart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByCartAndProduct(
            Cart cart,
            Product product
    );

    Optional<CartItem> findByCartIdAndProductId(
            UUID cartId,
            UUID productId
    );
}