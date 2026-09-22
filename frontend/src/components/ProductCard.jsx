import { useState } from "react";

import ProductImage from "./ProductImage";
import { addToCart } from "../api/cartApi";


function ProductCard({
    product,
    onNavigate,
}) {

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [messageType, setMessageType] =
        useState("");


    // =====================================================
    // PRODUCT VALUES
    // =====================================================

    const stock =
        Number(
            product?.stockQuantity || 0
        );

    const price =
        Number(
            product?.price || 0
        );

    const isOutOfStock =
        stock <= 0;


    // =====================================================
    // ADD TO CART
    // =====================================================

    async function handleAddToCart() {

        if (
            loading ||
            isOutOfStock ||
            !product?.id
        ) {
            return;
        }

        try {

            setLoading(true);
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

        } catch (error) {

            console.error(
                "Add to cart error:",
                error
            );


            setMessage(
                error.message ||
                "Failed to add to cart"
            );

            setMessageType(
                "error"
            );

        } finally {

            setLoading(false);

        }
    }


    // =====================================================
    // VIEW PRODUCT
    // =====================================================

    function handleViewProduct() {

        if (
            !onNavigate ||
            !product?.id
        ) {
            return;
        }


        onNavigate(
            `/products/${product.id}`
        );
    }


    // =====================================================
    // KEYBOARD NAVIGATION
    // =====================================================

    function handleProductKeyDown(
        event
    ) {

        if (
            event.key === "Enter" ||
            event.key === " "
        ) {

            event.preventDefault();

            handleViewProduct();

        }
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <article className="product-card">


            {/* =================================================
                PRODUCT IMAGE
            ================================================= */}

            <div
                className="product-image product-clickable"
                onClick={
                    handleViewProduct
                }
                role="button"
                tabIndex={0}
                onKeyDown={
                    handleProductKeyDown
                }
                aria-label={`View ${
                    product?.name ||
                    "product"
                } details`}
            >

                <ProductImage
                    src={
                        product?.imageUrl
                    }
                    alt={
                        product?.name ||
                        "Product"
                    }
                    brand={
                        product?.brand
                    }
                    category={
                        product?.category
                    }
                />


                {/* =================================================
                    STOCK BADGE
                ================================================= */}

                <div
                    className={
                        isOutOfStock
                            ? "product-stock-badge out"
                            : "product-stock-badge"
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
                PRODUCT INFORMATION
            ================================================= */}

            <div className="product-info">


                {/* =================================================
                    BRAND
                ================================================= */}

                {product?.brand && (

                    <p className="product-brand">

                        {product.brand}

                    </p>

                )}


                {/* =================================================
                    PRODUCT NAME
                ================================================= */}

                <h2
                    className="product-name product-clickable"
                    onClick={
                        handleViewProduct
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={
                        handleProductKeyDown
                    }
                >

                    {product?.name ||
                        "Unnamed Product"}

                </h2>


                {/* =================================================
                    DESCRIPTION
                ================================================= */}

                {product?.description && (

                    <p className="product-description">

                        {product.description}

                    </p>

                )}


                {/* =================================================
                    PRICE
                ================================================= */}

                <div className="product-price-row">

                    <strong className="product-price">

                        ₹
                        {price.toLocaleString(
                            "en-IN"
                        )}

                    </strong>


                    {!isOutOfStock && (

                        <span className="product-stock">

                            {stock} available

                        </span>

                    )}

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="product-actions">


                    {/* VIEW DETAILS */}

                    <button
                        type="button"
                        className="view-product-button"
                        onClick={
                            handleViewProduct
                        }
                    >
                        View Details
                    </button>


                    {/* ADD TO CART */}

                    <button
                        type="button"
                        className="add-cart-button"
                        onClick={
                            handleAddToCart
                        }
                        disabled={
                            loading ||
                            isOutOfStock
                        }
                    >

                        {loading

                            ? "Adding..."

                            : isOutOfStock

                                ? "Out of Stock"

                                : "Add to Cart"

                        }

                    </button>

                </div>


                {/* =================================================
                    CART MESSAGE
                ================================================= */}

                {message && (

                    <div
                        className={
                            messageType ===
                            "success"

                                ? "cart-message success"

                                : "cart-message error"
                        }
                    >

                        {message}

                    </div>

                )}

            </div>

        </article>
    );
}


export default ProductCard;