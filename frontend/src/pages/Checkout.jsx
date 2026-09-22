import { useEffect, useState } from "react";

import { getCart } from "../api/cartApi";
import { createOrder } from "../api/orderApi";
import { getAddresses } from "../api/addressApi";

import "./Checkout.css";

// =====================================================
// EMPTY FORM
// =====================================================

const emptyForm = {
    shippingFirstName: "",
    shippingLastName: "",
    shippingPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingPostalCode: "",
    shippingCountry: "India",
};


// =====================================================
// CHECKOUT
// =====================================================

function Checkout({ onNavigate }) {

    // =====================================================
    // CART
    // =====================================================

    const [cart, setCart] = useState(null);

    const [loadingCart, setLoadingCart] =
        useState(true);


    // =====================================================
    // ADDRESSES
    // =====================================================

    const [addresses, setAddresses] =
        useState([]);

    const [loadingAddresses, setLoadingAddresses] =
        useState(true);

    const [selectedAddressId, setSelectedAddressId] =
        useState(null);

    const [useNewAddress, setUseNewAddress] =
        useState(false);


    // =====================================================
    // ORDER
    // =====================================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState(false);


    // =====================================================
    // FORM
    // =====================================================

    const [form, setForm] =
        useState(emptyForm);


    // =====================================================
    // LOAD CHECKOUT DATA
    // =====================================================

    useEffect(() => {

        loadCheckoutData();

    }, []);


    async function loadCheckoutData() {

        setLoadingCart(true);
        setLoadingAddresses(true);
        setError("");

        try {

            const [
                cartData,
                addressData,
            ] = await Promise.all([
                getCart(),
                getAddresses(),
            ]);


            setCart(cartData);


            const savedAddresses =
                Array.isArray(addressData)
                    ? addressData
                    : [];

            setAddresses(savedAddresses);


            // -------------------------------------------------
            // SELECT DEFAULT ADDRESS
            // -------------------------------------------------

            const defaultAddress =
                savedAddresses.find(
                    (address) =>
                        address.isDefault
                );


            if (defaultAddress) {

                selectAddress(
                    defaultAddress
                );

            } else if (
                savedAddresses.length === 1
            ) {

                selectAddress(
                    savedAddresses[0]
                );

            } else {

                setUseNewAddress(true);

            }

        } catch (err) {

            console.error(
                "Checkout loading error:",
                err
            );

            setError(
                err?.message ||
                "Unable to load checkout."
            );

        } finally {

            setLoadingCart(false);
            setLoadingAddresses(false);

        }
    }


    // =====================================================
    // SELECT SAVED ADDRESS
    // =====================================================

    function selectAddress(address) {

        if (!address) {
            return;
        }


        setSelectedAddressId(
            address.id
        );

        setUseNewAddress(false);


        // -------------------------------------------------
        // Convert saved address to checkout form
        // -------------------------------------------------

        const nameParts =
            (address.fullName || "")
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        const firstName =
            nameParts.shift() || "";


        const lastName =
            nameParts.join(" ");


        setForm({

            shippingFirstName:
                firstName,

            shippingLastName:
                lastName,

            shippingPhone:
                address.phone || "",

            shippingAddressLine1:
                address.addressLine1 || "",

            shippingAddressLine2:
                address.addressLine2 || "",

            shippingCity:
                address.city || "",

            shippingState:
                address.state || "",

            shippingPostalCode:
                address.postalCode || "",

            shippingCountry:
                address.country || "India",

        });


        setError("");
        setSuccess(false);
    }


    // =====================================================
    // USE NEW ADDRESS
    // =====================================================

    function handleUseNewAddress() {

        setSelectedAddressId(null);

        setUseNewAddress(true);

        setForm({
            ...emptyForm,
        });

        setError("");
        setSuccess(false);
    }


    // =====================================================
    // FORM CHANGE
    // =====================================================

    function handleChange(event) {

        const {
            name,
            value,
        } = event.target;


        setForm((previous) => ({

            ...previous,

            [name]: value,

        }));


        setError("");
        setSuccess(false);


        // User is manually editing address,
        // so don't keep a saved address selected.

        if (
            selectedAddressId &&
            [
                "shippingFirstName",
                "shippingLastName",
                "shippingPhone",
                "shippingAddressLine1",
                "shippingAddressLine2",
                "shippingCity",
                "shippingState",
                "shippingPostalCode",
                "shippingCountry",
            ].includes(name)
        ) {

            setSelectedAddressId(null);
            setUseNewAddress(true);
        }
    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    function navigate(path) {

        if (onNavigate) {

            onNavigate(path);

            return;
        }

        window.location.href = path;
    }


    function goToCart() {

        navigate("/cart");
    }


    function goToProducts() {

        navigate("/");
    }


    function goToOrder(orderId) {

        if (!orderId) {
            navigate("/orders");
            return;
        }

        navigate(
            `/orders/${orderId}`
        );
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
    // VALIDATE FORM
    // =====================================================

    function validateForm() {

        const requiredFields = [

            [
                "shippingFirstName",
                "First name",
            ],

            [
                "shippingLastName",
                "Last name",
            ],

            [
                "shippingPhone",
                "Phone number",
            ],

            [
                "shippingAddressLine1",
                "Address",
            ],

            [
                "shippingCity",
                "City",
            ],

            [
                "shippingState",
                "State",
            ],

            [
                "shippingPostalCode",
                "PIN code",
            ],

            [
                "shippingCountry",
                "Country",
            ],

        ];


        for (
            const [field, label]
            of requiredFields
        ) {

            if (
                !form[field] ||
                !form[field].trim()
            ) {

                return (
                    `${label} is required.`
                );
            }
        }


        if (
            !/^\d{10}$/.test(
                form.shippingPhone.trim()
            )
        ) {

            return (
                "Please enter a valid 10-digit phone number."
            );
        }


        if (
            !/^\d{6}$/.test(
                form.shippingPostalCode.trim()
            )
        ) {

            return (
                "Please enter a valid 6-digit PIN code."
            );
        }


        return null;
    }


    // =====================================================
    // SUBMIT ORDER
    // =====================================================

    async function handleSubmit(event) {

        event.preventDefault();


        if (loading || success) {
            return;
        }


        setError("");


        // -------------------------------------------------
        // LOGIN
        // -------------------------------------------------

        const token =
            localStorage.getItem("token");


        if (!token) {

            setError(
                "Please login before placing your order."
            );

            return;
        }


        // -------------------------------------------------
        // CART
        // -------------------------------------------------

        const items =
            cart?.items || [];


        if (items.length === 0) {

            setError(
                "Your cart is empty."
            );

            return;
        }


        // -------------------------------------------------
        // FORM VALIDATION
        // -------------------------------------------------

        const validationError =
            validateForm();


        if (validationError) {

            setError(
                validationError
            );

            return;
        }


        // -------------------------------------------------
        // CREATE ORDER
        // -------------------------------------------------

        try {

            setLoading(true);


            const order =
                await createOrder({

                    shippingFirstName:
                        form.shippingFirstName.trim(),

                    shippingLastName:
                        form.shippingLastName.trim(),

                    shippingPhone:
                        form.shippingPhone.trim(),

                    shippingAddressLine1:
                        form.shippingAddressLine1.trim(),

                    shippingAddressLine2:
                        form.shippingAddressLine2.trim(),

                    shippingCity:
                        form.shippingCity.trim(),

                    shippingState:
                        form.shippingState.trim(),

                    shippingPostalCode:
                        form.shippingPostalCode.trim(),

                    shippingCountry:
                        form.shippingCountry.trim(),

                });


            console.log(
                "ORDER CREATED:",
                order
            );


            // -------------------------------------------------
            // SAVE LAST ORDER
            // -------------------------------------------------

            localStorage.setItem(
                "lastOrder",
                JSON.stringify(order)
            );


            setSuccess(true);


            // -------------------------------------------------
            // GO TO ORDER DETAILS
            // -------------------------------------------------

            setTimeout(() => {

                goToOrder(
                    order?.id
                );

            }, 800);


        } catch (err) {

            console.error(
                "Checkout error:",
                err
            );

            setError(
                err?.message ||
                "Unable to place order."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (
        loadingCart ||
        loadingAddresses
    ) {

        return (

            <div className="checkout-page">

                <div className="checkout-state">

                    <div className="loading-spinner"></div>

                    <h1>
                        Checkout
                    </h1>

                    <p>
                        Loading your order...
                    </p>

                </div>

            </div>

        );
    }


    // =====================================================
    // CART DATA
    // =====================================================

    const items =
        cart?.items || [];


    const totalItems =
        items.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    const subtotal =
        items.reduce(
            (total, item) =>
                total +
                Number(
                    item.price || 0
                ) *
                Number(
                    item.quantity || 0
                ),
            0
        );


    const shipping = 0;

    const total =
        subtotal + shipping;


    // =====================================================
    // EMPTY CART
    // =====================================================

    if (items.length === 0) {

        return (

            <div className="checkout-page">

                <div className="checkout-state">

                    <div className="cart-state-icon">
                        🛒
                    </div>

                    <p className="checkout-label">
                        CHECKOUT
                    </p>

                    <h1>
                        Your Cart is Empty
                    </h1>

                    <p>
                        Add products to your cart
                        before checking out.
                    </p>

                    <button
                        type="button"
                        className="checkout-primary-button"
                        onClick={goToProducts}
                    >
                        Start Shopping
                    </button>

                </div>

            </div>

        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="checkout-page">

            <div className="checkout-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="checkout-header">

                    <button
                        type="button"
                        className="back-button"
                        onClick={goToCart}
                    >
                        ← Back to Cart
                    </button>

                    <p className="checkout-label">
                        SECURE CHECKOUT
                    </p>

                    <h1>
                        Checkout
                    </h1>

                    <p>
                        Enter your delivery information
                        to place your order.
                    </p>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {success && (

                    <div className="success-message">
                        Order placed successfully!
                        Redirecting...
                    </div>

                )}


                {/* =================================================
                    SAVED ADDRESSES
                ================================================= */}

                {addresses.length > 0 && (

                    <section className="checkout-address-section">

                        <div className="checkout-card-header">

                            <p>
                                DELIVERY ADDRESS
                            </p>

                            <h2>
                                Select an Address
                            </h2>

                        </div>


                        <div className="checkout-address-grid">

                            {addresses.map(
                                (address) => (

                                    <button
                                        type="button"
                                        key={address.id}
                                        className={
                                            "checkout-address-card" +
                                            (
                                                selectedAddressId ===
                                                address.id
                                                    ? " selected"
                                                    : ""
                                            )
                                        }
                                        onClick={() =>
                                            selectAddress(
                                                address
                                            )
                                        }
                                    >

                                        <div className="checkout-address-card-header">

                                            <strong>
                                                {address.addressType}
                                            </strong>

                                            {address.isDefault && (

                                                <span className="default-badge">
                                                    DEFAULT
                                                </span>

                                            )}

                                        </div>


                                        <strong>
                                            {address.fullName}
                                        </strong>


                                        <span>
                                            {address.phone}
                                        </span>


                                        <span>
                                            {address.addressLine1}
                                        </span>


                                        {address.addressLine2 && (

                                            <span>
                                                {
                                                    address.addressLine2
                                                }
                                            </span>

                                        )}


                                        <span>
                                            {address.city},{" "}
                                            {address.state}
                                            {" - "}
                                            {
                                                address.postalCode
                                            }
                                        </span>


                                        <span>
                                            {
                                                address.country
                                            }
                                        </span>


                                        {selectedAddressId ===
                                            address.id && (

                                            <span className="selected-address">
                                                ✓ Selected
                                            </span>

                                        )}

                                    </button>

                                )
                            )}


                            {/* NEW ADDRESS */}

                            <button
                                type="button"
                                className={
                                    "checkout-address-card new-address" +
                                    (
                                        useNewAddress
                                            ? " selected"
                                            : ""
                                    )
                                }
                                onClick={
                                    handleUseNewAddress
                                }
                            >

                                <span className="new-address-icon">
                                    +
                                </span>

                                <strong>
                                    Use New Address
                                </strong>

                                <span>
                                    Enter a different
                                    delivery address
                                </span>

                            </button>

                        </div>

                    </section>

                )}


                {/* =================================================
                    CHECKOUT LAYOUT
                ================================================= */}

                <div className="checkout-layout">


                    {/* =================================================
                        SHIPPING FORM
                    ================================================= */}

                    <section className="checkout-form-card">

                        <div className="checkout-card-header">

                            <p>
                                DELIVERY
                            </p>

                            <h2>
                                Shipping Information
                            </h2>

                        </div>


                        <form
                            className="checkout-form"
                            onSubmit={
                                handleSubmit
                            }
                        >


                            {/* NAME */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        First Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="shippingFirstName"
                                        value={
                                            form.shippingFirstName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter first name"
                                        autoComplete="given-name"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Last Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="shippingLastName"
                                        value={
                                            form.shippingLastName
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter last name"
                                        autoComplete="family-name"
                                        required
                                    />

                                </div>

                            </div>


                            {/* PHONE */}

                            <div className="form-group">

                                <label>
                                    Phone Number *
                                </label>

                                <input
                                    type="tel"
                                    name="shippingPhone"
                                    value={
                                        form.shippingPhone
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="10-digit phone number"
                                    maxLength="10"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    required
                                />

                            </div>


                            {/* ADDRESS LINE 1 */}

                            <div className="form-group">

                                <label>
                                    Address Line 1 *
                                </label>

                                <input
                                    type="text"
                                    name="shippingAddressLine1"
                                    value={
                                        form.shippingAddressLine1
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="House / Flat / Street"
                                    autoComplete="street-address"
                                    required
                                />

                            </div>


                            {/* ADDRESS LINE 2 */}

                            <div className="form-group">

                                <label>

                                    Address Line 2

                                    <span className="optional">
                                        Optional
                                    </span>

                                </label>

                                <input
                                    type="text"
                                    name="shippingAddressLine2"
                                    value={
                                        form.shippingAddressLine2
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Apartment, landmark, etc."
                                />

                            </div>


                            {/* CITY / STATE */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        City *
                                    </label>

                                    <input
                                        type="text"
                                        name="shippingCity"
                                        value={
                                            form.shippingCity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="City"
                                        autoComplete="address-level2"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        State *
                                    </label>

                                    <input
                                        type="text"
                                        name="shippingState"
                                        value={
                                            form.shippingState
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="State"
                                        autoComplete="address-level1"
                                        required
                                    />

                                </div>

                            </div>


                            {/* PIN / COUNTRY */}

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        PIN Code *
                                    </label>

                                    <input
                                        type="text"
                                        name="shippingPostalCode"
                                        value={
                                            form.shippingPostalCode
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="6-digit PIN code"
                                        maxLength="6"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Country *
                                    </label>

                                    <input
                                        type="text"
                                        name="shippingCountry"
                                        value={
                                            form.shippingCountry
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        autoComplete="country-name"
                                        required
                                    />

                                </div>

                            </div>


                            {/* PLACE ORDER */}

                            <button
                                type="submit"
                                className="checkout-submit"
                                disabled={
                                    loading ||
                                    success
                                }
                            >

                                {loading

                                    ? "Placing Order..."

                                    : success

                                        ? "Order Placed ✓"

                                        : "Place Order →"

                                }

                            </button>

                        </form>

                    </section>


                    {/* =================================================
                        ORDER SUMMARY
                    ================================================= */}

                    <aside className="checkout-summary">

                        <div className="checkout-card-header">

                            <p>
                                ORDER SUMMARY
                            </p>

                            <h2>
                                Your Order
                            </h2>

                        </div>


                        {/* ITEMS */}

                        <div className="checkout-summary-items">

                            {items.map(
                                (item) => (

                                    <div
                                        className="checkout-summary-item"
                                        key={
                                            item.productId
                                        }
                                    >

                                        <div className="checkout-summary-image">

                                            {item.imageUrl ? (

                                                <img
                                                    src={
                                                        item.imageUrl
                                                    }
                                                    alt={
                                                        item.productName
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    📦
                                                </span>

                                            )}

                                        </div>


                                        <div className="checkout-summary-info">

                                            <strong>
                                                {
                                                    item.productName
                                                }
                                            </strong>

                                            <span>
                                                Qty:{" "}
                                                {
                                                    item.quantity
                                                }
                                            </span>

                                        </div>


                                        <strong>

                                            ₹
                                            {formatPrice(
                                                Number(
                                                    item.price || 0
                                                ) *
                                                Number(
                                                    item.quantity || 0
                                                )
                                            )}

                                        </strong>

                                    </div>

                                )
                            )}

                        </div>


                        {/* SUMMARY */}

                        <div className="checkout-summary-divider"></div>


                        <div className="checkout-summary-row">

                            <span>
                                Items
                            </span>

                            <strong>
                                {totalItems}
                            </strong>

                        </div>


                        <div className="checkout-summary-row">

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


                        <div className="checkout-summary-row">

                            <span>
                                Shipping
                            </span>

                            <strong>
                                Free
                            </strong>

                        </div>


                        <div className="checkout-summary-divider"></div>


                        <div className="checkout-summary-total">

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


                        {/* SECURITY */}

                        <div className="checkout-security">

                            <span>
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Secure Checkout
                                </strong>

                                <p>
                                    Your order will be
                                    securely processed.
                                </p>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </div>

    );
}


export default Checkout;