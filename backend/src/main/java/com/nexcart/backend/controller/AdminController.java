package com.nexcart.backend.controller;

import com.nexcart.backend.repository.OrderRepository;
import com.nexcart.backend.repository.ProductRepository;
import com.nexcart.backend.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AdminController(
            ProductRepository productRepository,
            OrderRepository orderRepository,
            UserRepository userRepository
    ) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }


    // =====================================================
    // ADMIN DASHBOARD
    // GET /api/admin/dashboard
    // =====================================================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {

        long totalProducts =
                productRepository.count();

        long activeProducts =
                productRepository
                        .findByActiveTrue()
                        .size();

        long inactiveProducts =
                totalProducts - activeProducts;

        long totalOrders =
                orderRepository.count();

        long pendingOrders =
                orderRepository.getPendingOrderCount();

        long totalUsers =
                userRepository.count();

        BigDecimal totalRevenue =
                orderRepository.getTotalRevenue();


        Map<String, Object> dashboard =
                new HashMap<>();


        // =================================================
        // BASIC COUNTS
        // =================================================

        dashboard.put(
                "totalProducts",
                totalProducts
        );

        dashboard.put(
                "activeProducts",
                activeProducts
        );

        dashboard.put(
                "inactiveProducts",
                inactiveProducts
        );

        dashboard.put(
                "totalOrders",
                totalOrders
        );

        dashboard.put(
                "pendingOrders",
                pendingOrders
        );

        dashboard.put(
                "totalUsers",
                totalUsers
        );


        // =================================================
        // REVENUE
        // =================================================

        dashboard.put(
                "totalRevenue",
                totalRevenue
        );


        return ResponseEntity.ok(
                dashboard
        );
    }
}