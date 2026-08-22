import { useState } from "react";
import Login from "./pages/Login";
import Products from "./pages/Products";
import "./App.css";

function App() {
    const [token, setToken] = useState(
        localStorage.getItem("token")
    );

    function handleLogin(newToken) {
        localStorage.setItem("token", newToken);
        setToken(newToken);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        setToken(null);
    }

    if (!token) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="app">

            {/* ================= HEADER ================= */}
            <header className="navbar">

                <div className="logo">
                    NEXCART
                </div>

                <nav className="nav-links">
                    <a href="/">Products</a>
                    <a href="/">Cart</a>
                    <a href="/">Orders</a>
                </nav>

                <div className="nav-actions">
                    <button className="nav-button">
                        🔍
                    </button>

                    <button className="nav-button">
                        🛒
                    </button>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>

            </header>

            {/* ================= MAIN ================= */}
            <main className="main-content">

                <section className="hero">

                    <div className="hero-label">
                        NEXCART STORE
                    </div>

                    <h1>
                        Discover Products
                    </h1>

                    <p>
                        Browse our latest products,
                        discover great deals, and add
                        your favorite products to your cart.
                    </p>

                </section>

                <Products />

            </main>

        </div>
    );
}

export default App;