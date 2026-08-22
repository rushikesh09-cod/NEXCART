package com.nexcart.backend.controller;

import com.nexcart.backend.dto.CartResponse;
import com.nexcart.backend.security.JwtService;
import com.nexcart.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/cart")
public class CartController {

    private final CartService cartService;
    private final JwtService jwtService;

    public CartController(
            CartService cartService,
            JwtService jwtService
    ) {
        this.cartService = cartService;
        this.jwtService = jwtService;
    }


    // =====================================================
    // GET CART
    // =====================================================

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            @RequestHeader("Authorization")
            String authorization
    ) {

        UUID userId =
                extractUserId(authorization);

        return ResponseEntity.ok(
                cartService.getCartResponse(userId)
        );
    }


    // =====================================================
    // ADD PRODUCT
    // =====================================================

    @PostMapping("/items/{productId}")
    public ResponseEntity<CartResponse> addToCart(
            @RequestHeader("Authorization")
            String authorization,

            @PathVariable UUID productId,

            @RequestParam(
                    defaultValue = "1"
            )
            int quantity
    ) {

        UUID userId =
                extractUserId(authorization);

        return ResponseEntity.ok(
                cartService.addToCartResponse(
                        userId,
                        productId,
                        quantity
                )
        );
    }


    // =====================================================
    // UPDATE QUANTITY
    // =====================================================

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @RequestHeader("Authorization")
            String authorization,

            @PathVariable UUID productId,

            @RequestParam int quantity
    ) {

        UUID userId =
                extractUserId(authorization);

        return ResponseEntity.ok(
                cartService.updateCartItemResponse(
                        userId,
                        productId,
                        quantity
                )
        );
    }


    // =====================================================
    // REMOVE PRODUCT
    // =====================================================

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @RequestHeader("Authorization")
            String authorization,

            @PathVariable UUID productId
    ) {

        UUID userId =
                extractUserId(authorization);

        cartService.removeFromCart(
                userId,
                productId
        );

        return ResponseEntity.noContent().build();
    }


    // =====================================================
    // CLEAR CART
    // =====================================================

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader("Authorization")
            String authorization
    ) {

        UUID userId =
                extractUserId(authorization);

        cartService.clearCart(userId);

        return ResponseEntity.noContent().build();
    }


    // =====================================================
    // EXTRACT USER ID FROM JWT
    // =====================================================

    private UUID extractUserId(
            String authorization
    ) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            throw new IllegalArgumentException(
                    "Invalid Authorization header"
            );
        }

        String token =
                authorization.substring(7);

        return jwtService.extractUserId(token);
    }
}