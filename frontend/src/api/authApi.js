const API_URL = "http://localhost:8081/api";


// =====================================================
// COMMON HELPERS
// =====================================================

async function readResponse(response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}


function getErrorMessage(data, fallback) {

    if (!data) {
        return fallback;
    }

    if (typeof data === "string") {
        return data;
    }

    if (data.message) {
        return data.message;
    }

    if (data.error) {
        return data.error;
    }

    return fallback;
}


async function handleResponse(response, fallbackMessage) {

    const data = await readResponse(response);

    if (!response.ok) {

        throw new Error(
            getErrorMessage(
                data,
                fallbackMessage
            )
        );
    }

    return data;
}


// =====================================================
// LOGIN
// =====================================================

export async function login(email, password) {

    if (!email?.trim()) {
        throw new Error(
            "Email address is required."
        );
    }

    if (!password) {
        throw new Error(
            "Password is required."
        );
    }

    let response;

    try {

        response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },

                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            }
        );

    } catch (error) {

        console.error(
            "Login network error:",
            error
        );

        throw new Error(
            "Unable to connect to the server."
        );
    }

    return handleResponse(
        response,
        "Login failed."
    );
}


// =====================================================
// REGISTER
// =====================================================

export async function register(registerData) {

    if (!registerData) {
        throw new Error(
            "Registration data is required."
        );
    }

    let response;

    try {

        response = await fetch(
            `${API_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },

                body: JSON.stringify(
                    registerData
                ),
            }
        );

    } catch (error) {

        console.error(
            "Registration network error:",
            error
        );

        throw new Error(
            "Unable to connect to the server."
        );
    }

    return handleResponse(
        response,
        "Registration failed."
    );
}


// =====================================================
// GET CURRENT USER
// =====================================================

export async function getCurrentUser() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        throw new Error(
            "Authentication token is missing."
        );
    }

    let response;

    try {

        response = await fetch(
            `${API_URL}/users/me`,
            {
                method: "GET",

                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

    } catch (error) {

        console.error(
            "Current user network error:",
            error
        );

        throw new Error(
            "Unable to connect to the server."
        );
    }


    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("userRole");

    }


    return handleResponse(
        response,
        "Unable to load current user."
    );
}


// =====================================================
// FORGOT PASSWORD
// =====================================================

export async function forgotPassword(email) {

    if (!email?.trim()) {

        throw new Error(
            "Email address is required."
        );
    }

    const cleanEmail =
        email.trim().toLowerCase();

    let response;

    try {

        response = await fetch(
            `${API_URL}/auth/forgot-password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                },

                body: JSON.stringify({
                    email: cleanEmail,
                }),
            }
        );

    } catch (error) {

        console.error(
            "Forgot password network error:",
            error
        );

        throw new Error(
            "Unable to connect to the server."
        );
    }


    const data =
        await readResponse(response);


    if (!response.ok) {

        const message =
            getErrorMessage(
                data,
                `Password reset request failed (${response.status}).`
            );

        console.error(
            "Forgot password failed:",
            response.status,
            data
        );

        throw new Error(message);
    }


    return {
        message:
            getErrorMessage(
                data,
                "If an account exists with this email, a password reset link has been sent."
            ),
    };
}


// =====================================================
// RESET PASSWORD
// =====================================================

export async function resetPassword(
    token,
    newPassword
) {

    if (!token?.trim()) {

        throw new Error(
            "Password reset token is required."
        );
    }

    if (!newPassword) {

        throw new Error(
            "New password is required."
        );
    }

    let response;

    try {

        response = await fetch(
            `${API_URL}/auth/reset-password`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*",
                },

                body: JSON.stringify({
                    token: token.trim(),
                    newPassword,
                }),
            }
        );

    } catch (error) {

        console.error(
            "Reset password network error:",
            error
        );

        throw new Error(
            "Unable to connect to the server."
        );
    }


    const data =
        await readResponse(response);


    if (!response.ok) {

        const message =
            getErrorMessage(
                data,
                `Password reset failed (${response.status}).`
            );

        console.error(
            "Reset password failed:",
            response.status,
            data
        );

        throw new Error(message);
    }


    return {
        message:
            getErrorMessage(
                data,
                "Password has been reset successfully."
            ),
    };
}
