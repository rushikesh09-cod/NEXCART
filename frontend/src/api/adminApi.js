const API_URL = "http://localhost:8081/api";

// =====================================================
// TOKEN
// =====================================================

function getToken() {
    return localStorage.getItem("token");
}

// =====================================================
// REQUIRE TOKEN
// =====================================================

function requireToken() {
    const token = getToken();

    if (!token) {
        throw new Error(
            "Please login as an administrator."
        );
    }

    return token;
}

// =====================================================
// HEADERS
// =====================================================

function getHeaders() {
    const token = requireToken();

    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
}

// =====================================================
// HANDLE RESPONSE
// =====================================================

async function handleResponse(response, defaultMessage) {
    if (!response.ok) {
        let message = `${defaultMessage} (${response.status})`;

        try {
            const error = await response.json();

            if (error?.message) {
                message = error.message;
            }
        } catch {
            // Response was not JSON
        }

        if (response.status === 401) {
            message =
                "Authentication required. Please login again.";

            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
        }

        if (response.status === 403) {
            message =
                "Access denied. Admin privileges are required.";
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// =====================================================
// ADMIN DASHBOARD
// =====================================================

export async function getAdminDashboard() {
    const response = await fetch(
        `${API_URL}/admin/dashboard`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load admin dashboard"
    );
}

// =====================================================
// ADMIN STATISTICS
// =====================================================

export async function getAdminStatistics() {
    const response = await fetch(
        `${API_URL}/admin/statistics`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load sales statistics"
    );
}

// =====================================================
// ADMIN PRODUCTS
// =====================================================

// GET ALL PRODUCTS
export async function getAdminProducts() {
    const response = await fetch(
        `${API_URL}/admin/products`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load admin products"
    );
}

// GET PRODUCT BY ID
export async function getAdminProduct(productId) {
    if (!productId) {
        throw new Error(
            "Product ID is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/products/${productId}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load product"
    );
}

// CREATE PRODUCT
export async function createAdminProduct(productData) {
    if (!productData) {
        throw new Error(
            "Product data is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/products`,
        {
            method: "POST",
            headers: getHeaders(),
            body: JSON.stringify(productData),
        }
    );

    return handleResponse(
        response,
        "Unable to create product"
    );
}

// UPDATE PRODUCT
export async function updateAdminProduct(
    productId,
    productData
) {
    if (!productId) {
        throw new Error(
            "Product ID is required."
        );
    }

    if (!productData) {
        throw new Error(
            "Product data is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/products/${productId}`,
        {
            method: "PUT",
            headers: getHeaders(),
            body: JSON.stringify(productData),
        }
    );

    return handleResponse(
        response,
        "Unable to update product"
    );
}

// ACTIVATE / DEACTIVATE PRODUCT
export async function setProductActive(
    productId,
    active
) {
    if (!productId) {
        throw new Error(
            "Product ID is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/products/${productId}/active?active=${Boolean(active)}`,
        {
            method: "PUT",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        active
            ? "Unable to activate product"
            : "Unable to deactivate product"
    );
}

// DELETE PRODUCT
export async function deleteAdminProduct(productId) {
    if (!productId) {
        throw new Error(
            "Product ID is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/products/${productId}`,
        {
            method: "DELETE",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to delete product"
    );
}

// =====================================================
// ADMIN ORDERS
// =====================================================

// GET ALL ORDERS
export async function getAdminOrders() {
    const response = await fetch(
        `${API_URL}/admin/orders`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load admin orders"
    );
}

// GET ORDER BY ID
export async function getAdminOrder(orderId) {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/orders/${orderId}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load admin order"
    );
}

// UPDATE ORDER STATUS
export async function updateAdminOrderStatus(
    orderId,
    status
) {
    if (!orderId) {
        throw new Error(
            "Order ID is required."
        );
    }

    if (!status) {
        throw new Error(
            "Order status is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/orders/${orderId}/status?status=${encodeURIComponent(status)}`,
        {
            method: "PUT",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to update order status"
    );
}

// =====================================================
// ADMIN USERS
// =====================================================

// GET ALL USERS
export async function getAdminUsers() {
    const response = await fetch(
        `${API_URL}/admin/users`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load admin users"
    );
}

// GET USER BY ID
export async function getAdminUser(userId) {
    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/users/${userId}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to load admin user"
    );
}

// UPDATE USER STATUS
export async function updateAdminUserStatus(
    userId,
    status
) {
    if (!userId) {
        throw new Error(
            "User ID is required."
        );
    }

    if (!status) {
        throw new Error(
            "User status is required."
        );
    }

    const response = await fetch(
        `${API_URL}/admin/users/${userId}/status?status=${encodeURIComponent(status)}`,
        {
            method: "PUT",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Unable to update user status"
    );
}
