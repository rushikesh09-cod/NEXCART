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
import com.nexcart.backend.repository.OrderItemRepository;
import com.nexcart.backend.repository.OrderRepository;
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


    // =====================================================
    // CREATE ORDER
    // =====================================================

    @Transactional
    public OrderResponse createOrder(
            UUID userId,
            CreateOrderRequest request
    ) {

        // -------------------------------------------------
        // VALIDATE REQUEST
        // -------------------------------------------------

        validateShippingRequest(request);


        // -------------------------------------------------
        // FIND USER
        // -------------------------------------------------

        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "User not found"
                                )
                        );


        // -------------------------------------------------
        // FIND CART
        // -------------------------------------------------

        Cart cart =
                cartRepository
                        .findByUserId(userId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Cart not found"
                                )
                        );


        // -------------------------------------------------
        // CHECK CART
        // -------------------------------------------------

        if (cart.getItems() == null ||
                cart.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "Cart is empty"
            );
        }


        // -------------------------------------------------
        // CURRENT UTC TIME
        // -------------------------------------------------

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);


        // -------------------------------------------------
        // CREATE ORDER
        // -------------------------------------------------

        Order order = new Order();

        order.setUser(user);

        order.setStatus("PENDING");

        order.setShippingFirstName(
                request.getShippingFirstName().trim()
        );

        order.setShippingLastName(
                request.getShippingLastName().trim()
        );

        order.setShippingPhone(
                request.getShippingPhone().trim()
        );

        order.setShippingAddressLine1(
                request.getShippingAddressLine1().trim()
        );

        String addressLine2 =
                request.getShippingAddressLine2();

        order.setShippingAddressLine2(
                addressLine2 == null ||
                        addressLine2.trim().isEmpty()
                        ? null
                        : addressLine2.trim()
        );

        order.setShippingCity(
                request.getShippingCity().trim()
        );

        order.setShippingState(
                request.getShippingState().trim()
        );

        order.setShippingPostalCode(
                request.getShippingPostalCode().trim()
        );

        order.setShippingCountry(
                request.getShippingCountry().trim()
        );

        order.setCreatedAt(now);
        order.setUpdatedAt(now);


        // -------------------------------------------------
        // CALCULATE ORDER TOTAL
        // -------------------------------------------------

        BigDecimal total =
                BigDecimal.ZERO;


        List<OrderItem> orderItems =
                new ArrayList<>();


        // -------------------------------------------------
        // PROCESS CART ITEMS
        // -------------------------------------------------

        for (CartItem cartItem : cart.getItems()) {

            if (cartItem == null) {

                throw new IllegalArgumentException(
                        "Invalid cart item"
                );
            }


            // -------------------------------------------------
            // CART PRODUCT
            // -------------------------------------------------

            Product cartProduct =
                    cartItem.getProduct();


            if (cartProduct == null ||
                    cartProduct.getId() == null) {

                throw new IllegalArgumentException(
                        "Product not found in cart"
                );
            }


            UUID productId =
                    cartProduct.getId();


            // -------------------------------------------------
            // LOAD CURRENT PRODUCT FROM DATABASE
            //
            // Never trust price/stock information from
            // the frontend or stale cart data.
            // -------------------------------------------------

            Product product =
                    productRepository
                            .findById(productId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Product not found: "
                                                    + productId
                                    )
                            );


            // -------------------------------------------------
            // ACTIVE PRODUCT CHECK
            // -------------------------------------------------

            if (!Boolean.TRUE.equals(
                    product.getActive()
            )) {

                throw new IllegalArgumentException(
                        "Product is no longer available: "
                                + product.getName()
                );
            }


            // -------------------------------------------------
            // QUANTITY CHECK
            // -------------------------------------------------

            Integer quantity =
                    cartItem.getQuantity();


            if (quantity == null ||
                    quantity <= 0) {

                throw new IllegalArgumentException(
                        "Invalid cart quantity for product: "
                                + product.getName()
                );
            }


            // -------------------------------------------------
            // PRICE CHECK
            // -------------------------------------------------

            BigDecimal price =
                    product.getPrice();


            if (price == null ||
                    price.compareTo(BigDecimal.ZERO) <= 0) {

                throw new IllegalArgumentException(
                        "Invalid product price: "
                                + product.getName()
                );
            }


            // -------------------------------------------------
            // ATOMIC STOCK DECREASE
            //
            // The database verifies:
            //
            // active = true
            // stock >= quantity
            //
            // and decreases stock atomically.
            // -------------------------------------------------

            int updatedRows =
                    productRepository.decreaseStock(
                            productId,
                            quantity,
                            now
                    );


            if (updatedRows != 1) {

                throw new IllegalArgumentException(
                        "Insufficient stock or product is unavailable: "
                                + product.getName()
                );
            }


            // -------------------------------------------------
            // CALCULATE SUBTOTAL
            //
            // Price comes from the database.
            // -------------------------------------------------

            BigDecimal subtotal =
                    price.multiply(
                            BigDecimal.valueOf(quantity)
                    );


            // -------------------------------------------------
            // CREATE ORDER ITEM
            // -------------------------------------------------

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);

            orderItem.setProduct(product);

            orderItem.setProductName(
                    product.getName()
            );

            orderItem.setBrand(
                    product.getBrand()
            );

            orderItem.setPrice(price);

            orderItem.setQuantity(quantity);

            orderItem.setSubtotal(subtotal);

            orderItem.setCreatedAt(now);


            orderItems.add(orderItem);


            // -------------------------------------------------
            // ADD TO TOTAL
            // -------------------------------------------------

            total =
                    total.add(subtotal);
        }


        // -------------------------------------------------
        // SET ORDER TOTAL
        // -------------------------------------------------

        order.setTotalAmount(total);


        // -------------------------------------------------
        // LINK ORDER ITEMS
        // -------------------------------------------------

        order.getItems()
                .addAll(orderItems);


        // -------------------------------------------------
        // SAVE ORDER
        //
        // Order has CascadeType.ALL for items, so the
        // order items will also be persisted.
        // -------------------------------------------------

        Order savedOrder =
                orderRepository.save(order);


        // -------------------------------------------------
        // SAVE ORDER ITEMS
        //
        // Kept explicitly for compatibility with the
        // current project structure.
        // -------------------------------------------------

        orderItemRepository.saveAll(
                orderItems
        );


        // -------------------------------------------------
        // CLEAR CART
        // -------------------------------------------------

        cart.getItems().clear();

        cart.setUpdatedAt(now);

        cartRepository.save(cart);


        // -------------------------------------------------
        // RETURN RESPONSE
        // -------------------------------------------------

        return toResponse(savedOrder);
    }


    // =====================================================
    // GET ALL USER ORDERS
    // =====================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(
            UUID userId
    ) {

        return orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET SINGLE USER ORDER
    // =====================================================

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


    // =====================================================
    // CANCEL USER ORDER
    // =====================================================

    @Transactional
    public OrderResponse cancelOrder(
            UUID userId,
            UUID orderId
    ) {

        // -------------------------------------------------
        // FIND USER'S ORDER
        // -------------------------------------------------

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


        // -------------------------------------------------
        // ONLY PENDING ORDERS CAN BE CANCELLED
        // -------------------------------------------------

        if (!"PENDING".equalsIgnoreCase(
                order.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "Only pending orders can be cancelled."
            );
        }


        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);


        // -------------------------------------------------
        // RESTORE STOCK
        // -------------------------------------------------

        if (order.getItems() != null) {

            for (OrderItem orderItem :
                    order.getItems()) {

                if (orderItem == null) {
                    continue;
                }


                Product product =
                        orderItem.getProduct();


                if (product == null ||
                        product.getId() == null) {

                    continue;
                }


                Integer quantity =
                        orderItem.getQuantity();


                if (quantity == null ||
                        quantity <= 0) {

                    continue;
                }


                // -------------------------------------------------
                // ATOMIC STOCK RESTORE
                // -------------------------------------------------

                int updatedRows =
                        productRepository.restoreStock(
                                product.getId(),
                                quantity,
                                now
                        );


                if (updatedRows != 1) {

                    throw new IllegalStateException(
                            "Unable to restore stock for product: "
                                    + product.getId()
                    );
                }
            }
        }


        // -------------------------------------------------
        // UPDATE ORDER STATUS
        // -------------------------------------------------

        order.setStatus("CANCELLED");

        order.setUpdatedAt(now);


        Order savedOrder =
                orderRepository.save(order);


        return toResponse(savedOrder);
    }


    // =====================================================
    // GET ALL ORDERS - ADMIN
    // =====================================================

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrdersForAdmin() {

        return orderRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    // =====================================================
    // GET SINGLE ORDER - ADMIN
    // =====================================================

    @Transactional(readOnly = true)
    public OrderResponse getOrderForAdmin(
            UUID orderId
    ) {

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"
                                )
                        );

        return toResponse(order);
    }


    // =====================================================
    // UPDATE ORDER STATUS - ADMIN
    // =====================================================

    @Transactional
    public OrderResponse updateOrderStatus(
            UUID orderId,
            String newStatus
    ) {

        // -------------------------------------------------
        // FIND ORDER
        // -------------------------------------------------

        Order order =
                orderRepository
                        .findById(orderId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Order not found"
                                )
                        );


        // -------------------------------------------------
        // VALIDATE STATUS
        // -------------------------------------------------

        if (newStatus == null ||
                newStatus.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Order status is required"
            );
        }


        String status =
                newStatus
                        .trim()
                        .toUpperCase();


        // -------------------------------------------------
        // ALLOWED STATUSES
        // -------------------------------------------------

        if (
                !status.equals("PENDING") &&
                !status.equals("CONFIRMED") &&
                !status.equals("SHIPPED") &&
                !status.equals("DELIVERED") &&
                !status.equals("CANCELLED")
        ) {

            throw new IllegalArgumentException(
                    "Invalid order status: "
                            + status
            );
        }


        // -------------------------------------------------
        // CANCELLED ORDERS CANNOT BE UPDATED
        // -------------------------------------------------

        if ("CANCELLED".equalsIgnoreCase(
                order.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "Cancelled orders cannot be updated."
            );
        }


        // -------------------------------------------------
        // DELIVERED ORDERS CANNOT BE UPDATED
        // -------------------------------------------------

        if ("DELIVERED".equalsIgnoreCase(
                order.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "Delivered orders cannot be updated."
            );
        }


        // -------------------------------------------------
        // ADMIN CANNOT CHANGE TO CANCELLED
        //
        // Customer cancellation handles stock restore.
        // Keeping cancellation here disabled prevents an
        // admin status change from cancelling without
        // restoring inventory.
        // -------------------------------------------------

        if ("CANCELLED".equals(status)) {

            throw new IllegalArgumentException(
                    "Use the order cancellation flow to cancel an order."
            );
        }


        // -------------------------------------------------
        // UPDATE STATUS
        // -------------------------------------------------

        order.setStatus(status);

        order.setUpdatedAt(
                OffsetDateTime.now(ZoneOffset.UTC)
        );


        Order savedOrder =
                orderRepository.save(order);


        return toResponse(savedOrder);
    }


    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

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


        // -------------------------------------------------
        // ORDER ITEMS
        // -------------------------------------------------

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


    // =====================================================
    // VALIDATE SHIPPING REQUEST
    // =====================================================

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


        // -------------------------------------------------
        // PHONE VALIDATION
        // -------------------------------------------------

        if (!request.getShippingPhone()
                .trim()
                .matches("\\d{10}")) {

            throw new IllegalArgumentException(
                    "Shipping phone must be a valid 10-digit number"
            );
        }


        // -------------------------------------------------
        // POSTAL CODE VALIDATION
        // -------------------------------------------------

        if (!request.getShippingPostalCode()
                .trim()
                .matches("\\d{6}")) {

            throw new IllegalArgumentException(
                    "Shipping postal code must be a valid 6-digit PIN code"
            );
        }
    }


    // =====================================================
    // REQUIRED FIELD VALIDATION
    // =====================================================

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