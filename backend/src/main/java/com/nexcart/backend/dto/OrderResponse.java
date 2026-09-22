package com.nexcart.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class OrderResponse {

    private UUID id;

    private UUID userId;

    private String status;

    private BigDecimal totalAmount;

    private String shippingFirstName;

    private String shippingLastName;

    private String shippingPhone;

    private String shippingAddressLine1;

    private String shippingAddressLine2;

    private String shippingCity;

    private String shippingState;

    private String shippingPostalCode;

    private String shippingCountry;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;

    private List<OrderItemResponse> items =
            new ArrayList<>();


    // =====================================================
    // ORDER ITEM RESPONSE
    // =====================================================

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {

        private UUID id;

        private UUID productId;

        private String productName;

        private String brand;

        private BigDecimal price;

        private Integer quantity;

        private BigDecimal subtotal;
    }
}