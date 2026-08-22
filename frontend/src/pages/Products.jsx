import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../api/productApi";

function Products() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadProducts() {

        try {

            setLoading(true);
            setError("");

            const data = await getProducts();

            setProducts(data);

        } catch (err) {

            console.error(err);

            setError(
                "Unable to load products. Please try again."
            );

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        loadProducts();
    }, []);

    return (
        <section>

            <div className="products-header">

                <div>
                    <h2>Featured Products</h2>

                    <div className="product-count">
                        {products.length} Products
                    </div>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadProducts}
                >
                    Refresh
                </button>

            </div>

            {loading && (
                <div className="loading">
                    Loading products...
                </div>
            )}

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {!loading && !error && (
                <div className="product-grid">

                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}

                </div>
            )}

        </section>
    );
}

export default Products;