const API_URL =
    "http://localhost:8081/api/users/me/orders";


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

            if (error.message) {

                message =
                    error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return response.json();
}


// =====================================================
// CREATE ORDER
// =====================================================

export async function createOrder(
    shippingData
) {

    const token =
        getToken();

    if (!token) {

        throw new Error(
            "Please login before placing an order."
        );
    }

    const response =
        await fetch(
            API_URL,
            {
                method: "POST",
                headers: getHeaders(),
                body: JSON.stringify(
                    shippingData
                ),
            }
        );

    return handleResponse(
        response,
        "Unable to place order"
    );
}


// =====================================================
// GET USER ORDERS
// =====================================================

export async function getOrders() {

    const token =
        getToken();

    if (!token) {

        throw new Error(
            "Please login to view your orders."
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
        "Unable to load orders"
    );
}


// =====================================================
// GET SINGLE ORDER
// =====================================================

export async function getOrder(
    orderId
) {

    if (!orderId) {

        throw new Error(
            "Order ID is missing"
        );
    }

    const token =
        getToken();

    if (!token) {

        throw new Error(
            "Please login to view your order."
        );
    }

    const response =
        await fetch(
            `${API_URL}/${orderId}`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

    return handleResponse(
        response,
        "Unable to load order"
    );
}


// =====================================================
// CANCEL ORDER
// =====================================================

export async function cancelOrder(
    orderId
) {

    if (!orderId) {

        throw new Error(
            "Order ID is missing"
        );
    }

    const token =
        getToken();

    if (!token) {

        throw new Error(
            "Please login to cancel your order."
        );
    }

    const response =
        await fetch(
            `${API_URL}/${orderId}/cancel`,
            {
                method: "PUT",
                headers: getHeaders(),
            }
        );

    return handleResponse(
        response,
        "Unable to cancel order"
    );
}
