import { useEffect, useState } from "react";

import { getAdminDashboard } from "../api/adminApi";


function AdminDashboard({
    onNavigate,
}) {

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD DASHBOARD
    // =====================================================

    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const data =
                await getAdminDashboard();

            setDashboard(data);

        } catch (err) {

            console.error(
                "Unable to load admin dashboard:",
                err
            );

            setError(
                err.message ||
                "Unable to load admin dashboard."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // LOAD ON PAGE OPEN
    // =====================================================

    useEffect(() => {

        loadDashboard();

    }, []);


    // =====================================================
    // NAVIGATION
    // =====================================================

    function navigate(path) {

        if (onNavigate) {

            onNavigate(path);

        } else {

            window.location.href = path;

        }
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-dashboard-page">

                <div className="admin-dashboard-state">

                    <div className="loading-spinner">
                    </div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Loading dashboard...
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

            <div className="admin-dashboard-page">

                <div className="admin-dashboard-state">

                    <div className="admin-state-icon">
                        !
                    </div>

                    <h1>
                        Unable to Load Dashboard
                    </h1>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={loadDashboard}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // =====================================================
    // VALUES
    // =====================================================

    const totalProducts =
        Number(
            dashboard?.totalProducts || 0
        );

    const activeProducts =
        Number(
            dashboard?.activeProducts || 0
        );

    const totalOrders =
        Number(
            dashboard?.totalOrders || 0
        );

    const totalUsers =
        Number(
            dashboard?.totalUsers || 0
        );


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-dashboard-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-dashboard-header">

                <div>

                    <p className="admin-label">
                        NEXCART ADMIN
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p className="admin-dashboard-subtitle">
                        Manage your store from one place.
                    </p>

                </div>


                <button
                    type="button"
                    className="admin-refresh-button"
                    onClick={loadDashboard}
                >
                    ↻ Refresh
                </button>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="admin-stats-grid">


                {/* PRODUCTS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        📦
                    </div>

                    <div>

                        <span>
                            Total Products
                        </span>

                        <strong>
                            {totalProducts}
                        </strong>

                    </div>

                </div>


                {/* ACTIVE PRODUCTS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        ✓
                    </div>

                    <div>

                        <span>
                            Active Products
                        </span>

                        <strong>
                            {activeProducts}
                        </strong>

                    </div>

                </div>


                {/* ORDERS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        🛒
                    </div>

                    <div>

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {totalOrders}
                        </strong>

                    </div>

                </div>


                {/* USERS */}

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        👥
                    </div>

                    <div>

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {totalUsers}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <div className="admin-section">

                <div className="admin-section-header">

                    <div>

                        <p className="admin-label">
                            MANAGEMENT
                        </p>

                        <h2>
                            Quick Actions
                        </h2>

                    </div>

                </div>


                <div className="admin-actions-grid">


                    {/* =================================================
                        PRODUCTS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-action-card"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                    >

                        <span className="admin-action-icon">
                            📦
                        </span>

                        <span className="admin-action-content">

                            <strong>
                                Manage Products
                            </strong>

                            <small>
                                Add, edit and remove products
                            </small>

                        </span>

                        <span className="admin-action-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        ORDERS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-action-card"
                        onClick={() =>
                            navigate(
                                "/admin/orders"
                            )
                        }
                    >

                        <span className="admin-action-icon">
                            🛒
                        </span>

                        <span className="admin-action-content">

                            <strong>
                                Manage Orders
                            </strong>

                            <small>
                                View and update customer orders
                            </small>

                        </span>

                        <span className="admin-action-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        USERS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-action-card"
                        onClick={() =>
                            navigate(
                                "/admin/users"
                            )
                        }
                    >

                        <span className="admin-action-icon">
                            👥
                        </span>

                        <span className="admin-action-content">

                            <strong>
                                Manage Users
                            </strong>

                            <small>
                                View registered customers
                            </small>

                        </span>

                        <span className="admin-action-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        STATISTICS
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-action-card"
                        onClick={() =>
                            navigate(
                                "/admin/statistics"
                            )
                        }
                    >

                        <span className="admin-action-icon">
                            📊
                        </span>

                        <span className="admin-action-content">

                            <strong>
                                Statistics
                            </strong>

                            <small>
                                View store performance and analytics
                            </small>

                        </span>

                        <span className="admin-action-arrow">
                            →
                        </span>

                    </button>


                    {/* =================================================
                        STORE
                    ================================================= */}

                    <button
                        type="button"
                        className="admin-action-card"
                        onClick={() =>
                            navigate("/")
                        }
                    >

                        <span className="admin-action-icon">
                            🏪
                        </span>

                        <span className="admin-action-content">

                            <strong>
                                View Store
                            </strong>

                            <small>
                                Return to NEXCART storefront
                            </small>

                        </span>

                        <span className="admin-action-arrow">
                            →
                        </span>

                    </button>


                </div>

            </div>

        </div>
    );
}


export default AdminDashboard;