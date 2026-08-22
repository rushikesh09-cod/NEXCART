
const API_BASE_URL = "http://localhost:8080/api";

function getHeaders() {
    const token = localStorage.getItem("token");

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
}

export async function getCart() {
    const response = await fetch(
        `${API_BASE_URL}/users/me/cart`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load cart");
    }

    return response.json();
}

export async function addToCart(productId, quantity = 1) {
    const response = await fetch(
        `${API_BASE_URL}/users/me/cart/items/${productId}?quantity=${quantity}`,
        {
            method: "POST",
            headers: getHeaders(),
        }
    );

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to add product to cart");
    }

    return response.json();
}
