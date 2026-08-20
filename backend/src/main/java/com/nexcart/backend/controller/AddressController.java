package com.nexcart.backend.controller;

import com.nexcart.backend.dto.AddressRequest;
import com.nexcart.backend.dto.AddressResponse;
import com.nexcart.backend.entity.Address;
import com.nexcart.backend.service.AddressService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users/me/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    // =========================
    // ADD ADDRESS
    // =========================

    @PostMapping
    public ResponseEntity<AddressResponse> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressRequest request
    ) {

        String email = authentication.getName();

        Address address =
                addressService.addAddress(email, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(AddressResponse.fromAddress(address));
    }

    // =========================
    // GET ALL ADDRESSES
    // =========================

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses(
            Authentication authentication
    ) {

        String email = authentication.getName();

        List<AddressResponse> addresses =
                addressService.getAddresses(email)
                        .stream()
                        .map(AddressResponse::fromAddress)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(addresses);
    }

    // =========================
    // UPDATE ADDRESS
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody AddressRequest request
    ) {

        String email = authentication.getName();

        Address address =
                addressService.updateAddress(
                        email,
                        id,
                        request
                );

        return ResponseEntity.ok(
                AddressResponse.fromAddress(address)
        );
    }

    // =========================
    // DELETE ADDRESS
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            Authentication authentication,
            @PathVariable UUID id
    ) {

        String email = authentication.getName();

        addressService.deleteAddress(
                email,
                id
        );

        return ResponseEntity.noContent().build();
    }
}