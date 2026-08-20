CREATE TABLE products (
    id UUID PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    price NUMERIC(12,2) NOT NULL,

    stock_quantity INTEGER NOT NULL DEFAULT 0,

    category VARCHAR(100) NOT NULL,

    brand VARCHAR(100),

    image_url VARCHAR(500),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category
    ON products(category);

CREATE INDEX idx_products_active
    ON products(active);

CREATE INDEX idx_products_name
    ON products(name);