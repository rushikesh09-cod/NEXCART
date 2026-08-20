package com.nexcart.backend.service;

import com.nexcart.backend.dto.AddressRequest;
import com.nexcart.backend.entity.Address;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.AddressRepository;
import com.nexcart.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(
            AddressRepository addressRepository,
            UserRepository userRepository
    ) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // ADD ADDRESS
    // =========================

    @Transactional
    public Address addAddress(
            String email,
            AddressRequest request
    ) {

        User user = getUserByEmail(email);

        // If new address is default,
        // remove default from existing addresses
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            removeDefaultAddress(user);
        }

        Address address = new Address();

        address.setUser(user);

        address.setAddressType(request.getAddressType());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());

        address.setCountry(
                request.getCountry() == null ||
                request.getCountry().isBlank()
                        ? "India"
                        : request.getCountry()
        );

        address.setIsDefault(
                Boolean.TRUE.equals(request.getIsDefault())
        );

        address.setCreatedAt(
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        return addressRepository.save(address);
    }

    // =========================
    // GET ADDRESSES
    // =========================

    @Transactional(readOnly = true)
    public List<Address> getAddresses(String email) {

        User user = getUserByEmail(email);

        return addressRepository.findByUserId(user.getId());
    }

    // =========================
    // UPDATE ADDRESS
    // =========================

    @Transactional
    public Address updateAddress(
            String email,
            UUID addressId,
            AddressRequest request
    ) {

        User user = getUserByEmail(email);

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found"
                        )
                );

        // Make sure the address belongs to this user
        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot update this address"
            );
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            removeDefaultAddress(user);
        }

        address.setAddressType(request.getAddressType());
        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());

        address.setCountry(
                request.getCountry() == null ||
                request.getCountry().isBlank()
                        ? "India"
                        : request.getCountry()
        );

        address.setIsDefault(
                Boolean.TRUE.equals(request.getIsDefault())
        );

        return addressRepository.save(address);
    }

    // =========================
    // DELETE ADDRESS
    // =========================

    @Transactional
    public void deleteAddress(
            String email,
            UUID addressId
    ) {

        User user = getUserByEmail(email);

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Address not found"
                        )
                );

        // Make sure the address belongs to this user
        if (!address.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException(
                    "You cannot delete this address"
            );
        }

        addressRepository.delete(address);
    }

    // =========================
    // FIND USER
    // =========================

    private User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "User not found"
                        )
                );
    }

    // =========================
    // REMOVE DEFAULT
    // =========================

    private void removeDefaultAddress(User user) {

        List<Address> addresses =
                addressRepository.findByUserId(user.getId());

        for (Address address : addresses) {
            address.setIsDefault(false);
        }

        addressRepository.saveAll(addresses);
    }
}