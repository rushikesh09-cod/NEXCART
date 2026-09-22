import { useEffect, useState } from "react";

import {
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
} from "../api/cartApi";

function Cart({ onNavigate }) {

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);


    // =====================================================
    // LOAD CART
    // =====================================================

    async function loadCart() {

        try {

            setLoading(true);
            setError("");

            const data = await getCart();

            setCart(data);

        } catch (err) {

            console.error(
                "Unable to load cart:",
                err
            );

            setError(
                err.message ||
                "Unable to load cart"
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {

        loadCart();

    }, []);


    // =====================================================
    // UPDATE ONLY ONE ITEM
    //
    // This is important.
    //
    // We DO NOT replace the entire cart item array
    // because the backend may return the products in
    // a different order after quantity update.
    // =====================================================

    function updateCartItemWithoutReordering(
        updatedCart,
        productId
    ) {

        setCart((previousCart) => {

            if (
                !previousCart ||
                !Array.isArray(previousCart.items) ||
                !Array.isArray(updatedCart?.items)
            ) {
                return updatedCart;
            }


            const updatedItem =
                updatedCart.items.find(
                    (item) =>
                        String(item.productId) ===
                        String(productId)
                );


            if (!updatedItem) {

                return updatedCart;

            }


            const newItems =
                previousCart.items.map(
                    (item) => {

                        if (
                            String(item.productId) ===
                            String(productId)
                        ) {

                            return updatedItem;

                        }

                        return item;

                    }
                );


            return {
                ...updatedCart,
                items: newItems,
            };

        });
    }


    // =====================================================
    // INCREASE QUANTITY
    // =====================================================

    async function handleIncrease(item) {

        if (updating !== null) {
            return;
        }


        try {

            setUpdating(item.productId);
            setError("");


            const newQuantity =
                Number(item.quantity) + 1;


            const updatedCart =
                await updateCartQuantity(
                    item.productId,
                    newQuantity
                );


            // IMPORTANT:
            // Update only this item.
            // Do not replace the complete item order.
            updateCartItemWithoutReordering(
                updatedCart,
                item.productId
            );


        } catch (err) {

            console.error(
                "Unable to increase quantity:",
                err
            );

            setError(
                err.message ||
                "Unable to update quantity"
            );

        } finally {

            setUpdating(null);

        }
    }


    // =====================================================
    // DECREASE QUANTITY
    // =====================================================

    async function handleDecrease(item) {

        if (
            Number(item.quantity) <= 1 ||
            updating !== null
        ) {
            return;
        }


        try {

            setUpdating(item.productId);
            setError("");


            const newQuantity =
                Number(item.quantity) - 1;


            const updatedCart =
                await updateCartQuantity(
                    item.productId,
                    newQuantity
                );


            // IMPORTANT:
            // Keep product in exactly the same position.
            updateCartItemWithoutReordering(
                updatedCart,
                item.productId
            );


        } catch (err) {

            console.error(
                "Unable to decrease quantity:",
                err
            );

            setError(
                err.message ||
                "Unable to update quantity"
            );

        } finally {

            setUpdating(null);

        }
    }


    // =====================================================
    // REMOVE ITEM
    // =====================================================

    async function handleRemove(productId) {

        if (updating !== null) {
            return;
        }


        try {

            setUpdating(productId);
            setError("");


            await removeFromCart(
                productId
            );


            // Removing an item can safely reload
            // the cart because that item is supposed
            // to disappear anyway.
            await loadCart();


        } catch (err) {

            console.error(
                "Unable to remove item:",
                err
            );

            setError(
                err.message ||
                "Unable to remove item"
            );

        } finally {

            setUpdating(null);

        }
    }


    // =====================================================
    // CLEAR CART
    // =====================================================

    async function handleClearCart() {

        if (updating !== null) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to clear your cart?"
            );


        if (!confirmed) {
            return;
        }


        try {

            setUpdating("clear");
            setError("");


            await clearCart();


            await loadCart();


        } catch (err) {

            console.error(
                "Unable to clear cart:",
                err
            );

            setError(
                err.message ||
                "Unable to clear cart"
            );

        } finally {

            setUpdating(null);

        }
    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    function handleCheckout() {

        if (onNavigate) {

            onNavigate("/checkout");

        } else {

            window.location.href =
                "/checkout";

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
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="cart-page">

                <div className="cart-state-card">

                    <div className="loading-spinner"></div>

                    <h1>
                        Your Cart
                    </h1>

                    <p>
                        Loading your cart...
                    </p>

                </div>

            </div>

        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error && !cart) {

        return (

            <div className="cart-page">

                <div className="cart-state-card">

                    <div className="cart-state-icon">
                        !
                    </div>

                    <h1>
                        Unable to Load Cart
                    </h1>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="cart-primary-button"
                        onClick={loadCart}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );
    }


    // =====================================================
    // CART DATA
    // =====================================================

    const items =
        cart?.items || [];


    // =====================================================
    // CALCULATE TOTAL ITEMS
    // =====================================================

    const totalItems =
        items.reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        );


    // =====================================================
    // CALCULATE SUBTOTAL
    // =====================================================

    const subtotal =
        items.reduce(
            (total, item) =>
                total +
                Number(item.price || 0) *
                Number(item.quantity || 0),
            0
        );


    const shipping = 0;

    const total =
        subtotal + shipping;


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
    // EMPTY CART
    // =====================================================

    if (items.length === 0) {

        return (

            <div className="cart-page">

                <div className="cart-container">

                    <div className="cart-empty-card">

                        <div className="cart-empty-icon">
                            🛒
                        </div>

                        <p className="cart-label">
                            SHOPPING CART
                        </p>

                        <h1>
                            Your Cart is Empty
                        </h1>

                        <p className="cart-empty-text">
                            You haven't added anything
                            to your cart yet.
                        </p>

                        <button
                            type="button"
                            className="cart-primary-button"
                            onClick={
                                handleContinueShopping
                            }
                        >
                            Start Shopping
                        </button>

                    </div>

                </div>

            </div>

        );
    }


    // =====================================================
    // MAIN CART
    // =====================================================

    return (

        <div className="cart-page">

            <div className="cart-container">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="cart-header">

                    <div>

                        <p className="cart-label">
                            SHOPPING CART
                        </p>

                        <h1>
                            Your Cart
                        </h1>

                        <p className="cart-subtitle">
                            Review your items before
                            proceeding to checkout.
                        </p>

                    </div>


                    <div className="cart-count">

                        <span className="cart-count-number">
                            {totalItems}
                        </span>

                        <span>
                            {totalItems === 1
                                ? "Item"
                                : "Items"}
                        </span>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="cart-inline-error">

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* =================================================
                    CART LAYOUT
                ================================================= */}

                <div className="cart-layout">


                    {/* =================================================
                        LEFT - CART ITEMS
                    ================================================= */}

                    <section className="cart-items-section">

                        <div className="cart-section-heading">

                            <div>

                                <h2>
                                    Cart Items
                                </h2>

                                <p>
                                    {items.length}{" "}
                                    {items.length === 1
                                        ? "product"
                                        : "products"}
                                </p>

                            </div>


                            <button
                                type="button"
                                className="clear-cart-button"
                                onClick={
                                    handleClearCart
                                }
                                disabled={
                                    updating !== null
                                }
                            >
                                {updating === "clear"
                                    ? "Clearing..."
                                    : "Clear Cart"}
                            </button>

                        </div>


                        <div className="cart-items">

                            {items.map((item) => {

                                const itemTotal =
                                    Number(
                                        item.price || 0
                                    ) *
                                    Number(
                                        item.quantity || 0
                                    );


                                const isUpdating =
                                    updating ===
                                    item.productId;


                                return (

                                    <article
                                        className="cart-item"
                                        key={item.productId}
                                    >

                                        {/* PRODUCT IMAGE */}

                                        <div className="cart-item-image">

                                            {item.imageUrl ? (

                                                <img
                                                    src={
                                                        item.imageUrl
                                                    }
                                                    alt={
                                                        item.productName
                                                    }
                                                    onError={(
                                                        event
                                                    ) => {

                                                        event
                                                            .currentTarget
                                                            .style
                                                            .display =
                                                            "none";

                                                    }}
                                                />

                                            ) : (

                                                <div className="cart-image-placeholder">

                                                    <span>
                                                        {item.brand ||
                                                            "PRODUCT"}
                                                    </span>

                                                </div>

                                            )}

                                        </div>


                                        {/* PRODUCT INFORMATION */}

                                        <div className="cart-item-info">

                                            <p className="cart-item-brand">
                                                {item.brand ||
                                                    "NEXCART"}
                                            </p>

                                            <h2>
                                                {
                                                    item.productName
                                                }
                                            </h2>

                                            <p className="cart-unit-price">
                                                ₹
                                                {formatPrice(
                                                    item.price
                                                )}{" "}
                                                per item
                                            </p>


                                            {/* QUANTITY */}

                                            <div className="cart-item-actions">

                                                <div className="quantity-control">

                                                    <button
                                                        type="button"
                                                        className="quantity-button"
                                                        onClick={() =>
                                                            handleDecrease(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating ||
                                                            Number(
                                                                item.quantity
                                                            ) <= 1
                                                        }
                                                        aria-label="Decrease quantity"
                                                    >
                                                        −
                                                    </button>


                                                    <span className="quantity-number">
                                                        {
                                                            item.quantity
                                                        }
                                                    </span>


                                                    <button
                                                        type="button"
                                                        className="quantity-button"
                                                        onClick={() =>
                                                            handleIncrease(
                                                                item
                                                            )
                                                        }
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        aria-label="Increase quantity"
                                                    >
                                                        +
                                                    </button>

                                                </div>


                                                <button
                                                    type="button"
                                                    className="remove-button"
                                                    onClick={() =>
                                                        handleRemove(
                                                            item.productId
                                                        )
                                                    }
                                                    disabled={
                                                        isUpdating ||
                                                        updating ===
                                                            "clear"
                                                    }
                                                >
                                                    {isUpdating
                                                        ? "Removing..."
                                                        : "Remove"}
                                                </button>

                                            </div>

                                        </div>


                                        {/* ITEM TOTAL */}

                                        <div className="cart-item-total">

                                            <span>
                                                Item Total
                                            </span>

                                            <strong>
                                                ₹
                                                {formatPrice(
                                                    itemTotal
                                                )}
                                            </strong>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    </section>


                    {/* =================================================
                        RIGHT - ORDER SUMMARY
                    ================================================= */}

                    <aside className="cart-summary">

                        <div className="summary-heading">

                            <div>

                                <p>
                                    ORDER SUMMARY
                                </p>

                                <h2>
                                    Your Order
                                </h2>

                            </div>

                        </div>


                        <div className="summary-content">

                            <div className="summary-row">

                                <span>
                                    Items
                                </span>

                                <strong>
                                    {totalItems}
                                </strong>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {formatPrice(
                                        subtotal
                                    )}
                                </strong>

                            </div>


                            <div className="summary-row">

                                <span>
                                    Shipping
                                </span>

                                <strong className="free-shipping">
                                    Free
                                </strong>

                            </div>


                            <div className="summary-divider"></div>


                            <div className="summary-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹
                                    {formatPrice(
                                        total
                                    )}
                                </strong>

                            </div>


                            <button
                                type="button"
                                className="checkout-button"
                                onClick={
                                    handleCheckout
                                }
                            >
                                Proceed to Checkout

                                <span>
                                    →
                                </span>

                            </button>


                            <button
                                type="button"
                                className="continue-shopping-link"
                                onClick={
                                    handleContinueShopping
                                }
                            >
                                ← Continue Shopping
                            </button>

                        </div>


                        {/* =================================================
                            TRUST INFORMATION
                        ================================================= */}

                        <div className="cart-trust">

                            <div className="trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Secure Checkout
                                    </strong>

                                    <p>
                                        Your order is protected
                                    </p>

                                </div>

                            </div>


                            <div className="trust-item">

                                <span className="trust-icon">
                                    ✓
                                </span>

                                <div>

                                    <strong>
                                        Free Shipping
                                    </strong>

                                    <p>
                                        No additional delivery
                                        charges
                                    </p>

                                </div>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>

    );
}

export default Cart;