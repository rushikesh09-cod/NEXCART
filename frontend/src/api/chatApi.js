const API_BASE_URL = "http://localhost:8081/api";

// =====================================================
// HEADERS
// =====================================================

function getHeaders() {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}

// =====================================================
// HANDLE API RESPONSE
// =====================================================

async function handleResponse(response, defaultMessage) {
    if (!response.ok) {
        let message = `${defaultMessage} (${response.status})`;

        try {
            const error = await response.json();
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
// SEND CHAT MESSAGE
// =====================================================

export async function sendChatMessage(message) {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ message }),
    });

    return handleResponse(response, "Failed to get AI assistant response");
}
