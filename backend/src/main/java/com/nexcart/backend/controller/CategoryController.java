package com.nexcart.backend.controller;

import com.nexcart.backend.repository.ProductRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final ProductRepository productRepository;


    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public CategoryController(
            ProductRepository productRepository
    ) {
        this.productRepository = productRepository;
    }


    // =====================================================
    // GET ACTIVE PRODUCT CATEGORIES
    // =====================================================

    @GetMapping
    public ResponseEntity<List<String>> getCategories() {

        List<String> categories =
                productRepository.findDistinctActiveCategories();

        return ResponseEntity.ok(categories);
    }
}