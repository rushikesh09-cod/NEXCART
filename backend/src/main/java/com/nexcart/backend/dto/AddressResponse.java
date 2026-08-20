package com.nexcart.backend.dto;

import com.nexcart.backend.entity.Address;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class AddressResponse {

    private UUID id;
    private String addressType;
    private String fullName;
    private String phone;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private Boolean isDefault;
    private OffsetDateTime createdAt;

    public static AddressResponse fromAddress(Address address) {

        return new AddressResponse(
                address.getId(),
                address.getAddressType(),
                address.getFullName(),
                address.getPhone(),
                address.getAddressLine1(),
                address.getAddressLine2(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getIsDefault(),
                address.getCreatedAt()
        );
    }
}