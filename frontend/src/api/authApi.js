const API_URL = "http://localhost:8080/api";

export async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Login failed");
    }

    return response.json();
}