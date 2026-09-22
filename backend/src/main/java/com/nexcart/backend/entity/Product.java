package com.nexcart.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
public class Product {

    // =====================================================
    // ID
    // =====================================================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(
            name = "id",
            nullable = false
    )
    private UUID id;


    // =====================================================
    // NAME
    // =====================================================

    @Column(
            name = "name",
            nullable = false,
            length = 150
    )
    private String name;


    // =====================================================
    // DESCRIPTION
    // =====================================================

    @Column(
            name = "description",
            columnDefinition = "TEXT"
    )
    private String description;


    // =====================================================
    // PRICE
    // =====================================================

    @Column(
            name = "price",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal price;


    // =====================================================
    // STOCK
    // =====================================================

    @Column(
            name = "stock_quantity",
            nullable = false
    )
    private Integer stockQuantity;


    // =====================================================
    // CATEGORY
    // =====================================================

    @Column(
            name = "category",
            nullable = false,
            length = 100
    )
    private String category;


    // =====================================================
    // BRAND
    // =====================================================

    @Column(
            name = "brand",
            length = 100
    )
    private String brand;


    // =====================================================
    // IMAGE
    // =====================================================

    @Column(
            name = "image_url",
            length = 500
    )
    private String imageUrl;


    // =====================================================
    // ACTIVE
    // =====================================================

    @Column(
            name = "active",
            nullable = false
    )
    private Boolean active = true;


    // =====================================================
    // CREATED AT
    // =====================================================

    @Column(
            name = "created_at",
            nullable = false
    )
    private OffsetDateTime createdAt;


    // =====================================================
    // UPDATED AT
    // =====================================================

    @Column(
            name = "updated_at",
            nullable = false
    )
    private OffsetDateTime updatedAt;
}