package com.nexcart.backend.controller;

import com.nexcart.backend.dto.ProductRequest;
import com.nexcart.backend.dto.ProductResponse;
import com.nexcart.backend.entity.Product;
import com.nexcart.backend.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    public AdminProductController(
            ProductService productService
    ) {
        this.productService = productService;
    }


    // =====================================================
    // GET ALL PRODUCTS
    // ACTIVE + INACTIVE
    // =====================================================

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {

        List<ProductResponse> products =
                productService
                        .getAllProductsForAdmin()
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
    // CREATE PRODUCT
    // =====================================================

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @RequestBody ProductRequest request
    ) {

        Product product =
                productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        ProductResponse.fromProduct(product)
                );
    }


    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductRequest request
    ) {

        Product product =
                productService.updateProduct(
                        id,
                        request
                );

        return ResponseEntity.ok(
                ProductResponse.fromProduct(product)
        );
    }


    // =====================================================
    // ACTIVATE / DEACTIVATE
    // =====================================================

    @PutMapping("/{id}/active")
    public ResponseEntity<ProductResponse> setProductActive(
            @PathVariable UUID id,
            @RequestParam boolean active
    ) {

        Product product =
                productService.setProductActive(
                        id,
                        active
                );

        return ResponseEntity.ok(
                ProductResponse.fromProduct(product)
        );
    }


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable UUID id
    ) {

        productService.deleteProduct(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}