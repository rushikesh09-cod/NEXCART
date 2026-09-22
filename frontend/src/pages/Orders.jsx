import { useEffect, useState } from "react";
import { getOrders } from "../api/orderApi";

function Orders({ onNavigate }) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    // =====================================================
    // LOAD ORDERS
    // =====================================================

    async function loadOrders() {

        try {

            setLoading(true);
            setError("");

            const data = await getOrders();

            setOrders(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load orders:",
                err
            );

            setError(
                err.message ||
                "Unable to load orders."
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        loadOrders();
    }, []);


    // =====================================================
    // NAVIGATION
    // =====================================================

    function goToProducts() {

        if (onNavigate) {
            onNavigate("/");
        } else {
            window.location.href = "/";
        }
    }


    function viewOrder(orderId) {

        if (!orderId) {
            return;
        }

        if (onNavigate) {
            onNavigate(`/orders/${orderId}`);
        } else {
            window.location.href =
                `/orders/${orderId}`;
        }
    }


    // =====================================================
    // FORMAT PRICE
    // =====================================================

    function formatPrice(value) {

        return Number(value || 0)
            .toLocaleString("en-IN");
    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(value) {

        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    }


    // =====================================================
    // FORMAT STATUS
    // =====================================================

    function formatStatus(status) {

        if (!status) {
            return "Unknown";
        }

        const value =
            String(status).toLowerCase();

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    }


    // =====================================================
    // TOTAL ITEMS
    // =====================================================

    function getTotalItems(order) {

        if (!Array.isArray(order?.items)) {
            return 0;
        }

        return order.items.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );
    }


    // =====================================================
    // SHORT ORDER ID
    // =====================================================

    function getShortOrderId(id) {

        if (!id) {
            return "--------";
        }

        return String(id)
            .replaceAll("-", "")
            .slice(0, 8)
            .toUpperCase();
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="orders-page">

                <div className="orders-container">

                    <header className="orders-header">

                        <div>
                            <p className="orders-label">
                                ACCOUNT
                            </p>

                            <h1>
                                My Orders
                            </h1>

                            <p>
                                Track and view all your
                                previous purchases.
                            </p>
                        </div>

                    </header>


                    <div className="orders-state">

                        <div className="loading-spinner" />

                        <h2>
                            Loading your orders
                        </h2>

                        <p>
                            Please wait while we fetch
                            your order history.
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (
            <div className="orders-page">

                <div className="orders-container">

                    <div className="orders-state">

                        <div className="cart-state-icon">
                            !
                        </div>

                        <p className="orders-label">
                            ORDER HISTORY
                        </p>

                        <h1>
                            Unable to Load Orders
                        </h1>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            className="orders-primary-button"
                            onClick={loadOrders}
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // EMPTY
    // =====================================================

    if (orders.length === 0) {

        return (
            <div className="orders-page">

                <div className="orders-container">

                    <div className="orders-state">

                        <div className="orders-empty-icon">
                            🛍️
                        </div>

                        <p className="orders-label">
                            ORDER HISTORY
                        </p>

                        <h1>
                            No Orders Yet
                        </h1>

                        <p>
                            You haven't placed an order yet.
                            Start shopping and your orders
                            will appear here.
                        </p>

                        <button
                            type="button"
                            className="orders-primary-button"
                            onClick={goToProducts}
                        >
                            Start Shopping
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // ORDERS PAGE
    // =====================================================

    return (
        <div className="orders-page">

            <div className="orders-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="orders-header">

                    <div>

                        <p className="orders-label">
                            ACCOUNT
                        </p>

                        <h1>
                            My Orders
                        </h1>

                        <p>
                            Track and view all your
                            previous purchases.
                        </p>

                    </div>


                    <div className="orders-count">

                        <strong>
                            {orders.length}
                        </strong>

                        <span>
                            {orders.length === 1
                                ? "Order"
                                : "Orders"}
                        </span>

                    </div>

                </header>


                {/* =================================================
                    ORDERS
                ================================================= */}

                <div className="orders-list">

                    {orders.map((order) => {

                        const totalItems =
                            getTotalItems(order);

                        const status =
                            String(
                                order.status ||
                                "unknown"
                            ).toLowerCase();


                        return (
                            <article
                                className="order-card"
                                key={order.id}
                            >

                                {/* =================================================
                                    CARD HEADER
                                ================================================= */}

                                <div className="order-card-top">

                                    <div className="order-id-area">

                                        <span className="order-card-label">
                                            ORDER ID
                                        </span>

                                        <h2>
                                            #
                                            {getShortOrderId(
                                                order.id
                                            )}
                                        </h2>

                                        <span className="order-date">
                                            Placed on{" "}
                                            {formatDate(
                                                order.createdAt
                                            )}
                                        </span>

                                    </div>


                                    <span
                                        className={
                                            `order-status ${status}`
                                        }
                                    >

                                        <span className="status-dot" />

                                        {formatStatus(
                                            order.status
                                        )}

                                    </span>

                                </div>


                                {/* =================================================
                                    SUMMARY
                                ================================================= */}

                                <div className="order-summary-row">

                                    <div className="order-summary-item">

                                        <span>
                                            Items
                                        </span>

                                        <strong>
                                            {totalItems}
                                        </strong>

                                    </div>


                                    <div className="order-summary-item">

                                        <span>
                                            Products
                                        </span>

                                        <strong>
                                            {Array.isArray(order.items)
                                                ? order.items.length
                                                : 0}
                                        </strong>

                                    </div>


                                    <div className="order-summary-item total">

                                        <span>
                                            Total Amount
                                        </span>

                                        <strong>
                                            ₹
                                            {formatPrice(
                                                order.totalAmount
                                            )}
                                        </strong>

                                    </div>

                                </div>


                                {/* =================================================
                                    PRODUCTS
                                ================================================= */}

                                <div className="order-products">

                                    <div className="order-products-heading">

                                        <div>
                                            <h3>
                                                Products
                                            </h3>

                                            <span>
                                                Items included in this order
                                            </span>
                                        </div>

                                    </div>


                                    <div className="order-products-list">

                                        {Array.isArray(order.items) &&
                                            order.items.map(
                                                (item) => (

                                                    <div
                                                        className="order-product"
                                                        key={item.id}
                                                    >

                                                        {/* IMAGE */}

                                                        <div className="order-product-image">

                                                            <span>
                                                                🛍️
                                                            </span>

                                                        </div>


                                                        {/* INFO */}

                                                        <div className="order-product-info">

                                                            <h4>
                                                                {
                                                                    item.productName
                                                                }
                                                            </h4>

                                                            {item.brand && (
                                                                <p>
                                                                    {
                                                                        item.brand
                                                                    }
                                                                </p>
                                                            )}

                                                            <span>
                                                                ₹
                                                                {formatPrice(
                                                                    item.price
                                                                )}
                                                                {" "}×{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </span>

                                                        </div>


                                                        {/* TOTAL */}

                                                        <div className="order-product-total">

                                                            <span>
                                                                Subtotal
                                                            </span>

                                                            <strong>
                                                                ₹
                                                                {formatPrice(
                                                                    item.subtotal
                                                                )}
                                                            </strong>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                    </div>

                                </div>


                                {/* =================================================
                                    FOOTER
                                ================================================= */}

                                <div className="order-card-footer">

                                    <div className="order-footer-total">

                                        <span>
                                            Order Total
                                        </span>

                                        <strong>
                                            ₹
                                            {formatPrice(
                                                order.totalAmount
                                            )}
                                        </strong>

                                    </div>


                                    <button
                                        type="button"
                                        className="view-order-button"
                                        onClick={() =>
                                            viewOrder(
                                                order.id
                                            )
                                        }
                                    >
                                        View Order Details

                                        <span>
                                            →
                                        </span>

                                    </button>

                                </div>

                            </article>
                        );
                    })}

                </div>

            </div>

        </div>
    );
}


export default Orders;