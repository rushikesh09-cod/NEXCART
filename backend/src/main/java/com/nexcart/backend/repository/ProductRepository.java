package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    List<Product> findByActiveTrue();

    List<Product> findByCategoryIgnoreCaseAndActiveTrue(String category);

    List<Product> findByNameContainingIgnoreCaseAndActiveTrue(String name);
}
