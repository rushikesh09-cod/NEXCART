import { useState } from "react";

function ProductImage({
    src,
    alt = "Product",
    brand,
    category,
    className = "",
}) {

    const [imageError, setImageError] = useState(false);


    // =====================================================
    // IMAGE URL
    // =====================================================

    function getImageUrl(value) {

        if (!value) {
            return null;
        }

        const imageUrl = String(value).trim();

        if (!imageUrl) {
            return null;
        }

        // Full external URL
        if (
            imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
        ) {
            return imageUrl;
        }

        // Local/public URL
        if (imageUrl.startsWith("/")) {
            return imageUrl;
        }

        return `/${imageUrl}`;
    }


    const imageUrl = getImageUrl(src);


    // =====================================================
    // CATEGORY ICON
    // =====================================================

    function getCategoryIcon() {

        const value =
            String(category || "").toLowerCase();

        if (value.includes("mobile")) {
            return "📱";
        }

        if (
            value.includes("electronic") ||
            value.includes("computer")
        ) {
            return "💻";
        }

        if (value.includes("fashion")) {
            return "👕";
        }

        if (value.includes("beauty")) {
            return "💄";
        }

        if (
            value.includes("home") ||
            value.includes("kitchen")
        ) {
            return "🏠";
        }

        if (value.includes("sport")) {
            return "⚽";
        }

        if (value.includes("book")) {
            return "📚";
        }

        if (value.includes("toy")) {
            return "🧸";
        }

        if (value.includes("automotive")) {
            return "🚗";
        }

        return "📦";
    }


    // =====================================================
    // IMAGE ERROR
    // =====================================================

    function handleImageError() {

        setImageError(true);

    }


    // =====================================================
    // FALLBACK
    // =====================================================

    if (!imageUrl || imageError) {

        return (
            <div
                className={
                    `product-image-placeholder ${className}`
                }
            >

                <span className="product-placeholder-icon">
                    {getCategoryIcon()}
                </span>

                <span className="product-placeholder-text">
                    {brand || category || "NEXCART"}
                </span>

            </div>
        );
    }


    // =====================================================
    // IMAGE
    // =====================================================

    return (
        <img
            className={
                `product-image-element ${className}`
            }
            src={imageUrl}
            alt={alt}
            loading="lazy"
            onError={handleImageError}
        />
    );
}


export default ProductImage;