package com.nexcart.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    // =========================
    // ID
    // =========================

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;


    // =========================
    // USER DETAILS
    // =========================

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(
            name = "email",
            nullable = false,
            unique = true,
            length = 255
    )
    private String email;


    // =========================
    // PASSWORD
    // =========================

    /*
     * Password hash must NEVER be returned
     * in API JSON responses.
     */
    @JsonIgnore
    @Column(
            name = "password_hash",
            nullable = false,
            length = 255
    )
    private String passwordHash;


    // =========================
    // CONTACT
    // =========================

    @Column(
            name = "phone",
            unique = true,
            length = 20
    )
    private String phone;


    // =========================
    // STATUS
    // =========================

    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private String status;


    // =========================
    // TIMESTAMPS
    // =========================

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


    // =========================
    // ROLES
    // =========================

    /*
     * Roles are used for authentication
     * and authorization.
     *
     * They should not be serialized when
     * User is nested inside Cart, Order, etc.
     */

    @JsonIgnore
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(
                    name = "user_id"
            ),
            inverseJoinColumns = @JoinColumn(
                    name = "role_id"
            )
    )
    private Set<Role> roles = new HashSet<>();


    // =========================
    // ADDRESSES
    // =========================

    /*
     * One user can have multiple addresses.
     *
     * @OneToMany is LAZY by default.
     *
     * @JsonIgnore prevents Jackson from trying
     * to serialize addresses when User is returned
     * inside another entity such as Cart.
     */

    @JsonIgnore
    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Address> addresses =
            new ArrayList<>();
}