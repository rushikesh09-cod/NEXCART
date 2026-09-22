package com.nexcart.backend.controller;

import com.nexcart.backend.dto.OrderResponse;
import com.nexcart.backend.service.OrderService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(
            OrderService orderService
    ) {
        this.orderService = orderService;
    }


    // =====================================================
    // GET ALL ORDERS
    // ADMIN
    // =====================================================

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<OrderResponse> orders =
                orderService.getAllOrdersForAdmin();

        return ResponseEntity.ok(orders);
    }


    // =====================================================
    // GET SINGLE ORDER
    // ADMIN
    // =====================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable UUID orderId
    ) {

        OrderResponse response =
                orderService.getOrderForAdmin(
                        orderId
                );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // UPDATE ORDER STATUS
    // ADMIN
    // =====================================================

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable UUID orderId,
            @RequestParam String status
    ) {

        OrderResponse response =
                orderService.updateOrderStatus(
                        orderId,
                        status
                );

        return ResponseEntity.ok(response);
    }
}