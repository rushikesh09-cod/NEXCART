import { useState } from "react";
import { login, forgotPassword } from "../api/authApi";

function Login({ onLogin, onCreateAccount }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");


    // =====================================================
    // LOGIN
    // =====================================================

    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setMessage("");

        const cleanEmail =
            email.trim().toLowerCase();

        try {

            setLoading(true);

            const data = await login(
                cleanEmail,
                password
            );

            if (!data?.token) {

                throw new Error(
                    "Login failed. No token received."
                );
            }

            // Save JWT
            localStorage.setItem(
                "token",
                data.token
            );

            // Send complete response to App.jsx
            if (onLogin) {
                onLogin(data);
            }

        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                err?.message ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);

        }
    }


    // =====================================================
    // FORGOT PASSWORD
    // =====================================================

    async function handleForgotPassword() {

        setError("");
        setMessage("");

        const cleanEmail =
            email.trim().toLowerCase();


        // Email required
        if (!cleanEmail) {

            setError(
                "Please enter your email address first."
            );

            return;
        }


        // Basic email validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(cleanEmail)) {

            setError(
                "Please enter a valid email address."
            );

            return;
        }


        try {

            setForgotLoading(true);

            const response =
                await forgotPassword(
                    cleanEmail
                );

            setMessage(
                response?.message ||
                "If an account exists with this email, a password reset link has been sent."
            );

        } catch (err) {

            console.error(
                "Forgot password error:",
                err
            );

            setError(
                err?.message ||
                "Unable to process password reset request."
            );

        } finally {

            setForgotLoading(false);

        }
    }


    // =====================================================
    // UI
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

                    <p className="brand-description">
                        Discover smartphones, electronics
                        and everyday essentials at NEXCART.
                    </p>

                    <div className="brand-features">

                        <span className="brand-feature">
                            ✓ Secure Shopping
                        </span>

                        <span className="brand-feature">
                            ✓ Fast Delivery
                        </span>

                        <span className="brand-feature">
                            ✓ Best Products
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================================
                LOGIN SECTION
            ================================================= */}

            <div className="login-form-section">

                <div className="login-card">


                    {/* MOBILE LOGO */}

                    <div className="login-card-logo">
                        NEXCART
                    </div>


                    {/* HEADER */}

                    <div className="login-header">

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to continue shopping
                        </p>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    {/* SUCCESS */}

                    {message && (

                        <div className="login-success">
                            {message}
                        </div>

                    )}


                    {/* =================================================
                        LOGIN FORM
                    ================================================= */}

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >


                        {/* EMAIL */}

                        <div className="login-form-group">

                            <label htmlFor="login-email">
                                Email address
                            </label>

                            <input
                                id="login-email"
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


                        {/* PASSWORD */}

                        <div className="login-form-group">

                            <div className="password-row">

                                <label htmlFor="login-password">
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={
                                        handleForgotPassword
                                    }
                                    disabled={forgotLoading}
                                >

                                    {forgotLoading
                                        ? "Sending..."
                                        : "Forgot password?"}

                                </button>

                            </div>


                            <input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="current-password"
                                required
                            />

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={
                                loading ||
                                forgotLoading
                            }
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign in"}

                        </button>

                    </form>


                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <div className="login-register">

                        <span>
                            New to NEXCART?
                        </span>

                        <button
                            type="button"
                            onClick={onCreateAccount}
                        >
                            Create an account
                        </button>

                    </div>


                    {/* =================================================
                        TERMS
                    ================================================= */}

                    <p className="login-terms">

                        By continuing, you agree to our{" "}

                        <a href="#">
                            Terms
                        </a>

                        {" "}and{" "}

                        <a href="#">
                            Privacy Policy
                        </a>.

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;