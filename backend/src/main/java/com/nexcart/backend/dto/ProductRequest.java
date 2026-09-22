package com.nexcart.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class ProductRequest {

    // =====================================================
    // PRODUCT NAME
    // =====================================================

    @NotBlank(message = "Product name is required")
    private String name;


    // =====================================================
    // DESCRIPTION
    // =====================================================

    private String description;


    // =====================================================
    // PRICE
    // =====================================================

    @NotNull(message = "Price is required")
    @DecimalMin(
            value = "0.01",
            message = "Price must be greater than 0"
    )
    private BigDecimal price;


    // =====================================================
    // STOCK
    // =====================================================

    @NotNull(message = "Stock quantity is required")
    @Min(
            value = 0,
            message = "Stock quantity cannot be negative"
    )
    private Integer stockQuantity;


    // =====================================================
    // CATEGORY
    // =====================================================

    @NotBlank(message = "Category is required")
    private String category;


    // =====================================================
    // BRAND
    // =====================================================

    private String brand;


    // =====================================================
    // IMAGE
    // =====================================================

    private String imageUrl;


    // =====================================================
    // ACTIVE
    // =====================================================

    private Boolean active = true;
}