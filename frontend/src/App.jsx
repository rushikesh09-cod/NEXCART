import { useEffect, useState } from "react";

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Addresses from "./pages/Addresses";

import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import AdminStatistics from "./pages/AdminStatistics";

import ChatWidget from "./components/ChatWidget";

import "./App.css";


// =====================================================
// 404 PAGE
// =====================================================

function NotFound({ onNavigate }) {
    return (
        <div className="not-found-page">
            <div className="not-found-card">

                <div className="not-found-number">
                    404
                </div>

                <h1>
                    Page Not Found
                </h1>

                <p>
                    The page you are looking for does not exist.
                </p>

                <button
                    type="button"
                    className="primary-button"
                    onClick={() => onNavigate("/")}
                >
                    Go to Products
                </button>

            </div>
        </div>
    );
}


// =====================================================
// APP
// =====================================================

function App() {

    // =====================================================
    // STATE
    // =====================================================

    const [currentPath, setCurrentPath] = useState(
        window.location.pathname
    );

    const [isLoggedIn, setIsLoggedIn] = useState(() =>
        Boolean(localStorage.getItem("token"))
    );

    const [userRole, setUserRole] = useState(() =>
        localStorage.getItem("userRole")
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [searchInput, setSearchInput] = useState("");


    // =====================================================
    // BROWSER BACK / FORWARD
    // =====================================================

    useEffect(() => {

        function handlePopState() {

            setCurrentPath(
                window.location.pathname
            );

            setIsLoggedIn(
                Boolean(
                    localStorage.getItem("token")
                )
            );

            setUserRole(
                localStorage.getItem("userRole")
            );
        }

        window.addEventListener(
            "popstate",
            handlePopState
        );

        return () => {
            window.removeEventListener(
                "popstate",
                handlePopState
            );
        };

    }, []);


    // =====================================================
    // NAVIGATION
    // =====================================================

    function navigate(path) {

        if (path === window.location.pathname) {
            return;
        }

        window.history.pushState(
            {},
            "",
            path
        );

        setCurrentPath(path);

        setIsLoggedIn(
            Boolean(
                localStorage.getItem("token")
            )
        );

        setUserRole(
            localStorage.getItem("userRole")
        );

        // Clear search outside products page
        if (path !== "/") {
            setSearchTerm("");
            setSearchInput("");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }


    // =====================================================
    // SEARCH
    // =====================================================

    function handleSearch(event) {

        event.preventDefault();

        const value = searchInput.trim();

        // Empty search
        if (!value) {

            setSearchTerm("");

            if (window.location.pathname !== "/") {

                window.history.pushState(
                    {},
                    "",
                    "/"
                );

                setCurrentPath("/");
            }

            return;
        }

        // Set search
        setSearchTerm(value);

        // Navigate to products
        if (window.location.pathname !== "/") {

            window.history.pushState(
                {},
                "",
                "/"
            );

            setCurrentPath("/");
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }


    // =====================================================
    // CLEAR SEARCH
    // =====================================================

    function clearSearch() {

        setSearchTerm("");
        setSearchInput("");

        if (window.location.pathname !== "/") {

            window.history.pushState(
                {},
                "",
                "/"
            );

            setCurrentPath("/");
        }
    }


    // =====================================================
    // LOGIN SUCCESS
    // =====================================================

    function handleLogin(loginData) {

        setIsLoggedIn(true);

        const roles =
            loginData?.user?.roles || [];

        const roleNames =
            roles
                .map((role) => {

                    if (typeof role === "string") {
                        return role.toUpperCase();
                    }

                    return role?.name?.toUpperCase();
                })
                .filter(Boolean);

        const role =
            roleNames.includes("ADMIN")
                ? "ADMIN"
                : "CUSTOMER";

        setUserRole(role);

        localStorage.setItem(
            "userRole",
            role
        );

        setSearchTerm("");
        setSearchInput("");

        navigate("/");
    }


    // =====================================================
    // REGISTER SUCCESS
    // =====================================================

    function handleRegisterSuccess() {

        setSearchTerm("");
        setSearchInput("");

        window.history.pushState(
            {},
            "",
            "/login"
        );

        setCurrentPath("/login");
    }


    // =====================================================
    // BACK TO LOGIN
    // =====================================================

    function handleBackToLogin() {

        setSearchTerm("");
        setSearchInput("");

        navigate("/login");
    }


    // =====================================================
    // LOGOUT
    // =====================================================

    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("lastOrder");

        setIsLoggedIn(false);
        setUserRole(null);

        setSearchTerm("");
        setSearchInput("");

        window.history.pushState(
            {},
            "",
            "/login"
        );

        setCurrentPath("/login");
    }


    // =====================================================
    // ROUTE DETECTION
    // =====================================================

    const isProductDetailsPage =
        currentPath.startsWith("/products/");

    const isOrderDetailsPage =
        currentPath.startsWith("/orders/");

    const isAddressesPage =
        currentPath === "/addresses";

    const isRegisterPage =
        currentPath === "/register";


    // =====================================================
    // ADMIN ROUTES
    // =====================================================

    const isAdminPage =
        currentPath === "/admin";

    const isAdminProductsPage =
        currentPath === "/admin/products";

    const isAdminOrdersPage =
        currentPath === "/admin/orders";

    const isAdminUsersPage =
        currentPath === "/admin/users";

    const isAdminStatisticsPage =
        currentPath === "/admin/statistics";


    // =====================================================
    // ANY ADMIN ROUTE
    // =====================================================

    const isAdminRoute =
        isAdminPage ||
        isAdminProductsPage ||
        isAdminOrdersPage ||
        isAdminUsersPage ||
        isAdminStatisticsPage;


    // =====================================================
    // PRODUCT ID
    // =====================================================

    const productParts =
        currentPath.split("/");

    const productId =
        isProductDetailsPage &&
        productParts.length === 3
            ? productParts[2]
            : null;


    // =====================================================
    // ORDER ID
    // =====================================================

    const orderParts =
        currentPath.split("/");

    const orderId =
        isOrderDetailsPage &&
        orderParts.length === 3
            ? orderParts[2]
            : null;


    // =====================================================
    // PROTECTED ROUTES
    // =====================================================

    const protectedRoutes = [
        "/cart",
        "/checkout",
        "/orders",
        "/addresses",
        "/order-success",

        // Admin
        "/admin",
        "/admin/products",
        "/admin/orders",
        "/admin/users",
        "/admin/statistics",
    ];

    const isProtectedRoute =
        protectedRoutes.includes(currentPath) ||
        isOrderDetailsPage;


    // =====================================================
    // REDIRECT UNAUTHENTICATED USER
    // =====================================================

    useEffect(() => {

        if (
            !isLoggedIn &&
            isProtectedRoute
        ) {

            window.history.replaceState(
                {},
                "",
                "/login"
            );

            setCurrentPath("/login");
        }

    }, [
        isLoggedIn,
        isProtectedRoute,
    ]);


    // =====================================================
    // BLOCK NON-ADMIN USERS
    // =====================================================

    useEffect(() => {

        if (
            isLoggedIn &&
            isAdminRoute &&
            userRole !== "ADMIN"
        ) {

            window.history.replaceState(
                {},
                "",
                "/"
            );

            setCurrentPath("/");
        }

    }, [
        isLoggedIn,
        isAdminRoute,
        userRole,
    ]);


    // =====================================================
    // PROTECTED ROUTE LOGIN
    // =====================================================

    if (
        !isLoggedIn &&
        isProtectedRoute
    ) {

        return (
            <Login
                onLogin={handleLogin}
                onCreateAccount={() =>
                    navigate("/register")
                }
            />
        );
    }


    // =====================================================
    // BLOCK CUSTOMER FROM ADMIN
    // =====================================================

    if (
        isLoggedIn &&
        isAdminRoute &&
        userRole !== "ADMIN"
    ) {

        return (
            <Products
                onNavigate={navigate}
                searchTerm={searchTerm}
            />
        );
    }


    // =====================================================
    // REGISTER PAGE
    // =====================================================

    if (isRegisterPage) {

        return (
            <Register
                onRegister={handleRegisterSuccess}
                onBackToLogin={handleBackToLogin}
            />
        );
    }


    // =====================================================
    // LOGIN PAGE
    // =====================================================

    if (currentPath === "/login") {

        return (
            <Login
                onLogin={handleLogin}
                onCreateAccount={() =>
                    navigate("/register")
                }
            />
        );
    }


    // =====================================================
    // MAIN APPLICATION
    // =====================================================

    return (
        <div className="app">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <header className="navbar">

                {/* LOGO */}

                <button
                    type="button"
                    className="navbar-logo"
                    onClick={clearSearch}
                >
                    NEXCART
                </button>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="navbar-links">

                    {/* PRODUCTS */}

                    <button
                        type="button"
                        className={
                            currentPath === "/"
                                ? "active"
                                : ""
                        }
                        onClick={clearSearch}
                    >
                        Products
                    </button>


                    {/* CART */}

                    <button
                        type="button"
                        className={
                            currentPath === "/cart"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("/cart")
                        }
                    >
                        Cart
                    </button>


                    {/* ORDERS */}

                    <button
                        type="button"
                        className={
                            currentPath === "/orders" ||
                            isOrderDetailsPage
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("/orders")
                        }
                    >
                        Orders
                    </button>


                    {/* ADDRESSES */}

                    <button
                        type="button"
                        className={
                            isAddressesPage
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            navigate("/addresses")
                        }
                    >
                        Addresses
                    </button>


                    {/* ADMIN */}

                    {isLoggedIn &&
                        userRole === "ADMIN" && (

                            <button
                                type="button"
                                className={
                                    isAdminRoute
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    navigate("/admin")
                                }
                            >
                                Admin
                            </button>

                        )}

                </nav>


                {/* =================================================
                    SEARCH
                ================================================= */}

                <form
                    className="navbar-search"
                    onSubmit={handleSearch}
                >

                    <input
                        type="search"
                        placeholder="Search products..."
                        value={searchInput}
                        onChange={(event) =>
                            setSearchInput(
                                event.target.value
                            )
                        }
                        aria-label="Search products"
                    />

                    <button
                        type="submit"
                        className="icon-button"
                        title="Search"
                        aria-label="Search"
                    >
                        🔍
                    </button>

                </form>


                {/* =================================================
                    RIGHT ACTIONS
                ================================================= */}

                <div className="navbar-actions">

                    {/* CART */}

                    <button
                        type="button"
                        className="icon-button"
                        onClick={() =>
                            navigate("/cart")
                        }
                        title="Cart"
                        aria-label="Cart"
                    >
                        🛒
                    </button>


                    {/* LOGOUT */}

                    {isLoggedIn && (

                        <button
                            type="button"
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    )}

                </div>

            </header>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">


                {/* =================================================
                    ADMIN DASHBOARD
                ================================================= */}

                {isAdminPage && (

                    <AdminDashboard
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ADMIN PRODUCTS
                ================================================= */}

                {isAdminProductsPage && (

                    <AdminProducts
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ADMIN ORDERS
                ================================================= */}

                {isAdminOrdersPage && (

                    <AdminOrders
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ADMIN USERS
                ================================================= */}

                {isAdminUsersPage && (

                    <AdminUsers
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ADMIN STATISTICS
                ================================================= */}

                {isAdminStatisticsPage && (

                    <AdminStatistics
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    PRODUCTS
                ================================================= */}

                {currentPath === "/" && (

                    <Products
                        onNavigate={navigate}
                        searchTerm={searchTerm}
                    />

                )}


                {/* =================================================
                    PRODUCT DETAILS
                ================================================= */}

                {isProductDetailsPage && (

                    productId ? (

                        <ProductDetails
                            productId={productId}
                            onNavigate={navigate}
                        />

                    ) : (

                        <NotFound
                            onNavigate={navigate}
                        />

                    )

                )}


                {/* =================================================
                    CART
                ================================================= */}

                {currentPath === "/cart" && (

                    <Cart
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    CHECKOUT
                ================================================= */}

                {currentPath === "/checkout" && (

                    <Checkout
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ORDER SUCCESS
                ================================================= */}

                {currentPath === "/order-success" && (

                    <OrderSuccess
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ORDERS
                ================================================= */}

                {currentPath === "/orders" && (

                    <Orders
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    ORDER DETAILS
                ================================================= */}

                {isOrderDetailsPage && (

                    orderId ? (

                        <OrderDetails
                            orderId={orderId}
                            onNavigate={navigate}
                        />

                    ) : (

                        <NotFound
                            onNavigate={navigate}
                        />

                    )

                )}


                {/* =================================================
                    ADDRESSES
                ================================================= */}

                {isAddressesPage && (

                    <Addresses
                        onNavigate={navigate}
                    />

                )}


                {/* =================================================
                    GENERAL 404
                ================================================= */}

                {currentPath !== "/" &&
                    currentPath !== "/cart" &&
                    currentPath !== "/checkout" &&
                    currentPath !== "/order-success" &&
                    currentPath !== "/orders" &&
                    currentPath !== "/addresses" &&
                    currentPath !== "/login" &&
                    currentPath !== "/register" &&
                    currentPath !== "/admin" &&
                    currentPath !== "/admin/products" &&
                    currentPath !== "/admin/orders" &&
                    currentPath !== "/admin/users" &&
                    currentPath !== "/admin/statistics" &&
                    !isProductDetailsPage &&
                    !isOrderDetailsPage && (

                        <NotFound
                            onNavigate={navigate}
                        />

                    )}

            </main>

            {/* =====================================================
                AI SHOPPING ASSISTANT
            ===================================================== */}
            {!isAdminRoute && <ChatWidget />}

        </div>
    );
}

export default App;