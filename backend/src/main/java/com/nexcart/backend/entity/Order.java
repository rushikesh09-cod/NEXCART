package com.nexcart.backend.entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;


    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;


    @Column(
            name = "status",
            nullable = false,
            length = 30
    )
    private String status;


    @Column(
            name = "total_amount",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalAmount;


    @Column(
            name = "shipping_first_name",
            nullable = false,
            length = 50
    )
    private String shippingFirstName;


    @Column(
            name = "shipping_last_name",
            nullable = false,
            length = 50
    )
    private String shippingLastName;


    @Column(
            name = "shipping_phone",
            nullable = false,
            length = 20
    )
    private String shippingPhone;


    @Column(
            name = "shipping_address_line1",
            nullable = false,
            length = 255
    )
    private String shippingAddressLine1;


    @Column(
            name = "shipping_address_line2",
            length = 255
    )
    private String shippingAddressLine2;


    @Column(
            name = "shipping_city",
            nullable = false,
            length = 100
    )
    private String shippingCity;


    @Column(
            name = "shipping_state",
            nullable = false,
            length = 100
    )
    private String shippingState;


    @Column(
            name = "shipping_postal_code",
            nullable = false,
            length = 20
    )
    private String shippingPostalCode;


    @Column(
            name = "shipping_country",
            nullable = false,
            length = 100
    )
    private String shippingCountry;


    @Column(
            name = "created_at",
            nullable = false
    )
    private OffsetDateTime createdAt;


    @Column(
            name = "updated_at",
            nullable = false
    )
    private OffsetDateTime updatedAt;


    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<OrderItem> items =
            new ArrayList<>();


    // =====================================================
    // PRE-PERSIST
    // =====================================================

    @PrePersist
    protected void onCreate() {

        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );


        if (createdAt == null) {

            createdAt = now;
        }


        if (updatedAt == null) {

            updatedAt = now;
        }
    }


    // =====================================================
    // PRE-UPDATE
    // =====================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );
    }
}