package com.nexcart.backend.repository;

import com.nexcart.backend.entity.Address;
import com.nexcart.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AddressRepository extends JpaRepository<Address, UUID> {

    List<Address> findByUser(User user);

    List<Address> findByUserId(UUID userId);
}