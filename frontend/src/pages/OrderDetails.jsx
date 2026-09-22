import { useEffect, useState } from "react";

import {
    getOrder,
    cancelOrder,
} from "../api/orderApi";


function OrderDetails({
    orderId,
    onNavigate,
}) {

    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [cancelling, setCancelling] =
        useState(false);

    const [error, setError] =
        useState("");

    const [cancelMessage, setCancelMessage] =
        useState("");


    // =====================================================
    // LOAD ORDER
    // =====================================================

    async function loadOrder() {

        try {

            setLoading(true);
            setError("");
            setCancelMessage("");

            if (!orderId) {

                throw new Error(
                    "Order ID is missing"
                );
            }

            const data =
                await getOrder(orderId);

            setOrder(data);

        } catch (err) {

            console.error(
                "Unable to load order:",
                err
            );

            setError(
                err.message ||
                "Unable to load order."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // LOAD WHEN ORDER ID CHANGES
    // =====================================================

    useEffect(() => {

        loadOrder();

    }, [orderId]);


    // =====================================================
    // NAVIGATION
    // =====================================================

    function handleBackToOrders() {

        if (onNavigate) {

            onNavigate("/orders");

        } else {

            window.location.href =
                "/orders";
        }
    }


    function handleContinueShopping() {

        if (onNavigate) {

            onNavigate("/");

        } else {

            window.location.href =
                "/";
        }
    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    async function handleCancelOrder() {

        if (
            cancelling ||
            !order?.id
        ) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this order?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setCancelling(true);
            setError("");
            setCancelMessage("");


            const updatedOrder =
                await cancelOrder(
                    order.id
                );


            setOrder(
                updatedOrder
            );


            setCancelMessage(
                "Order cancelled successfully."
            );

        } catch (err) {

            console.error(
                "Cancel order error:",
                err
            );


            setError(
                err.message ||
                "Unable to cancel order."
            );

        } finally {

            setCancelling(false);
        }
    }


    // =====================================================
    // FORMAT PRICE
    // =====================================================

    function formatPrice(value) {

        return Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        );
    }


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(dateString) {

        if (!dateString) {
            return "-";
        }


        const date =
            new Date(dateString);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
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

            <div className="order-details-page">

                <div className="orders-loading">

                    <div className="loading-spinner">
                    </div>

                    <h1>
                        Order Details
                    </h1>

                    <p>
                        Loading order...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !order) {

        return (

            <div className="order-details-page">

                <div className="orders-error">

                    <h1>
                        Order Details
                    </h1>


                    <div className="error-message">
                        {error}
                    </div>


                    <div className="error-actions">

                        <button
                            type="button"
                            className="primary-button"
                            onClick={loadOrder}
                        >
                            Try Again
                        </button>


                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                handleBackToOrders
                            }
                        >
                            ← Back to Orders
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // SAFETY CHECK
    // =====================================================

    if (!order) {
        return null;
    }


    // =====================================================
    // ORDER DATA
    // =====================================================

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    const totalItems =
        items.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    const status =
        String(
            order.status || ""
        ).toLowerCase();


    const canCancel =
        status === "pending";


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="order-details-page">

            <div className="order-details-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="order-details-header">

                    <button
                        type="button"
                        className="back-button"
                        onClick={
                            handleBackToOrders
                        }
                    >
                        ← Back to Orders
                    </button>


                    <p className="orders-label">
                        ORDER DETAILS
                    </p>


                    <h1>
                        Order #
                        {getShortOrderId(
                            order.id
                        )}
                    </h1>


                    <div className="order-status-row">

                        <span>
                            Status
                        </span>


                        <strong
                            className={
                                `status-badge ${status}`
                            }
                        >
                            {order.status}
                        </strong>

                    </div>

                </div>


                {/* =================================================
                    MESSAGES
                ================================================= */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {cancelMessage && (

                    <div className="success-message">
                        {cancelMessage}
                    </div>

                )}


                {/* =================================================
                    MAIN LAYOUT
                ================================================= */}

                <div className="order-details-layout">


                    {/* =================================================
                        LEFT SIDE
                    ================================================= */}

                    <div className="order-details-main">


                        {/* =================================================
                            ORDER INFORMATION
                        ================================================= */}

                        <div className="details-card">

                            <h2>
                                Order Information
                            </h2>


                            <div className="details-grid">


                                {/* ORDER ID */}

                                <div>

                                    <span>
                                        Order ID
                                    </span>

                                    <strong>
                                        {order.id}
                                    </strong>

                                </div>


                                {/* ORDER DATE */}

                                <div>

                                    <span>
                                        Order Date
                                    </span>

                                    <strong>
                                        {
                                            formatDate(
                                                order.createdAt
                                            )
                                        }
                                    </strong>

                                </div>


                                {/* ITEMS */}

                                <div>

                                    <span>
                                        Items
                                    </span>

                                    <strong>
                                        {totalItems}
                                    </strong>

                                </div>


                                {/* STATUS */}

                                <div>

                                    <span>
                                        Status
                                    </span>

                                    <strong>
                                        {order.status}
                                    </strong>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            SHIPPING INFORMATION
                        ================================================= */}

                        <div className="details-card">

                            <h2>
                                Shipping Information
                            </h2>


                            <div className="shipping-address">

                                <strong>

                                    {
                                        order.shippingFirstName
                                    }{" "}

                                    {
                                        order.shippingLastName
                                    }

                                </strong>


                                <p>
                                    {
                                        order.shippingPhone
                                    }
                                </p>


                                <p>
                                    {
                                        order.shippingAddressLine1
                                    }
                                </p>


                                {order.shippingAddressLine2 && (

                                    <p>
                                        {
                                            order.shippingAddressLine2
                                        }
                                    </p>

                                )}


                                <p>

                                    {
                                        order.shippingCity
                                    },{" "}

                                    {
                                        order.shippingState
                                    }

                                </p>


                                <p>
                                    {
                                        order.shippingPostalCode
                                    }
                                </p>


                                <p>
                                    {
                                        order.shippingCountry
                                    }
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            ORDER ITEMS
                        ================================================= */}

                        <div className="details-card">

                            <h2>
                                Ordered Products
                            </h2>


                            {items.length === 0 ? (

                                <p>
                                    No products found
                                    for this order.
                                </p>

                            ) : (

                                <div className="order-detail-items">

                                    {items.map(
                                        (item) => (

                                            <div
                                                className="order-detail-item"
                                                key={
                                                    item.id
                                                }
                                            >


                                                {/* PRODUCT INFO */}

                                                <div className="order-detail-item-info">

                                                    <h3>
                                                        {
                                                            item.productName
                                                        }
                                                    </h3>


                                                    {item.brand && (

                                                        <p>
                                                            {
                                                                item.brand
                                                            }
                                                        </p>

                                                    )}


                                                    <span>

                                                        ₹
                                                        {
                                                            formatPrice(
                                                                item.price
                                                            )
                                                        }

                                                        {" "}×{" "}

                                                        {
                                                            item.quantity
                                                        }

                                                    </span>

                                                </div>


                                                {/* SUBTOTAL */}

                                                <strong>

                                                    ₹
                                                    {
                                                        formatPrice(
                                                            item.subtotal
                                                        )
                                                    }

                                                </strong>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =================================================
                        RIGHT SIDEBAR
                    ================================================= */}

                    <div className="order-details-sidebar">


                        {/* =================================================
                            ORDER SUMMARY
                        ================================================= */}

                        <div className="details-card order-summary-card">

                            <h2>
                                Order Summary
                            </h2>


                            <div className="summary-row">

                                <span>
                                    Items
                                </span>

                                <span>
                                    {totalItems}
                                </span>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Subtotal
                                </span>

                                <span>

                                    ₹
                                    {
                                        formatPrice(
                                            order.totalAmount
                                        )
                                    }

                                </span>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Shipping
                                </span>

                                <span>
                                    Free
                                </span>

                            </div>


                            <hr />


                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>

                                    ₹
                                    {
                                        formatPrice(
                                            order.totalAmount
                                        )
                                    }

                                </strong>

                            </div>

                        </div>


                        {/* =================================================
                            CANCEL ORDER
                        ================================================= */}

                        {canCancel && (

                            <button
                                type="button"
                                className="cancel-order-button"
                                onClick={
                                    handleCancelOrder
                                }
                                disabled={
                                    cancelling
                                }
                            >

                                {cancelling

                                    ? "Cancelling..."

                                    : "Cancel Order"

                                }

                            </button>

                        )}


                        {/* =================================================
                            CONTINUE SHOPPING
                        ================================================= */}

                        <button
                            type="button"
                            className="continue-shopping-button"
                            onClick={
                                handleContinueShopping
                            }
                        >
                            Continue Shopping
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}


export default OrderDetails;