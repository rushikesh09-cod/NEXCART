package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    // Get all active products
    List<Product> findByActiveTrue();

    // Search active products by name
    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(
            String name
    );

    // Get active products by category
    List<Product> findByCategoryIgnoreCaseAndActiveTrue(
            String category
    );
}