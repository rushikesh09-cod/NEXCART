const API_BASE_URL = "http://localhost:8081/api";


// =====================================================
// HEADERS
// =====================================================

function getHeaders() {

    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}


// =====================================================
// HANDLE API RESPONSE
// =====================================================

async function handleResponse(response, defaultMessage) {

    if (!response.ok) {

        let message =
            `${defaultMessage} (${response.status})`;

        try {

            const error = await response.json();

            if (error.message) {
                message = error.message;
            }

        } catch {
            // Response is not JSON
        }

        throw new Error(message);
    }

    return response.json();
}


// =====================================================
// GET ALL PRODUCTS
// =====================================================

export async function getProducts() {

    const response = await fetch(
        `${API_BASE_URL}/products`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Failed to load products"
    );
}


// =====================================================
// GET SINGLE PRODUCT
// =====================================================

export async function getProduct(productId) {

    if (!productId) {
        throw new Error("Product ID is missing");
    }

    const response = await fetch(
        `${API_BASE_URL}/products/${productId}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Failed to load product"
    );
}


// =====================================================
// SEARCH PRODUCTS
// =====================================================

export async function searchProducts(searchTerm) {

    const value =
        searchTerm?.trim();

    if (!value) {
        return getProducts();
    }


    // -------------------------------------------------
    // FIRST: BACKEND SEARCH
    // -------------------------------------------------

    try {

        const response = await fetch(
            `${API_BASE_URL}/products/search?name=${encodeURIComponent(
                value
            )}`,
            {
                method: "GET",
                headers: getHeaders(),
            }
        );


        if (response.ok) {

            const data =
                await response.json();

            if (Array.isArray(data) && data.length > 0) {
                return data;
            }

        }

    } catch (error) {

        console.warn(
            "Backend search failed:",
            error
        );

    }


    // -------------------------------------------------
    // FALLBACK SEARCH
    // -------------------------------------------------

    const allProducts =
        await getProducts();

    if (!Array.isArray(allProducts)) {
        return [];
    }


    const search =
        value.toLowerCase();


    return allProducts.filter(
        (product) => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();

            const brand =
                String(
                    product.brand || ""
                ).toLowerCase();

            const description =
                String(
                    product.description || ""
                ).toLowerCase();

            const category =
                String(
                    product.category || ""
                ).toLowerCase();


            return (
                name.includes(search) ||
                brand.includes(search) ||
                description.includes(search) ||
                category.includes(search)
            );

        }
    );
}


// =====================================================
// GET PRODUCTS BY CATEGORY
// =====================================================

export async function getProductsByCategory(category) {

    if (!category || !category.trim()) {
        return getProducts();
    }


    const cleanCategory =
        category.trim();

    const response = await fetch(
        `${API_BASE_URL}/products/category/${encodeURIComponent(
            cleanCategory
        )}`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );


    return handleResponse(
        response,
        "Failed to load category"
    );
}


// =====================================================
// GET CATEGORIES
// =====================================================

export async function getCategories() {

    const response = await fetch(
        `${API_BASE_URL}/categories`,
        {
            method: "GET",
            headers: getHeaders(),
        }
    );

    return handleResponse(
        response,
        "Failed to load categories"
    );
}
