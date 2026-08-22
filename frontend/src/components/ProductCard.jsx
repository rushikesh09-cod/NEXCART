import { useState } from "react";
import { addToCart } from "../api/cartApi";

function ProductCard({ product }) {

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleAddToCart() {

        try {
            setLoading(true);
            setMessage("");

            await addToCart(product.id, 1);

            setMessage("Added to cart ✓");

        } catch (error) {

            console.error(error);

            setMessage(
                error.message || "Failed to add to cart"
            );

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="product-card">

            <div className="product-image">

                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className="image-placeholder">
                        {product.brand}
                    </div>
                )}

            </div>

            <div className="product-info">

                <p className="product-brand">
                    {product.brand}
                </p>

                <h2 className="product-name">
                    {product.name}
                </h2>

                <p className="product-description">
                    {product.description}
                </p>

                <div className="product-bottom">

                    <strong className="product-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                    </strong>

                    <span className="product-stock">
                        {product.stockQuantity} in stock
                    </span>

                </div>

                <button
                    className="add-cart-button"
                    onClick={handleAddToCart}
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add to Cart"}
                </button>

                {message && (
                    <p className="cart-message">
                        {message}
                    </p>
                )}

            </div>

        </div>
    );
}

export default ProductCard;