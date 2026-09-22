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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    private UUID userId;
    private UUID productId;
    private UUID orderId;

    private User user;
    private Product product;
    private Cart cart;
    private CartItem cartItem;
    private CreateOrderRequest request;

    private final OffsetDateTime now =
            OffsetDateTime.now(ZoneOffset.UTC);


    @BeforeEach
    void setUp() {

        userId = UUID.randomUUID();
        productId = UUID.randomUUID();
        orderId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail("test@nexcart.com");
        user.setStatus("ACTIVE");
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        product = new Product();
        product.setId(productId);
        product.setName("Test Product");
        product.setBrand("Test Brand");
        product.setPrice(new BigDecimal("100.00"));
        product.setStockQuantity(10);
        product.setCategory("Test");
        product.setActive(true);
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        cart = new Cart();
        cart.setId(UUID.randomUUID());
        cart.setUser(user);
        cart.setItems(new ArrayList<>());
        cart.setCreatedAt(now);
        cart.setUpdatedAt(now);

        cartItem = new CartItem();
        cartItem.setId(UUID.randomUUID());
        cartItem.setCart(cart);
        cartItem.setProduct(product);
        cartItem.setQuantity(2);
        cartItem.setCreatedAt(now);
        cartItem.setUpdatedAt(now);

        cart.getItems().add(cartItem);

        request = new CreateOrderRequest();

        request.setShippingFirstName("Test");
        request.setShippingLastName("User");
        request.setShippingPhone("9876543210");
        request.setShippingAddressLine1("123 Test Street");
        request.setShippingAddressLine2("Apartment 1");
        request.setShippingCity("Pune");
        request.setShippingState("Maharashtra");
        request.setShippingPostalCode("411001");
        request.setShippingCountry("India");
    }


    // =====================================================
    // CREATE ORDER - SUCCESS
    // =====================================================

    @Test
    void createOrder_shouldCreateOrderSuccessfully() {

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.of(cart));

        when(productRepository.findById(productId))
                .thenReturn(Optional.of(product));

        when(productRepository.decreaseStock(
                eq(productId),
                eq(2),
                any(OffsetDateTime.class)
        )).thenReturn(1);

        when(orderRepository.save(any(Order.class)))
                .thenAnswer(invocation -> {

                    Order order =
                            invocation.getArgument(0);

                    order.setId(orderId);

                    for (OrderItem item : order.getItems()) {
                        if (item.getId() == null) {
                            item.setId(UUID.randomUUID());
                        }
                    }

                    return order;
                });

        OrderResponse response =
                orderService.createOrder(
                        userId,
                        request
                );

        assertNotNull(response);

        assertEquals(orderId, response.getId());

        assertEquals(
                userId,
                response.getUserId()
        );

        assertEquals(
                "PENDING",
                response.getStatus()
        );

        assertEquals(
                new BigDecimal("200.00"),
                response.getTotalAmount()
        );

        assertEquals(
                1,
                response.getItems().size()
        );

        assertEquals(
                productId,
                response.getItems()
                        .get(0)
                        .getProductId()
        );

        assertEquals(
                2,
                response.getItems()
                        .get(0)
                        .getQuantity()
        );

        verify(productRepository)
                .decreaseStock(
                        eq(productId),
                        eq(2),
                        any(OffsetDateTime.class)
                );

        verify(orderRepository)
                .save(any(Order.class));

        verify(orderItemRepository)
                .saveAll(anyList());

        verify(cartRepository)
                .save(cart);

        assertTrue(cart.getItems().isEmpty());
    }


    // =====================================================
    // CREATE ORDER - USER NOT FOUND
    // =====================================================

    @Test
    void createOrder_shouldFailWhenUserNotFound() {

        when(userRepository.findById(userId))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertEquals(
                "User not found",
                exception.getMessage()
        );

        verify(cartRepository, never())
                .findByUserId(any());

        verify(orderRepository, never())
                .save(any());
    }


    // =====================================================
    // CREATE ORDER - CART NOT FOUND
    // =====================================================

    @Test
    void createOrder_shouldFailWhenCartNotFound() {

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertEquals(
                "Cart not found",
                exception.getMessage()
        );
    }


    // =====================================================
    // CREATE ORDER - EMPTY CART
    // =====================================================

    @Test
    void createOrder_shouldFailWhenCartIsEmpty() {

        cart.getItems().clear();

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.of(cart));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertEquals(
                "Cart is empty",
                exception.getMessage()
        );

        verify(productRepository, never())
                .findById(any());

        verify(orderRepository, never())
                .save(any());
    }


    // =====================================================
    // CREATE ORDER - PRODUCT NOT FOUND
    // =====================================================

    @Test
    void createOrder_shouldFailWhenProductNotFound() {

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.of(cart));

        when(productRepository.findById(productId))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertTrue(
                exception.getMessage()
                        .startsWith("Product not found:")
        );

        verify(productRepository, never())
                .decreaseStock(
                        any(),
                        anyInt(),
                        any()
                );
    }


    // =====================================================
    // CREATE ORDER - INACTIVE PRODUCT
    // =====================================================

    @Test
    void createOrder_shouldFailWhenProductInactive() {

        product.setActive(false);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.of(cart));

        when(productRepository.findById(productId))
                .thenReturn(Optional.of(product));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Product is no longer available")
        );

        verify(productRepository, never())
                .decreaseStock(
                        any(),
                        anyInt(),
                        any()
                );
    }


    // =====================================================
    // CREATE ORDER - INVALID QUANTITY
    // =====================================================

    @Test
    void createOrder_shouldFailWhenQuantityInvalid() {

        cartItem.setQuantity(0);

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.of(cart));

        when(productRepository.findById(productId))
                .thenReturn(Optional.of(product));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Invalid cart quantity")
        );

        verify(productRepository, never())
                .decreaseStock(
                        any(),
                        anyInt(),
                        any()
                );
    }


    // =====================================================
    // CREATE ORDER - INSUFFICIENT STOCK
    // =====================================================

    @Test
    void createOrder_shouldFailWhenStockInsufficient() {

        when(userRepository.findById(userId))
                .thenReturn(Optional.of(user));

        when(cartRepository.findByUserId(userId))
                .thenReturn(Optional.of(cart));

        when(productRepository.findById(productId))
                .thenReturn(Optional.of(product));

        when(productRepository.decreaseStock(
                eq(productId),
                eq(2),
                any(OffsetDateTime.class)
        )).thenReturn(0);

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Insufficient stock")
        );

        verify(orderRepository, never())
                .save(any());
    }


    // =====================================================
    // CREATE ORDER - NULL REQUEST
    // =====================================================

    @Test
    void createOrder_shouldFailWhenRequestIsNull() {

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                null
                        )
                );

        assertEquals(
                "Order request cannot be null",
                exception.getMessage()
        );

        verifyNoInteractions(
                userRepository,
                cartRepository,
                productRepository,
                orderRepository
        );
    }


    // =====================================================
    // CREATE ORDER - INVALID PHONE
    // =====================================================

    @Test
    void createOrder_shouldFailWhenPhoneInvalid() {

        request.setShippingPhone("12345");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertEquals(
                "Shipping phone must be a valid 10-digit number",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
    }


    // =====================================================
    // CREATE ORDER - INVALID PIN
    // =====================================================

    @Test
    void createOrder_shouldFailWhenPostalCodeInvalid() {

        request.setShippingPostalCode("123");

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.createOrder(
                                userId,
                                request
                        )
                );

        assertEquals(
                "Shipping postal code must be a valid 6-digit PIN code",
                exception.getMessage()
        );

        verifyNoInteractions(userRepository);
    }


    // =====================================================
    // GET USER ORDERS
    // =====================================================

    @Test
    void getUserOrders_shouldReturnOrders() {

        Order order =
                createOrder();

        when(orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId))
                .thenReturn(List.of(order));

        List<OrderResponse> responses =
                orderService.getUserOrders(userId);

        assertNotNull(responses);

        assertEquals(
                1,
                responses.size()
        );

        assertEquals(
                orderId,
                responses.get(0).getId()
        );

        assertEquals(
                userId,
                responses.get(0).getUserId()
        );

        verify(orderRepository)
                .findByUserIdOrderByCreatedAtDesc(userId);
    }


    // =====================================================
    // GET SINGLE ORDER
    // =====================================================

    @Test
    void getOrder_shouldReturnOrder() {

        Order order =
                createOrder();

        when(orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId
                ))
                .thenReturn(Optional.of(order));

        OrderResponse response =
                orderService.getOrder(
                        userId,
                        orderId
                );

        assertNotNull(response);

        assertEquals(
                orderId,
                response.getId()
        );

        assertEquals(
                userId,
                response.getUserId()
        );
    }


    // =====================================================
    // GET SINGLE ORDER - NOT FOUND
    // =====================================================

    @Test
    void getOrder_shouldFailWhenOrderNotFound() {

        when(orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId
                ))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.getOrder(
                                userId,
                                orderId
                        )
                );

        assertEquals(
                "Order not found",
                exception.getMessage()
        );
    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    @Test
    void cancelOrder_shouldCancelPendingOrderAndRestoreStock() {

        Order order =
                createOrder();

        OrderItem item =
                createOrderItem(order);

        order.getItems().add(item);

        when(orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId
                ))
                .thenReturn(Optional.of(order));

        when(productRepository.restoreStock(
                eq(productId),
                eq(2),
                any(OffsetDateTime.class)
        )).thenReturn(1);

        when(orderRepository.save(order))
                .thenReturn(order);

        OrderResponse response =
                orderService.cancelOrder(
                        userId,
                        orderId
                );

        assertNotNull(response);

        assertEquals(
                "CANCELLED",
                response.getStatus()
        );

        verify(productRepository)
                .restoreStock(
                        eq(productId),
                        eq(2),
                        any(OffsetDateTime.class)
                );

        verify(orderRepository)
                .save(order);
    }


    // =====================================================
    // CANCEL ORDER - NON PENDING
    // =====================================================

    @Test
    void cancelOrder_shouldFailWhenOrderNotPending() {

        Order order =
                createOrder();

        order.setStatus("CONFIRMED");

        when(orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId
                ))
                .thenReturn(Optional.of(order));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.cancelOrder(
                                userId,
                                orderId
                        )
                );

        assertEquals(
                "Only pending orders can be cancelled.",
                exception.getMessage()
        );

        verify(productRepository, never())
                .restoreStock(
                        any(),
                        anyInt(),
                        any()
                );
    }


    // =====================================================
    // CANCEL ORDER - RESTORE STOCK FAILURE
    // =====================================================

    @Test
    void cancelOrder_shouldFailWhenStockRestoreFails() {

        Order order =
                createOrder();

        OrderItem item =
                createOrderItem(order);

        order.getItems().add(item);

        when(orderRepository
                .findByIdAndUserId(
                        orderId,
                        userId
                ))
                .thenReturn(Optional.of(order));

        when(productRepository.restoreStock(
                eq(productId),
                eq(2),
                any(OffsetDateTime.class)
        )).thenReturn(0);

        IllegalStateException exception =
                assertThrows(
                        IllegalStateException.class,
                        () -> orderService.cancelOrder(
                                userId,
                                orderId
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Unable to restore stock")
        );

        verify(orderRepository, never())
                .save(any());
    }


    // =====================================================
    // ADMIN - GET ALL ORDERS
    // =====================================================

    @Test
    void getAllOrdersForAdmin_shouldReturnAllOrders() {

        Order order =
                createOrder();

        when(orderRepository.findAll())
                .thenReturn(List.of(order));

        List<OrderResponse> responses =
                orderService.getAllOrdersForAdmin();

        assertEquals(
                1,
                responses.size()
        );

        assertEquals(
                orderId,
                responses.get(0).getId()
        );
    }


    // =====================================================
    // ADMIN - GET SINGLE ORDER
    // =====================================================

    @Test
    void getOrderForAdmin_shouldReturnOrder() {

        Order order =
                createOrder();

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.of(order));

        OrderResponse response =
                orderService.getOrderForAdmin(orderId);

        assertNotNull(response);

        assertEquals(
                orderId,
                response.getId()
        );
    }


    // =====================================================
    // ADMIN - ORDER NOT FOUND
    // =====================================================

    @Test
    void getOrderForAdmin_shouldFailWhenOrderNotFound() {

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.getOrderForAdmin(
                                orderId
                        )
                );

        assertEquals(
                "Order not found",
                exception.getMessage()
        );
    }


    // =====================================================
    // ADMIN - UPDATE STATUS
    // =====================================================

    @Test
    void updateOrderStatus_shouldUpdateStatusSuccessfully() {

        Order order =
                createOrder();

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.of(order));

        when(orderRepository.save(order))
                .thenReturn(order);

        OrderResponse response =
                orderService.updateOrderStatus(
                        orderId,
                        "shipped"
                );

        assertNotNull(response);

        assertEquals(
                "SHIPPED",
                response.getStatus()
        );

        verify(orderRepository)
                .save(order);
    }


    // =====================================================
    // ADMIN - INVALID STATUS
    // =====================================================

    @Test
    void updateOrderStatus_shouldFailForInvalidStatus() {

        Order order =
                createOrder();

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.of(order));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.updateOrderStatus(
                                orderId,
                                "INVALID"
                        )
                );

        assertTrue(
                exception.getMessage()
                        .contains("Invalid order status")
        );

        verify(orderRepository, never())
                .save(any());
    }


    // =====================================================
    // ADMIN - CANCELLED ORDER
    // =====================================================

    @Test
    void updateOrderStatus_shouldFailForCancelledOrder() {

        Order order =
                createOrder();

        order.setStatus("CANCELLED");

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.of(order));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.updateOrderStatus(
                                orderId,
                                "SHIPPED"
                        )
                );

        assertEquals(
                "Cancelled orders cannot be updated.",
                exception.getMessage()
        );
    }


    // =====================================================
    // ADMIN - DELIVERED ORDER
    // =====================================================

    @Test
    void updateOrderStatus_shouldFailForDeliveredOrder() {

        Order order =
                createOrder();

        order.setStatus("DELIVERED");

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.of(order));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.updateOrderStatus(
                                orderId,
                                "SHIPPED"
                        )
                );

        assertEquals(
                "Delivered orders cannot be updated.",
                exception.getMessage()
        );
    }


    // =====================================================
    // ADMIN - CANCEL STATUS
    // =====================================================

    @Test
    void updateOrderStatus_shouldNotAllowAdminCancellation() {

        Order order =
                createOrder();

        when(orderRepository.findById(orderId))
                .thenReturn(Optional.of(order));

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> orderService.updateOrderStatus(
                                orderId,
                                "CANCELLED"
                        )
                );

        assertEquals(
                "Use the order cancellation flow to cancel an order.",
                exception.getMessage()
        );

        verify(orderRepository, never())
                .save(any());
    }


    // =====================================================
    // HELPER - CREATE ORDER
    // =====================================================

    private Order createOrder() {

        Order order =
                new Order();

        order.setId(orderId);
        order.setUser(user);
        order.setStatus("PENDING");
        order.setTotalAmount(
                new BigDecimal("200.00")
        );

        order.setShippingFirstName("Test");
        order.setShippingLastName("User");
        order.setShippingPhone("9876543210");
        order.setShippingAddressLine1(
                "123 Test Street"
        );
        order.setShippingCity("Pune");
        order.setShippingState("Maharashtra");
        order.setShippingPostalCode("411001");
        order.setShippingCountry("India");

        order.setCreatedAt(now);
        order.setUpdatedAt(now);

        order.setItems(
                new ArrayList<>()
        );

        return order;
    }


    // =====================================================
    // HELPER - CREATE ORDER ITEM
    // =====================================================

    private OrderItem createOrderItem(
            Order order
    ) {

        OrderItem item =
                new OrderItem();

        item.setId(UUID.randomUUID());
        item.setOrder(order);
        item.setProduct(product);
        item.setProductName(product.getName());
        item.setBrand(product.getBrand());
        item.setPrice(product.getPrice());
        item.setQuantity(2);
        item.setSubtotal(
                new BigDecimal("200.00")
        );
        item.setCreatedAt(now);

        return item;
    }
}