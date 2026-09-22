package com.nexcart.backend.controller;

import com.nexcart.backend.dto.CreateOrderRequest;
import com.nexcart.backend.dto.OrderResponse;
import com.nexcart.backend.security.JwtService;
import com.nexcart.backend.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users/me/orders")
public class OrderController {

    private final OrderService orderService;
    private final JwtService jwtService;

    public OrderController(
            OrderService orderService,
            JwtService jwtService
    ) {
        this.orderService = orderService;
        this.jwtService = jwtService;
    }


    // =====================================================
    // CREATE ORDER
    // =====================================================

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestHeader("Authorization") String authorization,
            @RequestBody CreateOrderRequest request
    ) {

        UUID userId =
                extractUserId(authorization);

        OrderResponse response =
                orderService.createOrder(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // =====================================================
    // GET ALL USER ORDERS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @RequestHeader("Authorization") String authorization
    ) {

        UUID userId =
                extractUserId(authorization);

        List<OrderResponse> orders =
                orderService.getUserOrders(userId);

        return ResponseEntity.ok(orders);
    }


    // =====================================================
    // GET SINGLE ORDER
    // =====================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @RequestHeader("Authorization") String authorization,
            @PathVariable UUID orderId
    ) {

        UUID userId =
                extractUserId(authorization);

        OrderResponse response =
                orderService.getOrder(
                        userId,
                        orderId
                );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @RequestHeader("Authorization") String authorization,
            @PathVariable UUID orderId
    ) {

        UUID userId =
                extractUserId(authorization);

        OrderResponse response =
                orderService.cancelOrder(
                        userId,
                        orderId
                );

        return ResponseEntity.ok(response);
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
                authorization
                        .substring(7)
                        .trim();


        if (token.isEmpty()) {

            throw new IllegalArgumentException(
                    "JWT token is missing"
            );
        }


        return jwtService.extractUserId(token);
    }
}