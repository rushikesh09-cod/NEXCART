import { useState } from "react";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Invalid email or password");
            }

            const data = await response.json();

            localStorage.setItem("token", data.token);

            onLogin(data.token);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">

            {/* LEFT SIDE */}
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
                        Discover smartphones, electronics and
                        everyday essentials at NEXCART.
                    </p>

                    <div className="brand-features">
                        <span>✓ Secure Shopping</span>
                        <span>✓ Fast Delivery</span>
                        <span>✓ Best Products</span>
                    </div>

                </div>

            </div>

            {/* RIGHT SIDE */}
            <div className="login-section">

                <div className="login-card">

                    <div className="mobile-logo">
                        NEXCART
                    </div>

                    <div className="login-heading">
                        <h2>Welcome back</h2>

                        <p>
                            Sign in to continue shopping
                        </p>
                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label>Email address</label>

                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group">
                            <div className="password-label">
                                <label>Password</label>

                                <button
                                    type="button"
                                    className="forgot-button"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign in"}
                        </button>

                    </form>

                    <div className="login-divider">
                        <span>New to NEXCART?</span>
                    </div>

                    <button
                        type="button"
                        className="create-account-button"
                    >
                        Create an account
                    </button>

                    <p className="login-footer">
                        By continuing, you agree to our
                        Terms & Privacy Policy.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;