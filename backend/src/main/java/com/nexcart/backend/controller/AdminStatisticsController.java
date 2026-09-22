package com.nexcart.backend.controller;

import com.nexcart.backend.dto.SalesStatisticsResponse;
import com.nexcart.backend.repository.OrderRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/statistics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatisticsController {

    private final OrderRepository orderRepository;

    public AdminStatisticsController(
            OrderRepository orderRepository
    ) {
        this.orderRepository = orderRepository;
    }


    // =====================================================
    // SALES STATISTICS
    // =====================================================

    @GetMapping
    public ResponseEntity<SalesStatisticsResponse> getStatistics() {

        BigDecimal totalRevenue =
                orderRepository.getTotalRevenue();

        long totalOrders =
                orderRepository.getValidOrderCount();

        long totalProductsSold =
                orderRepository.getTotalProductsSold();

        long totalCustomers =
                orderRepository.getUniqueCustomers();


        // =================================================
        // ORDER STATUS
        // =================================================

        Map<String, Long> orderStatus =
                new LinkedHashMap<>();

        List<Object[]> statusResults =
                orderRepository.getOrderStatusStatistics();

        for (Object[] row : statusResults) {

            String status =
                    String.valueOf(row[0]);

            Long count =
                    ((Number) row[1]).longValue();

            orderStatus.put(
                    status,
                    count
            );
        }


        // =================================================
        // RESPONSE
        // =================================================

        SalesStatisticsResponse response =
                new SalesStatisticsResponse(
                        totalRevenue,
                        totalOrders,
                        totalProductsSold,
                        totalCustomers,
                        orderStatus
                );

        return ResponseEntity.ok(response);
    }
}