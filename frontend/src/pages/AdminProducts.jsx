import { useEffect, useState } from "react";

import {
    getAdminProducts,
    createAdminProduct,
    updateAdminProduct,
    setProductActive,
    deleteAdminProduct,
} from "../api/adminApi";

import "./AdminProducts.css";


function AdminProducts({
    onNavigate,
}) {

    // =====================================================
    // STATE
    // =====================================================

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [editingProduct, setEditingProduct] =
        useState(null);

    const [showForm, setShowForm] =
        useState(false);


    // =====================================================
    // FORM
    // =====================================================

    const emptyForm = {
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        category: "",
        brand: "",
        imageUrl: "",
        active: true,
    };

    const [form, setForm] =
        useState(emptyForm);


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    async function loadProducts() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getAdminProducts();

            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load admin products:",
                err
            );

            setError(
                err.message ||
                "Unable to load admin products."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadProducts();

    }, []);


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
    }


    // =====================================================
    // OPEN CREATE FORM
    // =====================================================

    function openCreateForm() {

        setEditingProduct(null);

        setForm({
            ...emptyForm,
        });

        setShowForm(true);

        setError("");
    }


    // =====================================================
    // OPEN EDIT FORM
    // =====================================================

    function openEditForm(product) {

        setEditingProduct(product);

        setForm({
            name: product.name || "",
            description:
                product.description || "",
            price:
                product.price ?? "",
            stockQuantity:
                product.stockQuantity ?? "",
            category:
                product.category || "",
            brand:
                product.brand || "",
            imageUrl:
                product.imageUrl || "",
            active:
                product.active !== false,
        });

        setShowForm(true);

        setError("");
    }


    // =====================================================
    // CLOSE FORM
    // =====================================================

    function closeForm() {

        if (saving) {
            return;
        }

        setShowForm(false);

        setEditingProduct(null);

        setForm({
            ...emptyForm,
        });
    }


    // =====================================================
    // SUBMIT FORM
    // =====================================================

    async function handleSubmit(event) {

        event.preventDefault();

        try {

            setSaving(true);
            setError("");

            const productData = {
                name:
                    form.name.trim(),

                description:
                    form.description.trim(),

                price:
                    Number(form.price),

                stockQuantity:
                    Number(form.stockQuantity),

                category:
                    form.category.trim(),

                brand:
                    form.brand.trim(),

                imageUrl:
                    form.imageUrl.trim(),

                active:
                    Boolean(form.active),
            };


            // =============================================
            // UPDATE
            // =============================================

            if (editingProduct) {

                await updateAdminProduct(
                    editingProduct.id,
                    productData
                );

            }

            // =============================================
            // CREATE
            // =============================================

            else {

                await createAdminProduct(
                    productData
                );
            }


            // =============================================
            // CLOSE + RELOAD
            // =============================================

            closeForm();

            await loadProducts();

        } catch (err) {

            console.error(
                "Unable to save product:",
                err
            );

            setError(
                err.message ||
                "Unable to save product."
            );

        } finally {

            setSaving(false);
        }
    }


    // =====================================================
    // TOGGLE ACTIVE
    // =====================================================

    async function handleToggleActive(product) {

        try {

            setError("");

            await setProductActive(
                product.id,
                !product.active
            );

            await loadProducts();

        } catch (err) {

            console.error(
                "Unable to update product status:",
                err
            );

            setError(
                err.message ||
                "Unable to update product status."
            );
        }
    }


    // =====================================================
    // DELETE
    // =====================================================

    async function handleDelete(product) {

        const confirmed =
            window.confirm(
                `Delete "${product.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(product.id);

            setError("");

            await deleteAdminProduct(
                product.id
            );

            await loadProducts();

        } catch (err) {

            console.error(
                "Unable to delete product:",
                err
            );

            setError(
                err.message ||
                "Unable to delete product."
            );

        } finally {

            setDeletingId(null);
        }
    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    function navigate(path) {

        if (onNavigate) {

            onNavigate(path);

        } else {

            window.location.href =
                path;
        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="admin-products-page">

                <div className="admin-products-state">

                    <div className="loading-spinner">
                    </div>

                    <h1>
                        Admin Products
                    </h1>

                    <p>
                        Loading products...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-products-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-products-header">

                <div>

                    <p className="admin-label">
                        NEXCART ADMIN
                    </p>

                    <h1>
                        Products
                    </h1>

                    <p className="admin-products-subtitle">
                        Manage your store products.
                    </p>

                </div>


                <div className="admin-products-header-actions">

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
                        onClick={openCreateForm}
                    >
                        + Add Product
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="admin-products-error">

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


            {/* =================================================
                PRODUCT COUNT
            ================================================= */}

            <div className="admin-products-summary">

                <strong>
                    {products.length}
                </strong>

                <span>
                    {products.length === 1
                        ? "product"
                        : "products"}
                </span>

                <button
                    type="button"
                    onClick={loadProducts}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {products.length === 0 && (

                <div className="admin-products-empty">

                    <div className="admin-empty-icon">
                        📦
                    </div>

                    <h2>
                        No products found
                    </h2>

                    <p>
                        Add your first product to
                        start managing your store.
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={openCreateForm}
                    >
                        + Add Product
                    </button>

                </div>
            )}


            {/* =================================================
                PRODUCT TABLE
            ================================================= */}

            {products.length > 0 && (

                <div className="admin-products-table-wrapper">

                    <table className="admin-products-table">

                        <thead>

                            <tr>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Price
                                </th>

                                <th>
                                    Stock
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.map((product) => (

                                <tr
                                    key={product.id}
                                >

                                    {/* PRODUCT */}

                                    <td>

                                        <div className="admin-product-info">

                                            {product.imageUrl ? (

                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="admin-product-image"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display =
                                                            "none";
                                                    }}
                                                />

                                            ) : (

                                                <div className="admin-product-image-placeholder">
                                                    📦
                                                </div>
                                            )}

                                            <div>

                                                <strong>
                                                    {product.name}
                                                </strong>

                                                <small>
                                                    {product.brand || "No brand"}
                                                </small>

                                            </div>

                                        </div>

                                    </td>


                                    {/* CATEGORY */}

                                    <td>
                                        {product.category}
                                    </td>


                                    {/* PRICE */}

                                    <td>

                                        ₹
                                        {Number(
                                            product.price || 0
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}

                                    </td>


                                    {/* STOCK */}

                                    <td>

                                        <span
                                            className={
                                                product.stockQuantity <= 0
                                                    ? "stock-out"
                                                    : product.stockQuantity <= 5
                                                        ? "stock-low"
                                                        : "stock-good"
                                            }
                                        >
                                            {product.stockQuantity}
                                        </span>

                                    </td>


                                    {/* STATUS */}

                                    <td>

                                        <span
                                            className={
                                                product.active
                                                    ? "product-status active"
                                                    : "product-status inactive"
                                            }
                                        >
                                            {product.active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                    </td>


                                    {/* ACTIONS */}

                                    <td>

                                        <div className="admin-product-actions">

                                            <button
                                                type="button"
                                                className="admin-small-button"
                                                onClick={() =>
                                                    openEditForm(
                                                        product
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>


                                            <button
                                                type="button"
                                                className="admin-small-button"
                                                onClick={() =>
                                                    handleToggleActive(
                                                        product
                                                    )
                                                }
                                            >
                                                {product.active
                                                    ? "Disable"
                                                    : "Enable"}
                                            </button>


                                            <button
                                                type="button"
                                                className="admin-small-button danger"
                                                disabled={
                                                    deletingId ===
                                                    product.id
                                                }
                                                onClick={() =>
                                                    handleDelete(
                                                        product
                                                    )
                                                }
                                            >
                                                {deletingId ===
                                                product.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>
            )}


            {/* =================================================
                PRODUCT FORM
            ================================================= */}

            {showForm && (

                <div
                    className="admin-product-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeForm();
                        }

                    }}
                >

                    <div className="admin-product-modal">


                        {/* MODAL HEADER */}

                        <div className="admin-product-modal-header">

                            <div>

                                <p className="admin-label">
                                    {editingProduct
                                        ? "EDIT PRODUCT"
                                        : "NEW PRODUCT"}
                                </p>

                                <h2>
                                    {editingProduct
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                ×
                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            className="admin-product-form"
                            onSubmit={handleSubmit}
                        >

                            {/* NAME */}

                            <div className="admin-form-group">

                                <label htmlFor="name">
                                    Product Name
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                    required
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="admin-form-group">

                                <label htmlFor="description">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="4"
                                />

                            </div>


                            {/* PRICE + STOCK */}

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label htmlFor="price">
                                        Price
                                    </label>

                                    <input
                                        id="price"
                                        name="price"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        required
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="stockQuantity">
                                        Stock Quantity
                                    </label>

                                    <input
                                        id="stockQuantity"
                                        name="stockQuantity"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={form.stockQuantity}
                                        onChange={handleChange}
                                        placeholder="0"
                                        required
                                    />

                                </div>

                            </div>


                            {/* CATEGORY + BRAND */}

                            <div className="admin-form-row">

                                <div className="admin-form-group">

                                    <label htmlFor="category">
                                        Category
                                    </label>

                                    <input
                                        id="category"
                                        name="category"
                                        type="text"
                                        value={form.category}
                                        onChange={handleChange}
                                        placeholder="Electronics"
                                        required
                                    />

                                </div>


                                <div className="admin-form-group">

                                    <label htmlFor="brand">
                                        Brand
                                    </label>

                                    <input
                                        id="brand"
                                        name="brand"
                                        type="text"
                                        value={form.brand}
                                        onChange={handleChange}
                                        placeholder="Brand name"
                                    />

                                </div>

                            </div>


                            {/* IMAGE URL */}

                            <div className="admin-form-group">

                                <label htmlFor="imageUrl">
                                    Image URL
                                </label>

                                <input
                                    id="imageUrl"
                                    name="imageUrl"
                                    type="text"
                                    value={form.imageUrl}
                                    onChange={handleChange}
                                    placeholder="/products/product.jpg"
                                />

                            </div>


                            {/* ACTIVE */}

                            <label className="admin-checkbox">

                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={form.active}
                                    onChange={handleChange}
                                />

                                <span>
                                    Product is active
                                </span>

                            </label>


                            {/* ACTIONS */}

                            <div className="admin-product-form-actions">

                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={closeForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingProduct
                                            ? "Save Changes"
                                            : "Create Product"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}


export default AdminProducts;