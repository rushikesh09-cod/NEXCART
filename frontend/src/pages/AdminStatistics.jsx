import { useEffect, useMemo, useState } from "react";
import { getAdminDashboard } from "../api/adminApi.js";
import "./AdminStatistics.css";

export default function AdminStatistics({ onNavigate }) {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // =====================================================
    // LOAD DATA
    // =====================================================

    async function loadStatistics(isRefresh = false) {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const data = await getAdminDashboard();

            setStatistics(data || {});
        } catch (err) {
            console.error("Failed to load admin statistics:", err);

            setError(
                err?.message || "Unable to load statistics."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        loadStatistics();
    }, []);

    // =====================================================
    // NAVIGATION
    // =====================================================

    function goToDashboard() {
        if (onNavigate) {
            onNavigate("/admin");
        }
    }

    // =====================================================
    // FORMATTERS
    // =====================================================

    function formatNumber(value) {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return "0";
        }

        return new Intl.NumberFormat("en-IN").format(number);
    }

    function formatCurrency(value) {
        const number = Number(value);

        if (Number.isNaN(number)) {
            return "₹0.00";
        }

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(number);
    }

    // =====================================================
    // SAFE DATA
    // =====================================================

    const data = statistics || {};

    const totalUsers =
        data.totalUsers ??
        data.usersCount ??
        data.userCount ??
        0;

    const totalProducts =
        data.totalProducts ??
        data.productsCount ??
        data.productCount ??
        0;

    const totalOrders =
        data.totalOrders ??
        data.ordersCount ??
        data.orderCount ??
        0;

    const totalRevenue =
        data.totalRevenue ??
        data.revenue ??
        data.totalSales ??
        0;

    const pendingOrders =
        data.pendingOrders ??
        data.pendingOrderCount ??
        0;

    const activeProducts =
        data.activeProducts ??
        data.activeProductCount ??
        0;

    const inactiveProducts =
        data.inactiveProducts ??
        data.inactiveProductCount ??
        0;

    // =====================================================
    // PERCENTAGES
    // =====================================================

    const activePercentage = useMemo(() => {
        const products = Number(totalProducts);

        if (!products) return 0;

        return Math.min(
            100,
            Math.round(
                (Number(activeProducts) / products) * 100
            )
        );
    }, [activeProducts, totalProducts]);

    const inactivePercentage = useMemo(() => {
        const products = Number(totalProducts);

        if (!products) return 0;

        return Math.min(
            100,
            Math.round(
                (Number(inactiveProducts) / products) * 100
            )
        );
    }, [inactiveProducts, totalProducts]);

    const pendingPercentage = useMemo(() => {
        const orders = Number(totalOrders);

        if (!orders) return 0;

        return Math.min(
            100,
            Math.round(
                (Number(pendingOrders) / orders) * 100
            )
        );
    }, [pendingOrders, totalOrders]);

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="statistics-page">
                <div className="statistics-loading">
                    <div className="statistics-spinner" />

                    <h3>Loading statistics</h3>

                    <p>
                        Fetching your latest store
                        performance data...
                    </p>
                </div>
            </div>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (error) {
        return (
            <div className="statistics-page">
                <div className="statistics-error-card">
                    <div className="statistics-error-icon">
                        !
                    </div>

                    <h3>
                        Unable to load statistics
                    </h3>

                    <p>{error}</p>

                    <button
                        type="button"
                        className="statistics-primary-btn"
                        onClick={() => loadStatistics()}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <main className="statistics-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="statistics-header">

                <div className="statistics-heading">

                    <span className="statistics-eyebrow">
                        NEXCART ADMIN
                    </span>

                    <h1>Store Statistics</h1>

                    <p>
                        Monitor your store performance
                        and business activity.
                    </p>

                </div>

                <div className="statistics-actions">

                    <button
                        type="button"
                        className="statistics-refresh-btn"
                        onClick={() => loadStatistics(true)}
                        disabled={refreshing}
                    >
                        <span
                            className={
                                refreshing
                                    ? "refresh-icon spinning"
                                    : "refresh-icon"
                            }
                        >
                            ↻
                        </span>

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="statistics-dashboard-btn"
                        onClick={goToDashboard}
                    >
                        ← Dashboard
                    </button>

                </div>

            </section>

            {/* =================================================
                MAIN STATISTICS
            ================================================= */}

            <section className="statistics-main-grid">

                {/* USERS */}

                <article className="statistics-card">

                    <div className="statistics-card-top">
                        <div className="statistics-icon users-icon">
                            ♟
                        </div>

                        <span className="statistics-card-label">
                            USERS
                        </span>
                    </div>

                    <div className="statistics-card-body">

                        <span className="statistics-card-title">
                            Total Users
                        </span>

                        <strong className="statistics-card-number">
                            {formatNumber(totalUsers)}
                        </strong>

                    </div>

                    <span className="statistics-card-footer">
                        Registered customers
                    </span>

                </article>

                {/* PRODUCTS */}

                <article className="statistics-card">

                    <div className="statistics-card-top">
                        <div className="statistics-icon products-icon">
                            ◆
                        </div>

                        <span className="statistics-card-label">
                            INVENTORY
                        </span>
                    </div>

                    <div className="statistics-card-body">

                        <span className="statistics-card-title">
                            Total Products
                        </span>

                        <strong className="statistics-card-number">
                            {formatNumber(totalProducts)}
                        </strong>

                    </div>

                    <span className="statistics-card-footer">
                        Products in catalog
                    </span>

                </article>

                {/* ORDERS */}

                <article className="statistics-card">

                    <div className="statistics-card-top">
                        <div className="statistics-icon orders-icon">
                            ▣
                        </div>

                        <span className="statistics-card-label">
                            ORDERS
                        </span>
                    </div>

                    <div className="statistics-card-body">

                        <span className="statistics-card-title">
                            Total Orders
                        </span>

                        <strong className="statistics-card-number">
                            {formatNumber(totalOrders)}
                        </strong>

                    </div>

                    <span className="statistics-card-footer">
                        All store orders
                    </span>

                </article>

                {/* REVENUE */}

                <article className="statistics-card">

                    <div className="statistics-card-top">
                        <div className="statistics-icon revenue-icon">
                            ₹
                        </div>

                        <span className="statistics-card-label revenue-label">
                            REVENUE
                        </span>
                    </div>

                    <div className="statistics-card-body">

                        <span className="statistics-card-title">
                            Total Revenue
                        </span>

                        <strong className="statistics-card-number revenue-number">
                            {formatCurrency(totalRevenue)}
                        </strong>

                    </div>

                    <span className="statistics-card-footer">
                        From non-cancelled orders
                    </span>

                </article>

            </section>

            {/* =================================================
                SECONDARY STATISTICS
            ================================================= */}

            <section className="statistics-secondary-grid">

                <article className="statistics-mini-card">

                    <div className="mini-card-icon pending">
                        ⏳
                    </div>

                    <div className="mini-card-content">
                        <span>Pending Orders</span>

                        <strong>
                            {formatNumber(pendingOrders)}
                        </strong>
                    </div>

                    <span className="mini-card-percent">
                        {pendingPercentage}%
                    </span>

                </article>

                <article className="statistics-mini-card">

                    <div className="mini-card-icon active">
                        ✓
                    </div>

                    <div className="mini-card-content">
                        <span>Active Products</span>

                        <strong>
                            {formatNumber(activeProducts)}
                        </strong>
                    </div>

                    <span className="mini-card-percent active-percent">
                        {activePercentage}%
                    </span>

                </article>

                <article className="statistics-mini-card">

                    <div className="mini-card-icon inactive">
                        ○
                    </div>

                    <div className="mini-card-content">
                        <span>Inactive Products</span>

                        <strong>
                            {formatNumber(inactiveProducts)}
                        </strong>
                    </div>

                    <span className="mini-card-percent">
                        {inactivePercentage}%
                    </span>

                </article>

            </section>

            {/* =================================================
                PERFORMANCE OVERVIEW
            ================================================= */}

            <section className="statistics-overview">

                <div className="overview-header">

                    <span className="statistics-section-label">
                        STORE OVERVIEW
                    </span>

                    <h2>
                        Performance Overview
                    </h2>

                    <p>
                        A quick look at your current
                        store activity.
                    </p>

                </div>

                <div className="overview-grid">

                    {/* PRODUCT HEALTH */}

                    <article className="overview-card">

                        <div className="overview-card-header">

                            <div>
                                <span>
                                    Product Health
                                </span>

                                <h3>
                                    {activePercentage}% Active
                                </h3>
                            </div>

                            <div className="overview-circle active-circle">
                                ✓
                            </div>

                        </div>

                        <div className="progress-track">
                            <div
                                className="progress-fill active-fill"
                                style={{
                                    width: `${activePercentage}%`,
                                }}
                            />
                        </div>

                        <div className="progress-info">

                            <div>
                                <span>Active</span>
                                <strong>
                                    {formatNumber(
                                        activeProducts
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Inactive</span>
                                <strong>
                                    {formatNumber(
                                        inactiveProducts
                                    )}
                                </strong>
                            </div>

                        </div>

                    </article>

                    {/* ORDER STATUS */}

                    <article className="overview-card">

                        <div className="overview-card-header">

                            <div>
                                <span>
                                    Order Status
                                </span>

                                <h3>
                                    {formatNumber(
                                        pendingOrders
                                    )} Pending
                                </h3>
                            </div>

                            <div className="overview-circle pending-circle">
                                ⏳
                            </div>

                        </div>

                        <div className="progress-track">
                            <div
                                className="progress-fill pending-fill"
                                style={{
                                    width: `${pendingPercentage}%`,
                                }}
                            />
                        </div>

                        <div className="progress-info">

                            <div>
                                <span>Pending</span>
                                <strong>
                                    {formatNumber(
                                        pendingOrders
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Other Orders</span>
                                <strong>
                                    {formatNumber(
                                        Math.max(
                                            0,
                                            Number(totalOrders) -
                                            Number(pendingOrders)
                                        )
                                    )}
                                </strong>
                            </div>

                        </div>

                    </article>

                    {/* REVENUE */}

                    <article className="overview-card revenue-overview-card">

                        <div className="overview-card-header">

                            <div>
                                <span>
                                    Store Revenue
                                </span>

                                <h3>
                                    {formatCurrency(
                                        totalRevenue
                                    )}
                                </h3>
                            </div>

                            <div className="overview-circle revenue-circle">
                                ₹
                            </div>

                        </div>

                        <div className="revenue-message">

                            <span className="revenue-dot" />

                            Current total revenue

                        </div>

                        <p className="revenue-note">
                            Revenue excludes cancelled orders.
                        </p>

                    </article>

                </div>

            </section>

        </main>
    );
}