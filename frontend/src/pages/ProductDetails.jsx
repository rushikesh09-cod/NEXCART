import { useEffect, useState } from "react";

import { getProduct } from "../api/productApi";
import { addToCart } from "../api/cartApi";
import ProductImage from "../components/ProductImage";


function ProductDetails({
    productId,
    onNavigate,
}) {

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [adding, setAdding] = useState(false);

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [messageType, setMessageType] = useState("");


    // =====================================================
    // LOAD PRODUCT
    // =====================================================

    async function loadProduct() {

        try {

            setLoading(true);
            setError("");
            setMessage("");


            if (!productId) {

                throw new Error(
                    "Product ID is missing"
                );
            }


            const data =
                await getProduct(productId);


            setProduct(data);

        } catch (err) {

            console.error(
                "Unable to load product:",
                err
            );

            setError(
                err.message ||
                "Unable to load product"
            );

        } finally {

            setLoading(false);

        }
    }


    // =====================================================
    // LOAD WHEN ID CHANGES
    // =====================================================

    useEffect(() => {

        loadProduct();

    }, [productId]);


    // =====================================================
    // NAVIGATION
    // =====================================================

    function goBack() {

        if (onNavigate) {

            onNavigate("/");

        } else {

            window.location.href = "/";

        }
    }


    function goToCart() {

        if (onNavigate) {

            onNavigate("/cart");

        } else {

            window.location.href = "/cart";

        }
    }


    // =====================================================
    // ADD TO CART
    // =====================================================

    async function handleAddToCart() {

        if (
            adding ||
            !product ||
            Number(product.stockQuantity || 0) <= 0
        ) {

            return;
        }


        try {

            setAdding(true);

            setMessage("");
            setMessageType("");


            await addToCart(
                product.id,
                1
            );


            setMessage(
                "Added to cart ✓"
            );

            setMessageType(
                "success"
            );

        } catch (err) {

            console.error(
                "Add to cart error:",
                err
            );


            setMessage(
                err.message ||
                "Failed to add product to cart"
            );

            setMessageType(
                "error"
            );

        } finally {

            setAdding(false);

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
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="product-details-page">

                <div className="product-details-state">

                    <div className="loading-spinner"></div>

                    <h1>
                        Loading Product
                    </h1>

                    <p>
                        Please wait while we fetch
                        the product details.
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error || !product) {

        return (

            <div className="product-details-page">

                <div className="product-details-state">

                    <div className="cart-state-icon">
                        !
                    </div>

                    <h1>
                        Product Not Found
                    </h1>

                    <p>
                        {error ||
                            "This product could not be found."}
                    </p>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={loadProduct}
                    >
                        Try Again
                    </button>


                    <button
                        type="button"
                        className="secondary-button"
                        onClick={goBack}
                    >
                        ← Back to Products
                    </button>

                </div>

            </div>
        );
    }


    // =====================================================
    // PRODUCT VALUES
    // =====================================================

    const price =
        Number(product.price || 0);

    const stock =
        Number(product.stockQuantity || 0);

    const isOutOfStock =
        stock <= 0;


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="product-details-page">

            <div className="product-details-container">


                {/* =================================================
                    BACK
                ================================================= */}

                <button
                    type="button"
                    className="back-button"
                    onClick={goBack}
                >
                    ← Back to Products
                </button>


                {/* =================================================
                    PRODUCT
                ================================================= */}

                <div className="product-details-layout">


                    {/* =================================================
                        IMAGE
                    ================================================= */}

                    <div className="product-details-image">

                        <ProductImage
                            src={product.imageUrl}
                            alt={
                                product.name ||
                                "Product"
                            }
                            brand={product.brand}
                            category={product.category}
                            className="product-details-image-element"
                        />


                        {/* STOCK */}

                        <div
                            className={
                                isOutOfStock
                                    ? "product-details-stock-badge out"
                                    : "product-details-stock-badge"
                            }
                        >

                            {isOutOfStock

                                ? "Out of Stock"

                                : stock <= 5

                                    ? `Only ${stock} left`

                                    : "In Stock"

                            }

                        </div>

                    </div>


                    {/* =================================================
                        INFORMATION
                    ================================================= */}

                    <div className="product-details-info">


                        {/* BRAND */}

                        {product.brand && (

                            <p className="product-details-brand">
                                {product.brand}
                            </p>

                        )}


                        {/* NAME */}

                        <h1>
                            {product.name}
                        </h1>


                        {/* CATEGORY */}

                        {product.category && (

                            <div className="product-details-category">

                                <span>
                                    Category
                                </span>

                                <strong>
                                    {product.category}
                                </strong>

                            </div>

                        )}


                        {/* DESCRIPTION */}

                        {product.description && (

                            <p className="product-details-description">
                                {product.description}
                            </p>

                        )}


                        {/* PRICE */}

                        <div className="product-details-price">

                            ₹
                            {formatPrice(
                                price
                            )}

                        </div>


                        {/* STOCK */}

                        <div
                            className={
                                isOutOfStock
                                    ? "product-details-stock out"
                                    : "product-details-stock"
                            }
                        >

                            {isOutOfStock

                                ? "Currently unavailable"

                                : `${stock} units available`

                            }

                        </div>


                        {/* ACTIONS */}

                        <div className="product-details-actions">

                            <button
                                type="button"
                                className="add-cart-button"
                                onClick={
                                    handleAddToCart
                                }
                                disabled={
                                    adding ||
                                    isOutOfStock
                                }
                            >

                                {adding

                                    ? "Adding..."

                                    : isOutOfStock

                                        ? "Out of Stock"

                                        : "Add to Cart"

                                }

                            </button>


                            <button
                                type="button"
                                className="secondary-button"
                                onClick={goToCart}
                            >
                                View Cart
                            </button>

                        </div>


                        {/* MESSAGE */}

                        {message && (

                            <div
                                className={
                                    messageType === "success"
                                        ? "cart-message success"
                                        : "cart-message error"
                                }
                            >
                                {message}
                            </div>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}


export default ProductDetails;