package com.nexcart.backend.service;

import com.nexcart.backend.dto.CartItemResponse;
import com.nexcart.backend.dto.CartResponse;
import com.nexcart.backend.entity.Cart;
import com.nexcart.backend.entity.CartItem;
import com.nexcart.backend.entity.Product;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.CartItemRepository;
import com.nexcart.backend.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final ProductService productService;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserService userService,
            ProductService productService
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userService = userService;
        this.productService = productService;
    }

    // =====================================================
    // GET OR CREATE CART
    // =====================================================

    @Transactional
    public Cart getOrCreateCart(UUID userId) {

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userService
                            .getUserById(userId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "User not found"
                                    )
                            );

                    Cart cart = new Cart();

                    cart.setUser(user);

                    OffsetDateTime now =
                            OffsetDateTime.now(ZoneOffset.UTC);

                    cart.setCreatedAt(now);
                    cart.setUpdatedAt(now);

                    return cartRepository.save(cart);
                });
    }


    // =====================================================
    // GET CART
    // =====================================================

    @Transactional(readOnly = true)
    public Cart getCart(UUID userId) {

        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {

                    User user = userService
                            .getUserById(userId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "User not found"
                                    )
                            );

                    Cart cart = new Cart();

                    cart.setUser(user);

                    OffsetDateTime now =
                            OffsetDateTime.now(ZoneOffset.UTC);

                    cart.setCreatedAt(now);
                    cart.setUpdatedAt(now);

                    return cartRepository.save(cart);
                });
    }


    // =====================================================
    // GET CART AS DTO
    // =====================================================

    @Transactional(readOnly = true)
    public CartResponse getCartResponse(UUID userId) {

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseGet(() -> {

                    User user = userService
                            .getUserById(userId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "User not found"
                                    )
                            );

                    Cart newCart = new Cart();

                    newCart.setUser(user);

                    OffsetDateTime now =
                            OffsetDateTime.now(ZoneOffset.UTC);

                    newCart.setCreatedAt(now);
                    newCart.setUpdatedAt(now);

                    return cartRepository.save(newCart);
                });

        List<CartItemResponse> items =
                cart.getItems()
                        .stream()
                        .map(item -> {

                            Product product =
                                    item.getProduct();

                            return new CartItemResponse(

                                    item.getId(),

                                    product.getId(),

                                    product.getName(),

                                    product.getBrand(),

                                    product.getPrice(),

                                    product.getImageUrl(),

                                    item.getQuantity()
                            );
                        })
                        .collect(Collectors.toList());

        return new CartResponse(

                cart.getId(),

                cart.getUser().getId(),

                cart.getCreatedAt(),

                cart.getUpdatedAt(),

                items
        );
    }


    // =====================================================
    // ADD PRODUCT TO CART
    // =====================================================

    @Transactional
    public Cart addToCart(
            UUID userId,
            UUID productId,
            int quantity
    ) {

        if (quantity <= 0) {

            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        Cart cart =
                getOrCreateCart(userId);

        Product product =
                productService.getProductById(productId);

        if (!Boolean.TRUE.equals(product.getActive())) {

            throw new IllegalArgumentException(
                    "Product is inactive"
            );
        }

        if (product.getStockQuantity() < quantity) {

            throw new IllegalArgumentException(
                    "Insufficient stock"
            );
        }

        CartItem item =
                cartItemRepository
                        .findByCartAndProduct(
                                cart,
                                product
                        )
                        .orElse(null);


        // =================================================
        // NEW CART ITEM
        // =================================================

        if (item == null) {

            item = new CartItem();

            item.setCart(cart);

            item.setProduct(product);

            item.setQuantity(quantity);

            OffsetDateTime now =
                    OffsetDateTime.now(ZoneOffset.UTC);

            item.setCreatedAt(now);

            item.setUpdatedAt(now);

            cart.getItems().add(item);

        }

        // =================================================
        // EXISTING CART ITEM
        // =================================================

        else {

            int newQuantity =
                    item.getQuantity() + quantity;

            if (newQuantity >
                    product.getStockQuantity()) {

                throw new IllegalArgumentException(
                        "Insufficient stock"
                );
            }

            item.setQuantity(newQuantity);

            item.setUpdatedAt(
                    OffsetDateTime.now(
                            ZoneOffset.UTC
                    )
            );
        }


        cart.setUpdatedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );

        cartItemRepository.save(item);

        cartRepository.save(cart);

        return cart;
    }


    // =====================================================
    // ADD PRODUCT AND RETURN DTO
    // =====================================================

    @Transactional
    public CartResponse addToCartResponse(
            UUID userId,
            UUID productId,
            int quantity
    ) {

        addToCart(
                userId,
                productId,
                quantity
        );

        return getCartResponse(userId);
    }


    // =====================================================
    // UPDATE CART ITEM
    // =====================================================

    @Transactional
    public Cart updateCartItem(
            UUID userId,
            UUID productId,
            int quantity
    ) {

        if (quantity <= 0) {

            throw new IllegalArgumentException(
                    "Quantity must be greater than zero"
            );
        }

        Cart cart =
                getOrCreateCart(userId);

        Product product =
                productService.getProductById(productId);

        if (!Boolean.TRUE.equals(product.getActive())) {

            throw new IllegalArgumentException(
                    "Product is inactive"
            );
        }

        if (quantity >
                product.getStockQuantity()) {

            throw new IllegalArgumentException(
                    "Insufficient stock"
            );
        }

        CartItem item =
                cartItemRepository
                        .findByCartAndProduct(
                                cart,
                                product
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Product is not in cart"
                                )
                        );

        item.setQuantity(quantity);

        item.setUpdatedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );

        cart.setUpdatedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );

        cartItemRepository.save(item);

        cartRepository.save(cart);

        return cart;
    }


    // =====================================================
    // UPDATE CART ITEM AND RETURN DTO
    // =====================================================

    @Transactional
    public CartResponse updateCartItemResponse(
            UUID userId,
            UUID productId,
            int quantity
    ) {

        updateCartItem(
                userId,
                productId,
                quantity
        );

        return getCartResponse(userId);
    }


    // =====================================================
    // REMOVE PRODUCT
    // =====================================================

    @Transactional
    public void removeFromCart(
            UUID userId,
            UUID productId
    ) {

        Cart cart =
                getOrCreateCart(userId);

        CartItem item =
                cartItemRepository
                        .findByCartIdAndProductId(
                                cart.getId(),
                                productId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Product is not in cart"
                                )
                        );

        cart.getItems().remove(item);

        cartItemRepository.delete(item);

        cart.setUpdatedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );

        cartRepository.save(cart);
    }


    // =====================================================
    // CLEAR CART
    // =====================================================

    @Transactional
    public void clearCart(UUID userId) {

        Cart cart =
                getOrCreateCart(userId);

        cart.getItems().clear();

        cart.setUpdatedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );

        cartRepository.save(cart);
    }
}