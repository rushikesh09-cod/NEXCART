package com.nexcart.backend.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record CartResponse(

        UUID id,

        UUID userId,

        OffsetDateTime createdAt,

        OffsetDateTime updatedAt,

        List<CartItemResponse> items

) {
}