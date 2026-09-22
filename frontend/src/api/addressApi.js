const API_URL =
    "http://localhost:8081/api/users/me/addresses";


// =====================================================
// TOKEN
// =====================================================

function getToken() {
    return localStorage.getItem("token");
}


// =====================================================
// HEADERS
// =====================================================

function getHeaders() {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    };

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
}


// =====================================================
// NORMALIZE ADDRESS TYPE
// =====================================================

function normalizeAddressType(value) {

    const type =
        String(value || "")
            .trim()
            .toUpperCase();

    if (type === "WORK") {
        return "WORK";
    }

    if (type === "OTHER") {
        return "OTHER";
    }

    return "HOME";
}


// =====================================================
// HANDLE RESPONSE
// =====================================================

async function handleResponse(
    response,
    defaultMessage
) {

    if (!response.ok) {

        let message =
            `${defaultMessage} (${response.status})`;

        try {

            const error =
                await response.json();

            if (error?.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON.
        }

        throw new Error(message);
    }


    // DELETE → 204 No Content

    if (response.status === 204) {
        return null;
    }


    // Some successful requests may have
    // an empty response body.

    const text =
        await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}


// =====================================================
// GET ADDRESSES
// =====================================================

export async function getAddresses() {

    const token = getToken();

    if (!token) {
        throw new Error(
            "Please login to view your addresses."
        );
    }

    const response =
        await fetch(
            API_URL,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

    return handleResponse(
        response,
        "Unable to load addresses"
    );
}


// =====================================================
// ADD ADDRESS
// =====================================================

export async function addAddress(addressData) {

    const token = getToken();

    if (!token) {
        throw new Error(
            "Please login to add an address."
        );
    }


    const payload = {
        ...addressData,

        // PostgreSQL constraint:
        // HOME / WORK / OTHER

        addressType:
            normalizeAddressType(
                addressData?.addressType
            ),
    };


    const response =
        await fetch(
            API_URL,
            {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(payload),
            }
        );

    return handleResponse(
        response,
        "Unable to add address"
    );
}


// =====================================================
// UPDATE ADDRESS
// =====================================================

export async function updateAddress(
    addressId,
    addressData
) {

    if (!addressId) {
        throw new Error(
            "Address ID is missing."
        );
    }


    const token = getToken();

    if (!token) {
        throw new Error(
            "Please login to update your address."
        );
    }


    const payload = {
        ...addressData,

        // PostgreSQL constraint:
        // HOME / WORK / OTHER

        addressType:
            normalizeAddressType(
                addressData?.addressType
            ),
    };


    const response =
        await fetch(
            `${API_URL}/${addressId}`,
            {
                method: "PUT",
                headers: getHeaders(),
                body: JSON.stringify(payload),
            }
        );

    return handleResponse(
        response,
        "Unable to update address"
    );
}


// =====================================================
// DELETE ADDRESS
// =====================================================

export async function deleteAddress(addressId) {

    if (!addressId) {
        throw new Error(
            "Address ID is missing."
        );
    }


    const token = getToken();

    if (!token) {
        throw new Error(
            "Please login to delete your address."
        );
    }


    const response =
        await fetch(
            `${API_URL}/${addressId}`,
            {
                method: "DELETE",
                headers: getHeaders(),
            }
        );

    return handleResponse(
        response,
        "Unable to delete address"
    );
}
