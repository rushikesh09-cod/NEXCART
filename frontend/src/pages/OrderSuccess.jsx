import { useEffect, useState } from "react";

function OrderSuccess({ onNavigate }) {

    const [order, setOrder] =
        useState(null);


    useEffect(() => {

        const savedOrder =
            localStorage.getItem("lastOrder");

        if (savedOrder) {

            try {

                setOrder(
                    JSON.parse(savedOrder)
                );

            } catch (error) {

                console.error(
                    "Unable to read saved order:",
                    error
                );

            }

        }

    }, []);


    function goToOrders() {

        if (onNavigate) {

            onNavigate("/orders");

        } else {

            window.location.href =
                "/orders";

        }
    }


    function goToProducts() {

        if (onNavigate) {

            onNavigate("/");

        } else {

            window.location.href =
                "/";

        }
    }


    function formatPrice(value) {

        return Number(
            value || 0
        ).toLocaleString(
            "en-IN"
        );

    }


    return (

        <div className="order-success-page">

            <div className="order-success-container">


                {/* =================================================
                    SUCCESS ICON
                ================================================= */}

                <div className="order-success-icon">
                    ✓
                </div>


                {/* =================================================
                    MESSAGE
                ================================================= */}

                <p className="order-success-label">
                    ORDER CONFIRMED
                </p>

                <h1>
                    Thank You for Your Order!
                </h1>

                <p className="order-success-message">
                    Your order has been placed
                    successfully.
                </p>


                {/* =================================================
                    ORDER INFO
                ================================================= */}

                {order && (

                    <div className="order-success-card">

                        <div className="order-success-row">

                            <span>
                                Order ID
                            </span>

                            <strong>
                                #{String(
                                    order.id
                                ).slice(0, 8)}
                            </strong>

                        </div>


                        <div className="order-success-row">

                            <span>
                                Status
                            </span>

                            <strong>
                                {order.status}
                            </strong>

                        </div>


                        <div className="order-success-row">

                            <span>
                                Items
                            </span>

                            <strong>
                                {order.items?.reduce(
                                    (
                                        total,
                                        item
                                    ) =>
                                        total +
                                        Number(
                                            item.quantity || 0
                                        ),
                                    0
                                )}
                            </strong>

                        </div>


                        <div className="order-success-divider"></div>


                        <div className="order-success-total">

                            <span>
                                Total
                            </span>

                            <strong>
                                ₹
                                {formatPrice(
                                    order.totalAmount
                                )}
                            </strong>

                        </div>

                    </div>

                )}


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="order-success-actions">

                    <button
                        type="button"
                        className="order-success-primary"
                        onClick={
                            goToOrders
                        }
                    >
                        View My Orders
                    </button>


                    <button
                        type="button"
                        className="order-success-secondary"
                        onClick={
                            goToProducts
                        }
                    >
                        Continue Shopping
                    </button>

                </div>

            </div>

        </div>

    );
}

export default OrderSuccess;