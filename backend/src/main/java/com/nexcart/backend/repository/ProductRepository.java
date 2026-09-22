package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface ProductRepository
        extends JpaRepository<Product, UUID> {

    // =====================================================
    // ACTIVE PRODUCTS
    // =====================================================

    List<Product> findByActiveTrue();


    // =====================================================
    // SEARCH BY NAME
    // =====================================================

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(
            String name
    );


    // =====================================================
    // PRODUCTS BY CATEGORY
    // =====================================================

    List<Product> findByCategoryIgnoreCaseAndActiveTrue(
            String category
    );


    // =====================================================
    // SEARCH NAME / DESCRIPTION / BRAND
    // =====================================================

    @Query("""
        SELECT p
        FROM Product p
        WHERE p.active = true
        AND (
            LOWER(p.name)
                LIKE LOWER(CONCAT('%', :keyword, '%'))

            OR LOWER(p.description)
                LIKE LOWER(CONCAT('%', :keyword, '%'))

            OR LOWER(p.brand)
                LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        """)
    List<Product> searchProducts(
            @Param("keyword") String keyword
    );


    // =====================================================
    // ACTIVE CATEGORIES
    // =====================================================

    @Query("""
        SELECT DISTINCT p.category
        FROM Product p
        WHERE p.active = true
        AND p.category IS NOT NULL
        ORDER BY p.category
        """)
    List<String> findDistinctActiveCategories();


    // =====================================================
    // ATOMIC STOCK DECREASE
    //
    // The database checks the stock and decreases it
    // in one operation.
    //
    // Returns:
    // 1 = stock successfully decreased
    // 0 = insufficient stock / inactive / missing
    // =====================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
        UPDATE Product p
        SET
            p.stockQuantity = p.stockQuantity - :quantity,
            p.updatedAt = :updatedAt
        WHERE p.id = :productId
          AND p.active = true
          AND p.stockQuantity >= :quantity
        """)
    int decreaseStock(
            @Param("productId") UUID productId,
            @Param("quantity") int quantity,
            @Param("updatedAt") OffsetDateTime updatedAt
    );


    // =====================================================
    // ATOMIC STOCK RESTORE
    //
    // Used when a pending order is cancelled.
    // =====================================================

    @Modifying(
            clearAutomatically = true,
            flushAutomatically = true
    )
    @Query("""
        UPDATE Product p
        SET
            p.stockQuantity = p.stockQuantity + :quantity,
            p.updatedAt = :updatedAt
        WHERE p.id = :productId
        """)
    int restoreStock(
            @Param("productId") UUID productId,
            @Param("quantity") int quantity,
            @Param("updatedAt") OffsetDateTime updatedAt
    );
}