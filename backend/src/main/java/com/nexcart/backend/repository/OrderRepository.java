package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    // =====================================================
    // USER ORDERS
    // =====================================================

    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Order> findByIdAndUserId(UUID orderId, UUID userId);


    // =====================================================
    // TOTAL REVENUE
    // Excludes cancelled orders
    // =====================================================

    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE UPPER(o.status) <> 'CANCELLED'
    """)
    BigDecimal getTotalRevenue();


    // =====================================================
    // VALID ORDERS
    // Excludes cancelled orders
    // =====================================================

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE UPPER(o.status) <> 'CANCELLED'
    """)
    long getValidOrderCount();


    // =====================================================
    // TOTAL PRODUCTS SOLD
    // Excludes cancelled orders
    // =====================================================

    @Query("""
        SELECT COALESCE(SUM(i.quantity), 0)
        FROM Order o
        JOIN o.items i
        WHERE UPPER(o.status) <> 'CANCELLED'
    """)
    long getTotalProductsSold();


    // =====================================================
    // UNIQUE CUSTOMERS
    // Excludes cancelled orders
    // =====================================================

    @Query("""
        SELECT COUNT(DISTINCT o.user.id)
        FROM Order o
        WHERE UPPER(o.status) <> 'CANCELLED'
    """)
    long getUniqueCustomers();


    // =====================================================
    // PENDING ORDERS
    // =====================================================

    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE UPPER(o.status) = 'PENDING'
    """)
    long getPendingOrderCount();


    // =====================================================
    // ORDER STATUS STATISTICS
    // =====================================================

    @Query("""
        SELECT UPPER(o.status), COUNT(o)
        FROM Order o
        GROUP BY UPPER(o.status)
    """)
    List<Object[]> getOrderStatusStatistics();
}