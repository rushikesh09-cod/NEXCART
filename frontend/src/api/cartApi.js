const API_URL =
    "http://localhost:8081/api/users/me/cart";


// =====================================================
// GET TOKEN
// =====================================================

function getToken() {

    const token =
        localStorage.getItem("token");

    return token;
}


// =====================================================
// HEADERS
// =====================================================

function getHeaders() {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }

    return headers;
}


// =====================================================
// GET CART
// =====================================================

export async function getCart() {

    const response =
        await fetch(
            API_URL,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );

    if (!response.ok) {

        let message =
            `Unable to load cart (${response.status})`;

        try {

            const error =
                await response.json();

            if (error.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return response.json();
}


// =====================================================
// ADD TO CART
// =====================================================

export async function addToCart(
    productId,
    quantity = 1
) {

    const token = getToken();

    if (!token) {

        throw new Error(
            "Please login before adding products to cart."
        );
    }

    const response =
        await fetch(
            `${API_URL}/items/${productId}?quantity=${quantity}`,
            {
                method: "POST",
                headers: getHeaders(),
            }
        );

    if (!response.ok) {

        let message =
            `Unable to add product to cart (${response.status})`;

        try {

            const error =
                await response.json();

            if (error.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return response.json();
}


// =====================================================
// UPDATE CART QUANTITY
// =====================================================

export async function updateCartQuantity(
    productId,
    quantity
) {

    const response =
        await fetch(
            `${API_URL}/items/${productId}?quantity=${quantity}`,
            {
                method: "PUT",
                headers: getHeaders(),
            }
        );

    if (!response.ok) {

        let message =
            `Unable to update quantity (${response.status})`;

        try {

            const error =
                await response.json();

            if (error.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return response.json();
}


// =====================================================
// REMOVE ITEM
// =====================================================

export async function removeFromCart(
    productId
) {

    const response =
        await fetch(
            `${API_URL}/items/${productId}`,
            {
                method: "DELETE",
                headers: getHeaders(),
            }
        );

    if (!response.ok) {

        let message =
            `Unable to remove item (${response.status})`;

        try {

            const error =
                await response.json();

            if (error.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return true;
}


// =====================================================
// CLEAR CART
// =====================================================

export async function clearCart() {

    const response =
        await fetch(
            API_URL,
            {
                method: "DELETE",
                headers: getHeaders(),
            }
        );

    if (!response.ok) {

        let message =
            `Unable to clear cart (${response.status})`;

        try {

            const error =
                await response.json();

            if (error.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return true;
}
