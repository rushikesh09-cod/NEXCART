package com.nexcart.backend.service;

import com.nexcart.backend.dto.ProductRequest;
import com.nexcart.backend.entity.Product;
import com.nexcart.backend.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // =========================
    // CREATE PRODUCT
    // =========================

    @Transactional
    public Product createProduct(ProductRequest request) {

        Product product = new Product();

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());

        product.setActive(
                request.getActive() == null
                        ? true
                        : request.getActive()
        );

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        return productRepository.save(product);
    }

    // =========================
    // GET ALL ACTIVE PRODUCTS
    // =========================

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {

        return productRepository.findByActiveTrue();
    }

    // =========================
    // GET PRODUCT BY ID
    // =========================

    @Transactional(readOnly = true)
    public Product getProductById(UUID id) {

        return productRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product not found"
                        )
                );
    }

    // =========================
    // SEARCH PRODUCTS
    // =========================

    @Transactional(readOnly = true)
    public List<Product> searchProducts(String name) {

        return productRepository
                .findByNameContainingIgnoreCaseAndActiveTrue(name);
    }

    // =========================
    // PRODUCTS BY CATEGORY
    // =========================

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(
            String category
    ) {

        return productRepository
                .findByCategoryIgnoreCaseAndActiveTrue(category);
    }

    // =========================
    // UPDATE PRODUCT
    // =========================

    @Transactional
    public Product updateProduct(
            UUID id,
            ProductRequest request
    ) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product not found"
                        )
                );

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        product.setBrand(request.getBrand());
        product.setImageUrl(request.getImageUrl());

        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        product.setUpdatedAt(
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        return productRepository.save(product);
    }

    // =========================
    // DELETE PRODUCT
    // =========================

    @Transactional
    public void deleteProduct(UUID id) {

        Product product = productRepository
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Product not found"
                        )
                );

        productRepository.delete(product);
    }
}
