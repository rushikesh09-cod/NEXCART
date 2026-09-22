package com.nexcart.backend.controller;

import com.nexcart.backend.dto.ProductResponse;
import com.nexcart.backend.entity.Product;
import com.nexcart.backend.service.ProductService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // =====================================================
    // GET ALL ACTIVE PRODUCTS
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        List<ProductResponse> products =
                productService
                        .getAllProducts()
                        .stream()
                        .map(ProductResponse::fromProduct)
                        .toList();

        return ResponseEntity.ok(products);
    }

    // =====================================================
    // GET PRODUCT BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable UUID id
    ) {

        Product product =
                productService.getProductById(id);

        return ResponseEntity.ok(
                ProductResponse.fromProduct(product)
        );
    }

    // =====================================================
    // SEARCH PRODUCTS
    // =====================================================

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam String name
    ) {

        List<ProductResponse> products =
                productService
                        .searchProducts(name)
                        .stream()
                        .map(ProductResponse::fromProduct)
                        .toList();

        return ResponseEntity.ok(products);
    }

    // =====================================================
    // PRODUCTS BY CATEGORY
    // =====================================================

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(
            @PathVariable String category
    ) {

        List<ProductResponse> products =
                productService
                        .getProductsByCategory(category)
                        .stream()
                        .map(ProductResponse::fromProduct)
                        .toList();

        return ResponseEntity.ok(products);
    }
}