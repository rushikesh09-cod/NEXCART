package com.nexcart.backend.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse(

        UUID id,

        UUID productId,

        String productName,

        String brand,

        BigDecimal price,

        String imageUrl,

        Integer quantity

) {
}