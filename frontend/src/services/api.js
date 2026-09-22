const API_BASE_URL = "http://localhost:8081";


// =====================================================
// COMMON API REQUEST
// =====================================================

async function apiRequest(url, options = {}) {

    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}${url}`,
        {
            ...options,
            headers,
        }
    );

    if (!response.ok) {

        let message =
            `Request failed: ${response.status}`;

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


    // DELETE requests can return 204
    if (response.status === 204) {
        return null;
    }


    return response.json();
}


// =====================================================
// AUTH
// =====================================================

export async function login(
    email,
    password
) {

    const data = await apiRequest(
        "/api/auth/login",
        {
            method: "POST",

            body: JSON.stringify({
                email,
                password,
            }),
        }
    );


    if (data.token) {

        localStorage.setItem(
            "token",
            data.token
        );
    }


    return data;
}


export function logout() {

    localStorage.removeItem("token");
}


export function isLoggedIn() {

    return Boolean(
        localStorage.getItem("token")
    );
}


// =====================================================
// PRODUCTS
// =====================================================

export async function getProducts() {

    return apiRequest(
        "/api/products"
    );
}


export async function getProduct(
    productId
) {

    return apiRequest(
        `/api/products/${productId}`
    );
}


export async function searchProducts(
    name
) {

    return apiRequest(
        `/api/products/search?name=${encodeURIComponent(
            name
        )}`
    );
}


export async function getProductsByCategory(
    category
) {

    return apiRequest(
        `/api/products/category/${encodeURIComponent(
            category
        )}`
    );
}


// =====================================================
// ORDERS
// =====================================================

export async function createOrder(
    orderData
) {

    return apiRequest(
        "/api/users/me/orders",
        {
            method: "POST",

            body: JSON.stringify(
                orderData
            ),
        }
    );
}


export async function getOrders() {

    return apiRequest(
        "/api/users/me/orders"
    );
}


export async function getOrder(
    orderId
) {

    return apiRequest(
        `/api/users/me/orders/${orderId}`
    );
}
