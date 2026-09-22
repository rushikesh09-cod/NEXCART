import { useState } from "react";

const API_URL = "http://localhost:8081/api";

function Register({ onRegister, onBackToLogin }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // REGISTER
    // =====================================================

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        // Password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Backend requires minimum 8 characters
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        try {
            setLoading(true);

            // =================================================
            // REGISTER REQUEST
            // =================================================

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },

                    body: JSON.stringify({
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        email: email.trim().toLowerCase(),
                        phone: phone.trim() || null,
                        password: password,
                    }),
                }
            );

            // =================================================
            // HANDLE ERROR
            // =================================================

            if (!response.ok) {
                let message = "Registration failed.";

                try {
                    const data = await response.json();

                    if (data?.message) {
                        message = data.message;
                    } else if (data?.error) {
                        message = data.error;
                    }
                } catch {
                    try {
                        const text = await response.text();

                        if (text) {
                            message = text;
                        }
                    } catch {
                        // Ignore parsing errors
                    }
                }

                throw new Error(message);
            }

            // =================================================
            // SUCCESS
            // =================================================

            const data = await response.json();

            console.log(
                "Registration successful:",
                data
            );

            // Go back to login
            if (onRegister) {
                onRegister();
            }

        } catch (err) {
            console.error(
                "Registration error:",
                err
            );

            setError(
                err.message ||
                "Unable to create account."
            );

        } finally {
            setLoading(false);
        }
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="login-page">

            {/* =================================================
                LEFT BRAND SECTION
            ================================================= */}

            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                        NEXCART
                    </div>

                    <div className="brand-line"></div>

                    <h1>
                        Everything you need.
                        <br />
                        In one cart.
                    </h1>

                    <p>
                        Discover smartphones, electronics
                        and everyday essentials at NEXCART.
                    </p>

                    <div className="brand-features">

                        <span>
                            ✓ Secure Shopping
                        </span>

                        <span>
                            ✓ Fast Delivery
                        </span>

                        <span>
                            ✓ Best Products
                        </span>

                    </div>

                </div>

            </div>

            {/* =================================================
                REGISTER SECTION
            ================================================= */}

            <div className="login-section">

                <div className="login-card">

                    {/* MOBILE LOGO */}

                    <div className="mobile-logo">
                        NEXCART
                    </div>

                    {/* HEADING */}

                    <div className="login-heading">

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Join NEXCART and start shopping
                        </p>

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {/* REGISTER FORM */}

                    <form onSubmit={handleSubmit}>

                        {/* FIRST NAME + LAST NAME */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px",
                            }}
                        >

                            {/* FIRST NAME */}

                            <div className="form-group">

                                <label>
                                    First name
                                </label>

                                <input
                                    type="text"
                                    placeholder="First name"
                                    value={firstName}
                                    onChange={(event) =>
                                        setFirstName(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="given-name"
                                    required
                                />

                            </div>

                            {/* LAST NAME */}

                            <div className="form-group">

                                <label>
                                    Last name
                                </label>

                                <input
                                    type="text"
                                    placeholder="Last name"
                                    value={lastName}
                                    onChange={(event) =>
                                        setLastName(
                                            event.target.value
                                        )
                                    }
                                    autoComplete="family-name"
                                    required
                                />

                            </div>

                        </div>

                        {/* EMAIL */}

                        <div className="form-group">

                            <label>
                                Email address
                            </label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                autoComplete="email"
                                required
                            />

                        </div>

                        {/* PHONE */}

                        <div className="form-group">

                            <label>
                                Phone
                            </label>

                            <input
                                type="tel"
                                placeholder="Phone number"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(
                                        event.target.value
                                    )
                                }
                                autoComplete="tel"
                            />

                        </div>

                        {/* PASSWORD */}

                        <div className="form-group">

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                        </div>

                        {/* CONFIRM PASSWORD */}

                        <div className="form-group">

                            <label>
                                Confirm password
                            </label>

                            <input
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                        </div>

                        {/* REGISTER BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating account..."
                                : "Create account"
                            }
                        </button>

                    </form>

                    {/* BACK TO LOGIN */}

                    <div className="login-divider">

                        <span>
                            Already have an account?
                        </span>

                    </div>

                    <button
                        type="button"
                        className="create-account-button"
                        onClick={onBackToLogin}
                    >
                        Sign in
                    </button>

                    {/* FOOTER */}

                    <p className="login-footer">
                        By creating an account, you agree
                        to our Terms & Privacy Policy.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;
