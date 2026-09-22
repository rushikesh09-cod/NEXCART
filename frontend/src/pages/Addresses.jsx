import { useEffect, useState } from "react";

import {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
} from "../api/addressApi";

import "./Addresses.css";


// =====================================================
// CONSTANTS
// =====================================================

const EMPTY_FORM = {
    addressType: "HOME",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
};


// =====================================================
// ADDRESS TYPE HELPERS
// =====================================================

function normalizeAddressType(value) {
    const type = String(value || "").trim().toUpperCase();

    if (type === "WORK") {
        return "WORK";
    }

    if (type === "OTHER") {
        return "OTHER";
    }

    return "HOME";
}


function getAddressTypeLabel(value) {
    const type = normalizeAddressType(value);

    if (type === "WORK") {
        return "Work";
    }

    if (type === "OTHER") {
        return "Other";
    }

    return "Home";
}


function getAddressTypeIcon(value) {
    const type = normalizeAddressType(value);

    if (type === "WORK") {
        return "💼";
    }

    if (type === "OTHER") {
        return "📍";
    }

    return "🏠";
}


// =====================================================
// ADDRESSES PAGE
// =====================================================

function Addresses({ onNavigate }) {

    // =====================================================
    // STATE
    // =====================================================

    const [addresses, setAddresses] = useState([]);

    const [form, setForm] = useState({
        ...EMPTY_FORM,
    });

    const [editingId, setEditingId] = useState(null);

    const [showForm, setShowForm] = useState(false);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");


    // =====================================================
    // LOAD ADDRESSES
    // =====================================================

    useEffect(() => {
        loadAddresses();
    }, []);


    async function loadAddresses() {
        setLoading(true);
        setError("");

        try {
            const data = await getAddresses();

            setAddresses(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {
            console.error("Load addresses error:", err);

            setError(
                err?.message ||
                "Unable to load addresses."
            );

        } finally {
            setLoading(false);
        }
    }


    // =====================================================
    // FORM CHANGE
    // =====================================================

    function handleChange(event) {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));

        setError("");
        setSuccess("");
    }


    // =====================================================
    // ADD ADDRESS
    // =====================================================

    function handleAddAddress() {
        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });

        setShowForm(true);

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }


    // =====================================================
    // EDIT ADDRESS
    // =====================================================

    function handleEdit(address) {
        setEditingId(address.id);

        setForm({
            addressType: normalizeAddressType(
                address.addressType
            ),

            fullName:
                address.fullName || "",

            phone:
                address.phone || "",

            addressLine1:
                address.addressLine1 || "",

            addressLine2:
                address.addressLine2 || "",

            city:
                address.city || "",

            state:
                address.state || "",

            postalCode:
                address.postalCode || "",

            country:
                address.country || "India",

            isDefault:
                Boolean(address.isDefault),
        });

        setShowForm(true);

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }


    // =====================================================
    // CANCEL
    // =====================================================

    function handleCancel() {
        setEditingId(null);

        setForm({
            ...EMPTY_FORM,
        });

        setShowForm(false);

        setError("");
        setSuccess("");
    }


    // =====================================================
    // VALIDATE FORM
    // =====================================================

    function validateForm() {

        if (!form.addressType) {
            return "Please select an address type.";
        }

        if (!form.fullName.trim()) {
            return "Full name is required.";
        }

        if (!/^\d{10}$/.test(form.phone.trim())) {
            return "Phone number must be exactly 10 digits.";
        }

        if (!form.addressLine1.trim()) {
            return "Address Line 1 is required.";
        }

        if (!form.city.trim()) {
            return "City is required.";
        }

        if (!form.state.trim()) {
            return "State is required.";
        }

        if (!/^\d{6}$/.test(form.postalCode.trim())) {
            return "PIN code must be exactly 6 digits.";
        }

        if (!form.country.trim()) {
            return "Country is required.";
        }

        return null;
    }


    // =====================================================
    // CREATE PAYLOAD
    // =====================================================

    function createPayload() {
        return {
            // IMPORTANT:
            // Database accepts HOME / WORK / OTHER
            addressType: normalizeAddressType(
                form.addressType
            ),

            fullName:
                form.fullName.trim(),

            phone:
                form.phone.trim(),

            addressLine1:
                form.addressLine1.trim(),

            addressLine2:
                form.addressLine2.trim()
                    ? form.addressLine2.trim()
                    : null,

            city:
                form.city.trim(),

            state:
                form.state.trim(),

            postalCode:
                form.postalCode.trim(),

            country:
                form.country.trim(),

            isDefault:
                Boolean(form.isDefault),
        };
    }


    // =====================================================
    // SAVE ADDRESS
    // =====================================================

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        try {
            const payload = createPayload();

            if (editingId) {

                await updateAddress(
                    editingId,
                    payload
                );

                setSuccess(
                    "Address updated successfully."
                );

            } else {

                await addAddress(payload);

                setSuccess(
                    "Address added successfully."
                );
            }

            setEditingId(null);

            setForm({
                ...EMPTY_FORM,
            });

            setShowForm(false);

            await loadAddresses();

        } catch (err) {
            console.error("Save address error:", err);

            setError(
                err?.message ||
                "Unable to save address."
            );

        } finally {
            setSaving(false);
        }
    }


    // =====================================================
    // DELETE ADDRESS
    // =====================================================

    async function handleDelete(addressId) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) {
            return;
        }

        setDeletingId(addressId);

        setError("");
        setSuccess("");

        try {
            await deleteAddress(addressId);

            setAddresses((previous) =>
                previous.filter(
                    (address) =>
                        address.id !== addressId
                )
            );

            setSuccess(
                "Address deleted successfully."
            );

        } catch (err) {
            console.error(
                "Delete address error:",
                err
            );

            setError(
                err?.message ||
                "Unable to delete address."
            );

        } finally {
            setDeletingId(null);
        }
    }


    // =====================================================
    // SET DEFAULT ADDRESS
    // =====================================================

    async function handleSetDefault(address) {

        if (address.isDefault) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            const payload = {
                addressType: normalizeAddressType(
                    address.addressType
                ),

                fullName:
                    address.fullName,

                phone:
                    address.phone,

                addressLine1:
                    address.addressLine1,

                addressLine2:
                    address.addressLine2 || null,

                city:
                    address.city,

                state:
                    address.state,

                postalCode:
                    address.postalCode,

                country:
                    address.country,

                isDefault: true,
            };

            await updateAddress(
                address.id,
                payload
            );

            setAddresses((previous) =>
                previous.map((item) => ({
                    ...item,
                    isDefault:
                        item.id === address.id,
                }))
            );

            setSuccess(
                "Default address updated."
            );

        } catch (err) {
            console.error(
                "Set default address error:",
                err
            );

            setError(
                err?.message ||
                "Unable to set default address."
            );
        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="addresses-page">
                <div className="addresses-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your addresses...
                    </p>

                </div>
            </div>
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="addresses-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="addresses-header">

                <div>

                    <button
                        type="button"
                        className="back-button"
                        onClick={() =>
                            onNavigate("/")
                        }
                    >
                        ← Back to Products
                    </button>

                    <div className="page-label">
                        ACCOUNT
                    </div>

                    <h1>
                        My Addresses
                    </h1>

                    <p>
                        Manage your saved delivery addresses.
                    </p>

                </div>

                {!showForm && (
                    <button
                        type="button"
                        className="add-address-button"
                        onClick={handleAddAddress}
                    >
                        + Add Address
                    </button>
                )}

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {error && (
                <div className="address-alert error">
                    {error}
                </div>
            )}

            {success && (
                <div className="address-alert success">
                    {success}
                </div>
            )}


            {/* =================================================
                ADD / EDIT FORM
            ================================================= */}

            {showForm && (
                <section className="address-form-section">

                    <div className="form-heading">

                        <div>

                            <span className="section-label">
                                {editingId
                                    ? "EDIT ADDRESS"
                                    : "NEW ADDRESS"}
                            </span>

                            <h2>
                                {editingId
                                    ? "Edit Address"
                                    : "Add New Address"}
                            </h2>

                        </div>

                    </div>


                    <form
                        className="address-form"
                        onSubmit={handleSubmit}
                    >

                        {/* ADDRESS TYPE */}

                        <div className="form-group">

                            <label htmlFor="addressType">
                                Address Type
                                <span>*</span>
                            </label>

                            <select
                                id="addressType"
                                name="addressType"
                                value={form.addressType}
                                onChange={handleChange}
                                required
                            >
                                <option value="HOME">
                                    Home
                                </option>

                                <option value="WORK">
                                    Work
                                </option>

                                <option value="OTHER">
                                    Other
                                </option>
                            </select>

                        </div>


                        {/* FULL NAME */}

                        <div className="form-group">

                            <label htmlFor="fullName">
                                Full Name
                                <span>*</span>
                            </label>

                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                placeholder="Enter full name"
                                value={form.fullName}
                                onChange={handleChange}
                                maxLength={100}
                                autoComplete="name"
                                required
                            />

                        </div>


                        {/* PHONE */}

                        <div className="form-group">

                            <label htmlFor="phone">
                                Phone Number
                                <span>*</span>
                            </label>

                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                inputMode="numeric"
                                placeholder="10-digit phone number"
                                value={form.phone}
                                onChange={handleChange}
                                maxLength={10}
                                autoComplete="tel"
                                required
                            />

                        </div>


                        {/* ADDRESS LINE 1 */}

                        <div className="form-group">

                            <label htmlFor="addressLine1">
                                Address Line 1
                                <span>*</span>
                            </label>

                            <input
                                id="addressLine1"
                                name="addressLine1"
                                type="text"
                                placeholder="House / Flat / Street"
                                value={form.addressLine1}
                                onChange={handleChange}
                                maxLength={255}
                                autoComplete="street-address"
                                required
                            />

                        </div>


                        {/* ADDRESS LINE 2 */}

                        <div className="form-group">

                            <label htmlFor="addressLine2">
                                Address Line 2
                                <small>
                                    Optional
                                </small>
                            </label>

                            <input
                                id="addressLine2"
                                name="addressLine2"
                                type="text"
                                placeholder="Apartment, Landmark, etc."
                                value={form.addressLine2}
                                onChange={handleChange}
                                maxLength={255}
                            />

                        </div>


                        {/* CITY + STATE */}

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="city">
                                    City
                                    <span>*</span>
                                </label>

                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    placeholder="City"
                                    value={form.city}
                                    onChange={handleChange}
                                    maxLength={100}
                                    autoComplete="address-level2"
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="state">
                                    State
                                    <span>*</span>
                                </label>

                                <input
                                    id="state"
                                    name="state"
                                    type="text"
                                    placeholder="State"
                                    value={form.state}
                                    onChange={handleChange}
                                    maxLength={100}
                                    autoComplete="address-level1"
                                    required
                                />

                            </div>

                        </div>


                        {/* PIN + COUNTRY */}

                        <div className="form-row">

                            <div className="form-group">

                                <label htmlFor="postalCode">
                                    PIN Code
                                    <span>*</span>
                                </label>

                                <input
                                    id="postalCode"
                                    name="postalCode"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="6-digit PIN code"
                                    value={form.postalCode}
                                    onChange={handleChange}
                                    maxLength={6}
                                    autoComplete="postal-code"
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="country">
                                    Country
                                    <span>*</span>
                                </label>

                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={form.country}
                                    onChange={handleChange}
                                    autoComplete="country-name"
                                    required
                                />

                            </div>

                        </div>


                        {/* DEFAULT */}

                        <label className="default-checkbox">

                            <input
                                type="checkbox"
                                name="isDefault"
                                checked={form.isDefault}
                                onChange={handleChange}
                            />

                            <span>
                                Set as default address
                            </span>

                        </label>


                        {/* ACTIONS */}

                        <div className="form-actions">

                            <button
                                type="button"
                                className="cancel-button"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="save-address-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingId
                                        ? "Update Address"
                                        : "Save Address"}
                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* =================================================
                SAVED ADDRESSES
            ================================================= */}

            {!showForm && (
                <section className="saved-addresses">

                    <div className="saved-addresses-heading">

                        <div>

                            <span className="section-label">
                                SAVED ADDRESSES
                            </span>

                            <h2>
                                Your Delivery Addresses
                            </h2>

                        </div>

                        <span className="address-count">
                            {addresses.length}{" "}
                            {addresses.length === 1
                                ? "Address"
                                : "Addresses"}
                        </span>

                    </div>


                    {/* EMPTY */}

                    {addresses.length === 0 ? (

                        <div className="empty-addresses">

                            <div className="empty-icon">
                                📍
                            </div>

                            <h3>
                                No saved addresses
                            </h3>

                            <p>
                                Add an address to make checkout faster.
                            </p>

                            <button
                                type="button"
                                className="add-address-button"
                                onClick={handleAddAddress}
                            >
                                + Add Your First Address
                            </button>

                        </div>

                    ) : (

                        <div className="address-grid">

                            {addresses.map((address) => {

                                const addressType =
                                    normalizeAddressType(
                                        address.addressType
                                    );

                                return (
                                    <article
                                        className={
                                            "address-card" +
                                            (
                                                address.isDefault
                                                    ? " default"
                                                    : ""
                                            )
                                        }
                                        key={address.id}
                                    >

                                        {/* CARD HEADER */}

                                        <div className="address-card-header">

                                            <div className="address-type">

                                                <span className="address-type-icon">
                                                    {getAddressTypeIcon(
                                                        addressType
                                                    )}
                                                </span>

                                                <strong>
                                                    {getAddressTypeLabel(
                                                        addressType
                                                    )}
                                                </strong>

                                            </div>

                                            {address.isDefault && (
                                                <span className="default-badge">
                                                    DEFAULT
                                                </span>
                                            )}

                                        </div>


                                        {/* CARD BODY */}

                                        <div className="address-card-body">

                                            <h3>
                                                {address.fullName}
                                            </h3>

                                            <p className="address-phone">
                                                📞 {address.phone}
                                            </p>

                                            <p>
                                                {address.addressLine1}
                                            </p>

                                            {address.addressLine2 && (
                                                <p>
                                                    {address.addressLine2}
                                                </p>
                                            )}

                                            <p>
                                                {address.city},{" "}
                                                {address.state}{" "}
                                                -{" "}
                                                {address.postalCode}
                                            </p>

                                            <p>
                                                {address.country}
                                            </p>

                                        </div>


                                        {/* CARD ACTIONS */}

                                        <div className="address-card-actions">

                                            <button
                                                type="button"
                                                className="edit-address-button"
                                                onClick={() =>
                                                    handleEdit(address)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="delete-address-button"
                                                onClick={() =>
                                                    handleDelete(
                                                        address.id
                                                    )
                                                }
                                                disabled={
                                                    deletingId ===
                                                    address.id
                                                }
                                            >
                                                {deletingId === address.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                            {!address.isDefault && (
                                                <button
                                                    type="button"
                                                    className="default-address-button"
                                                    onClick={() =>
                                                        handleSetDefault(
                                                            address
                                                        )
                                                    }
                                                >
                                                    Set Default
                                                </button>
                                            )}

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

                </section>
            )}

        </div>
    );
}


export default Addresses;