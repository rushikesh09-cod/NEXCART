const API_BASE_URL = "http://localhost:8080/api";

export async function getProducts() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_BASE_URL}/products`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load products");
    }

    return response.json();
}