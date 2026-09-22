import { useEffect, useState } from "react";

import {
    getAdminOrders,
    updateAdminOrderStatus,
} from "../api/adminApi";

import "./AdminOrders.css";

function AdminOrders({ onNavigate }) {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    // =====================================================
    // LOAD ORDERS
    // =====================================================

    async function loadOrders() {

        try {

            setLoading(true);
            setError("");

            const data = await getAdminOrders();

            setOrders(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load admin orders:",
                err
            );

            setError(
                err.message ||
                "Unable to load admin orders."
            );

        } finally {

            setLoading(false);
        }
    }

    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadOrders();
    }, []);

    // =====================================================
    // UPDATE STATUS
    // =====================================================

    async function handleStatusChange(
        orderId,
        status
    ) {

        try {

            setUpdatingId(orderId);
            setError("");

            await updateAdminOrderStatus(
                orderId,
                status
            );

            await loadOrders();

        } catch (err) {

            console.error(
                "Unable to update order status:",
                err
            );

            setError(
                err.message ||
                "Unable to update order status."
            );

        } finally {

            setUpdatingId(null);
        }
    }

    // =====================================================
    // NAVIGATION
    // =====================================================

    function navigate(path) {

        if (onNavigate) {
            onNavigate(path);
        } else {
            window.location.href = path;
        }
    }

    // =====================================================
    // MONEY
    // =====================================================

    function formatMoney(amount) {

        return Number(amount || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    // =====================================================
    // DATE
    // =====================================================

    function formatDate(date) {

        if (!date) {
            return "—";
        }

        try {

            return new Date(date).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short",
                }
            );

        } catch {

            return String(date);
        }
    }

    // =====================================================
    // STATUS CLASS
    // =====================================================

    function getStatusClass(status) {

        switch (
            String(status || "").toUpperCase()
        ) {

            case "PENDING":
                return "pending";

            case "CONFIRMED":
                return "confirmed";

            case "SHIPPED":
                return "shipped";

            case "DELIVERED":
                return "delivered";

            case "CANCELLED":
                return "cancelled";

            default:
                return "";
        }
    }

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="admin-orders-page">

                <div className="admin-orders-state">

                    <div className="loading-spinner"></div>

                    <h1>Admin Orders</h1>

                    <p>Loading orders...</p>

                </div>

            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-orders-page">

            {/* HEADER */}

            <div className="admin-orders-header">

                <div>

                    <p className="admin-label">
                        NEXCART ADMIN
                    </p>

                    <h1>
                        Orders
                    </h1>

                    <p className="admin-orders-subtitle">
                        View and manage customer orders.
                    </p>

                </div>

                <div className="admin-orders-header-actions">

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Dashboard
                    </button>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={loadOrders}
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="admin-orders-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        ×
                    </button>

                </div>
            )}


            {/* SUMMARY */}

            <div className="admin-orders-summary">

                <strong>
                    {orders.length}
                </strong>

                <span>
                    {orders.length === 1
                        ? "Order"
                        : "Orders"}
                </span>

            </div>


            {/* EMPTY */}

            {orders.length === 0 && (

                <div className="admin-orders-empty">

                    <div className="admin-empty-icon">
                        🛒
                    </div>

                    <h2>
                        No orders found
                    </h2>

                    <p>
                        Customer orders will appear here.
                    </p>

                </div>
            )}


            {/* ORDERS */}

            {orders.length > 0 && (

                <div className="admin-orders-list">

                    {orders.map((order) => (

                        <div
                            className="admin-order-card"
                            key={order.id}
                        >

                            {/* ORDER HEADER */}

                            <div className="admin-order-header">

                                <div>

                                    <p className="admin-order-label">
                                        ORDER
                                    </p>

                                    <strong className="admin-order-id">
                                        {order.id}
                                    </strong>

                                    <span className="admin-order-date">
                                        {formatDate(
                                            order.createdAt
                                        )}
                                    </span>

                                </div>

                                <span
                                    className={
                                        `admin-order-status ${getStatusClass(
                                            order.status
                                        )}`
                                    }
                                >
                                    {order.status}
                                </span>

                            </div>


                            {/* CUSTOMER */}

                            <div className="admin-order-section">

                                <h3>
                                    Customer
                                </h3>

                                <div className="admin-order-customer">

                                    <strong>
                                        {order.shippingFirstName}{" "}
                                        {order.shippingLastName}
                                    </strong>

                                    <span>
                                        📞 {order.shippingPhone}
                                    </span>

                                    <span>
                                        {order.shippingAddressLine1}
                                    </span>

                                    {order.shippingAddressLine2 && (

                                        <span>
                                            {order.shippingAddressLine2}
                                        </span>
                                    )}

                                    <span>
                                        {order.shippingCity},{" "}
                                        {order.shippingState}{" "}
                                        {order.shippingPostalCode}
                                    </span>

                                    <span>
                                        {order.shippingCountry}
                                    </span>

                                </div>

                            </div>


                            {/* ITEMS */}

                            <div className="admin-order-section">

                                <h3>
                                    Items
                                </h3>

                                <div className="admin-order-items">

                                    {(order.items || []).map(
                                        (item) => (

                                            <div
                                                className="admin-order-item"
                                                key={item.id}
                                            >

                                                <div>

                                                    <strong>
                                                        {item.productName}
                                                    </strong>

                                                    {item.brand && (

                                                        <small>
                                                            {item.brand}
                                                        </small>
                                                    )}

                                                </div>

                                                <div className="admin-order-item-details">

                                                    <span>
                                                        ₹
                                                        {formatMoney(
                                                            item.price
                                                        )}
                                                    </span>

                                                    <span>
                                                        ×{" "}
                                                        {item.quantity}
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {formatMoney(
                                                            item.subtotal
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>

                                        )
                                    )}

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="admin-order-footer">

                                <div>

                                    <span>
                                        Total Amount
                                    </span>

                                    <strong>
                                        ₹
                                        {formatMoney(
                                            order.totalAmount
                                        )}
                                    </strong>

                                </div>


                                {/* STATUS */}

                                <div className="admin-order-status-control">

                                    <label
                                        htmlFor={`status-${order.id}`}
                                    >
                                        Update Status
                                    </label>

                                    <select
                                        id={`status-${order.id}`}
                                        value={
                                            order.status ||
                                            "PENDING"
                                        }
                                        disabled={
                                            updatingId === order.id ||
                                            order.status === "CANCELLED" ||
                                            order.status === "DELIVERED"
                                        }
                                        onChange={(event) =>
                                            handleStatusChange(
                                                order.id,
                                                event.target.value
                                            )
                                        }
                                    >

                                        <option value="PENDING">
                                            Pending
                                        </option>

                                        <option value="CONFIRMED">
                                            Confirmed
                                        </option>

                                        <option value="SHIPPED">
                                            Shipped
                                        </option>

                                        <option value="DELIVERED">
                                            Delivered
                                        </option>

                                        <option value="CANCELLED">
                                            Cancelled
                                        </option>

                                    </select>

                                    {updatingId === order.id && (

                                        <small>
                                            Updating...
                                        </small>

                                    )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default AdminOrders;