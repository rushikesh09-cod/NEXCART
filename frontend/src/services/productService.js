import api from "./api";

export const getProducts = async () => {
    const response = await api.get("/products");
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

export const searchProducts = async (name) => {
    const response = await api.get("/products/search", {
        params: {
            name,
        },
    });

    return response.data;
};

export const getProductsByCategory = async (category) => {
    const response = await api.get(
        `/products/category/${encodeURIComponent(category)}`
    );

    return response.data;
};