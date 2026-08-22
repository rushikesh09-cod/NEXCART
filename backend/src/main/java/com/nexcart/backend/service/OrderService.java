package com.nexcart.backend.service;

import com.nexcart.backend.dto.CreateOrderRequest;
import com.nexcart.backend.dto.OrderResponse;
import com.nexcart.backend.entity.Cart;
import com.nexcart.backend.entity.CartItem;
import com.nexcart.backend.entity.Order;
import com.nexcart.backend.entity.OrderItem;
import com.nexcart.backend.entity.Product;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.CartRepository;
import com.nexcart.backend.repository.OrderRepository;
import com.nexcart.backend.repository.OrderItemRepository;
import com.nexcart.backend.repository.ProductRepository;
import com.nexcart.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE ORDER / CHECKOUT
    // =========================================================

    @Transactional
    public OrderResponse createOrder(
            UUID userId,
            CreateOrderRequest request
    ) {

        validateShippingRequest(request);

        User user = userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );

        Cart cart = cartRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Cart not found"
                        )
                );

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Cart is empty"
            );
        }

        // -----------------------------------------------------
        // Create Order
        // -----------------------------------------------------

        Order order = new Order();

        order.setUser(user);
        order.setStatus("PENDING");

        order.setShippingFirstName(
                request.getShippingFirstName()
        );

        order.setShippingLastName(
                request.getShippingLastName()
        );

        order.setShippingPhone(
                request.getShippingPhone()
        );

        order.setShippingAddressLine1(
                request.getShippingAddressLine1()
        );

        order.setShippingAddressLine2(
                request.getShippingAddressLine2()
        );

        order.setShippingCity(
                request.getShippingCity()
        );

        order.setShippingState(
                request.getShippingState()
        );

        order.setShippingPostalCode(
                request.getShippingPostalCode()
        );

        order.setShippingCountry(
                request.getShippingCountry()
        );

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        BigDecimal total =
                BigDecimal.ZERO;

        List<OrderItem> orderItems =
                new ArrayList<>();

        // -----------------------------------------------------
        // Convert Cart Items -> Order Items
        // -----------------------------------------------------

        for (CartItem cartItem : cart.getItems()) {

            Product product =
                    cartItem.getProduct();

            if (product == null) {

                throw new IllegalArgumentException(
                        "Product not found in cart"
                );
            }

            // Reload product from database
            Product currentProduct =
                    productRepository
                            .findById(product.getId())
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Product not found: "
                                                    + product.getId()
                                    )
                            );

            if (!Boolean.TRUE.equals(
                    currentProduct.getActive()
            )) {

                throw new IllegalArgumentException(
                        "Product is inactive: "
                                + currentProduct.getName()
                );
            }

            int quantity =
                    cartItem.getQuantity();

            if (quantity <= 0) {

                throw new IllegalArgumentException(
                        "Invalid cart quantity"
                );
            }

            // -------------------------------------------------
            // Stock validation
            // -------------------------------------------------

            if (currentProduct.getStockQuantity()
                    < quantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + currentProduct.getName()
                );
            }

            // -------------------------------------------------
            // Price snapshot
            // -------------------------------------------------

            BigDecimal price =
                    currentProduct.getPrice();

            BigDecimal subtotal =
                    price.multiply(
                            BigDecimal.valueOf(quantity)
                    );

            // -------------------------------------------------
            // Create Order Item
            // -------------------------------------------------

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);

            orderItem.setProduct(
                    currentProduct
            );

            orderItem.setProductName(
                    currentProduct.getName()
            );

            orderItem.setBrand(
                    currentProduct.getBrand()
            );

            orderItem.setPrice(price);

            orderItem.setQuantity(quantity);

            orderItem.setSubtotal(subtotal);

            orderItem.setCreatedAt(now);

            orderItems.add(orderItem);

            total =
                    total.add(subtotal);

            // -------------------------------------------------
            // Reduce stock
            // -------------------------------------------------

            currentProduct.setStockQuantity(
                    currentProduct.getStockQuantity()
                            - quantity
            );

            productRepository.save(
                    currentProduct
            );
        }

        // -----------------------------------------------------
        // Set order total
        // -----------------------------------------------------

        order.setTotalAmount(total);

        // -----------------------------------------------------
        // Link items to order
        // -----------------------------------------------------

        for (OrderItem orderItem : orderItems) {

            order.getItems().add(orderItem);
        }

        // -----------------------------------------------------
        // Save order
        // -----------------------------------------------------

        Order savedOrder =
                orderRepository.save(order);

        // -----------------------------------------------------
        // Save order items
        // -----------------------------------------------------

        orderItemRepository.saveAll(
                orderItems
        );

        // -----------------------------------------------------
        // Clear cart
        // -----------------------------------------------------

        cart.getItems().clear();

        cart.setUpdatedAt(
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        cartRepository.save(cart);

        // -----------------------------------------------------
        // Return response
        // -----------------------------------------------------

        return toResponse(savedOrder);
    }

    // =========================================================
    // GET USER ORDERS
    // =========================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(
            UUID userId
    ) {

        List<Order> orders =
                orderRepository
                        .findByUserIdOrderByCreatedAtDesc(
                                userId
                        );

        return orders.stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET SINGLE ORDER
    // =========================================================

    @Transactional(readOnly = true)
    public OrderResponse getOrder(
            UUID userId,
            UUID orderId
    ) {

        Order order =
                orderRepository
                        .findByIdAndUserId(
                                orderId,
                                userId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"
                                )
                        );

        return toResponse(order);
    }

    // =========================================================
    // CONVERT ENTITY -> DTO
    // =========================================================

    private OrderResponse toResponse(
            Order order
    ) {

        OrderResponse response =
                new OrderResponse();

        response.setId(
                order.getId()
        );

        response.setUserId(
                order.getUser().getId()
        );

        response.setStatus(
                order.getStatus()
        );

        response.setTotalAmount(
                order.getTotalAmount()
        );

        response.setShippingFirstName(
                order.getShippingFirstName()
        );

        response.setShippingLastName(
                order.getShippingLastName()
        );

        response.setShippingPhone(
                order.getShippingPhone()
        );

        response.setShippingAddressLine1(
                order.getShippingAddressLine1()
        );

        response.setShippingAddressLine2(
                order.getShippingAddressLine2()
        );

        response.setShippingCity(
                order.getShippingCity()
        );

        response.setShippingState(
                order.getShippingState()
        );

        response.setShippingPostalCode(
                order.getShippingPostalCode()
        );

        response.setShippingCountry(
                order.getShippingCountry()
        );

        response.setCreatedAt(
                order.getCreatedAt()
        );

        response.setUpdatedAt(
                order.getUpdatedAt()
        );

        List<OrderResponse.OrderItemResponse>
                itemResponses =
                new ArrayList<>();

        if (order.getItems() != null) {

            for (OrderItem item :
                    order.getItems()) {

                UUID productId = null;

                if (item.getProduct() != null) {

                    productId =
                            item.getProduct().getId();
                }

                OrderResponse.OrderItemResponse
                        itemResponse =
                        new OrderResponse.OrderItemResponse(
                                item.getId(),
                                productId,
                                item.getProductName(),
                                item.getBrand(),
                                item.getPrice(),
                                item.getQuantity(),
                                item.getSubtotal()
                        );

                itemResponses.add(
                        itemResponse
                );
            }
        }

        response.setItems(
                itemResponses
        );

        return response;
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateShippingRequest(
            CreateOrderRequest request
    ) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Order request cannot be null"
            );
        }

        require(
                request.getShippingFirstName(),
                "Shipping first name"
        );

        require(
                request.getShippingLastName(),
                "Shipping last name"
        );

        require(
                request.getShippingPhone(),
                "Shipping phone"
        );

        require(
                request.getShippingAddressLine1(),
                "Shipping address"
        );

        require(
                request.getShippingCity(),
                "Shipping city"
        );

        require(
                request.getShippingState(),
                "Shipping state"
        );

        require(
                request.getShippingPostalCode(),
                "Shipping postal code"
        );

        require(
                request.getShippingCountry(),
                "Shipping country"
        );
    }

    private void require(
            String value,
            String field
    ) {

        if (value == null ||
                value.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    field + " is required"
            );
        }
    }
}