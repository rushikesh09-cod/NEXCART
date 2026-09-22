package com.nexcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@AllArgsConstructor
public class SalesStatisticsResponse {

    // =====================================================
    // SALES SUMMARY
    // =====================================================

    private BigDecimal totalRevenue;

    private long totalOrders;

    private long totalProductsSold;

    private long totalCustomers;


    // =====================================================
    // ORDER STATUS
    // =====================================================

    private Map<String, Long> orderStatus;
}