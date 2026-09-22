import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

import {
    getProducts,
    searchProducts,
    getProductsByCategory,
} from "../api/productApi";


function Products({
    onNavigate,
    searchTerm = "",
}) {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");


    // =====================================================
    // CATEGORIES
    // IMPORTANT:
    // Names must exactly match backend categories
    // =====================================================

    const categories = [
        {
            name: "Mobiles",
            icon: "📱",
        },
        {
            name: "Electronics",
            icon: "💻",
        },
        {
            name: "Home & Kitchen",
            icon: "🏠",
        },
        {
            name: "Fashion",
            icon: "👕",
        },
        {
            name: "Beauty",
            icon: "💄",
        },
        {
            name: "Sports",
            icon: "⚽",
        },
        {
            name: "Books",
            icon: "📚",
        },
        {
            name: "Toys",
            icon: "🧸",
        },
        {
            name: "Automotive",
            icon: "🚗",
        },
    ];


    // =====================================================
    // LOAD PRODUCTS
    // =====================================================

    async function loadProducts() {

        try {

            setLoading(true);
            setError("");

            let data = [];


            // =================================================
            // SEARCH
            // =================================================

            if (searchTerm.trim()) {

                console.log(
                    "Searching products:",
                    searchTerm
                );

                data = await searchProducts(
                    searchTerm
                );

            }


            // =================================================
            // CATEGORY
            // =================================================

            else if (
                selectedCategory !== "All"
            ) {

                console.log(
                    "Loading category:",
                    selectedCategory
                );

                data = await getProductsByCategory(
                    selectedCategory
                );

            }


            // =================================================
            // ALL PRODUCTS
            // =================================================

            else {

                console.log(
                    "Loading all products"
                );

                data = await getProducts();

            }


            // =================================================
            // SAVE
            // =================================================

            setProducts(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Product loading error:",
                err
            );

            setError(
                err.message ||
                "Unable to load products."
            );

            setProducts([]);

        } finally {

            setLoading(false);

        }

    }


    // =====================================================
    // SEARCH / CATEGORY WATCH
    // =====================================================

    useEffect(() => {

        loadProducts();

    }, [
        searchTerm,
        selectedCategory,
    ]);


    // =====================================================
    // CATEGORY CHANGE
    // =====================================================

    function handleCategoryChange(category) {

        setSelectedCategory(category);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <section className="products-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="products-header">

                <div className="products-title-area">

                    <p className="products-label">
                        NEXCART STORE
                    </p>

                    <h1>

                        {searchTerm.trim()

                            ? `Search results for "${searchTerm}"`

                            : selectedCategory !== "All"

                                ? selectedCategory

                                : "Featured Products"

                        }

                    </h1>

                    <p className="products-subtitle">

                        {searchTerm.trim()

                            ? "Products matching your search."

                            : selectedCategory !== "All"

                                ? `Products available in ${selectedCategory}.`

                                : "Discover products selected for you."

                        }

                    </p>

                </div>


                {/* HEADER ACTIONS */}

                <div className="products-header-actions">

                    <div className="product-count">

                        <strong>
                            {products.length}
                        </strong>

                        <span>

                            {products.length === 1
                                ? "Product"
                                : "Products"}

                        </span>

                    </div>


                    <button
                        type="button"
                        className="refresh-button"
                        onClick={loadProducts}
                        disabled={loading}
                    >

                        {loading ? (

                            <>
                                <span className="button-spinner"></span>
                                Loading...
                            </>

                        ) : (

                            <>
                                ↻ Refresh
                            </>

                        )}

                    </button>

                </div>

            </div>


            {/* =================================================
                CATEGORIES
                Hidden during search
            ================================================= */}

            {!searchTerm.trim() && (

                <section className="shop-categories">

                    <div className="shop-categories-header">

                        <div>

                            <p className="categories-label">
                                EXPLORE
                            </p>

                            <h2>
                                Shop by Categories
                            </h2>

                            <p>
                                Find products from your
                                favorite categories.
                            </p>

                        </div>


                        {selectedCategory !== "All" && (

                            <button
                                type="button"
                                className="view-all-categories"
                                onClick={() =>
                                    handleCategoryChange(
                                        "All"
                                    )
                                }
                            >
                                View All
                            </button>

                        )}

                    </div>


                    {/* =================================================
                        CATEGORY GRID
                    ================================================= */}

                    <div className="category-grid">


                        {/* ALL PRODUCTS */}

                        <button
                            type="button"
                            className={
                                selectedCategory === "All"
                                    ? "category-card active"
                                    : "category-card"
                            }
                            onClick={() =>
                                handleCategoryChange(
                                    "All"
                                )
                            }
                        >

                            <div className="category-icon">
                                🛍️
                            </div>

                            <span>
                                All Products
                            </span>

                        </button>


                        {/* ALL CATEGORIES */}

                        {categories.map(
                            (category) => (

                                <button
                                    key={category.name}
                                    type="button"
                                    className={
                                        selectedCategory === category.name
                                            ? "category-card active"
                                            : "category-card"
                                    }
                                    onClick={() =>
                                        handleCategoryChange(
                                            category.name
                                        )
                                    }
                                >

                                    <div className="category-icon">

                                        {category.icon}

                                    </div>

                                    <span>

                                        {category.name}

                                    </span>

                                </button>

                            )
                        )}

                    </div>

                </section>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="products-error">

                    <div>

                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>


                    <button
                        type="button"
                        className="retry-button"
                        onClick={loadProducts}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="products-loading">

                    <div className="loading-spinner"></div>

                    <h2>

                        {searchTerm.trim()

                            ? "Searching products"

                            : selectedCategory !== "All"

                                ? `Loading ${selectedCategory}`

                                : "Loading products"

                        }

                    </h2>

                    <p>
                        Please wait while we fetch
                        the latest products.
                    </p>

                </div>

            )}


            {/* =================================================
                EMPTY
            ================================================= */}

            {!loading &&
                !error &&
                products.length === 0 && (

                    <div className="products-empty">

                        <div className="products-empty-icon">
                            🔍
                        </div>


                        <h2>

                            {searchTerm.trim()

                                ? "No products found"

                                : selectedCategory !== "All"

                                    ? `No ${selectedCategory} products found`

                                    : "No products available"

                            }

                        </h2>


                        <p>

                            {searchTerm.trim()

                                ? `No products matched "${searchTerm}".`

                                : selectedCategory !== "All"

                                    ? `There are currently no products in ${selectedCategory}.`

                                    : "There are currently no products available in the store."

                            }

                        </p>


                        <button
                            type="button"
                            className="retry-button"
                            onClick={() =>
                                handleCategoryChange(
                                    "All"
                                )
                            }
                        >
                            Show All Products
                        </button>

                    </div>

                )}


            {/* =================================================
                PRODUCTS
            ================================================= */}

            {!loading &&
                !error &&
                products.length > 0 && (

                    <section className="products-results">


                        <div className="products-results-header">

                            <h2>

                                {searchTerm.trim()

                                    ? "Search Results"

                                    : selectedCategory === "All"

                                        ? "Featured Products"

                                        : selectedCategory

                                }

                            </h2>


                            <span>

                                {products.length}{" "}

                                {products.length === 1
                                    ? "product"
                                    : "products"}

                            </span>

                        </div>


                        {/* =================================================
                            PRODUCT GRID
                        ================================================= */}

                        <div className="product-grid">

                            {products.map(
                                (product) => (

                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onNavigate={onNavigate}
                                    />

                                )
                            )}

                        </div>

                    </section>

                )}

        </section>

    );

}


export default Products;