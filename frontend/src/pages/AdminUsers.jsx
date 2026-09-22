import { useEffect, useState } from "react";

import {
    getAdminUsers,
    updateAdminUserStatus,
} from "../api/adminApi";

import "./AdminUsers.css";


function AdminUsers({ onNavigate }) {

    // =====================================================
    // STATE
    // =====================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [updatingId, setUpdatingId] = useState(null);


    // =====================================================
    // LOAD USERS
    // =====================================================

    async function loadUsers() {

        try {

            setLoading(true);
            setError("");

            const data = await getAdminUsers();

            setUsers(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                "Unable to load admin users:",
                err
            );

            setError(
                err.message ||
                "Unable to load admin users."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        loadUsers();

    }, []);


    // =====================================================
    // UPDATE USER STATUS
    // =====================================================

    async function handleStatusChange(
        userId,
        status
    ) {

        try {

            setUpdatingId(userId);
            setError("");

            await updateAdminUserStatus(
                userId,
                status
            );

            await loadUsers();

        } catch (err) {

            console.error(
                "Unable to update user status:",
                err
            );

            setError(
                err.message ||
                "Unable to update user status."
            );

        } finally {

            setUpdatingId(null);
        }
    }


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
    // FORMAT DATE
    // =====================================================

    function formatDate(date) {

        if (!date) {
            return "—";
        }

        try {

            return new Date(date).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short",
                }
            );

        } catch {

            return date;
        }
    }


    // =====================================================
    // STATUS CLASS
    // =====================================================

    function getStatusClass(status) {

        switch (
            String(status || "").toUpperCase()
        ) {

            case "ACTIVE":
                return "active";

            case "INACTIVE":
                return "inactive";

            default:
                return "";
        }
    }


    // =====================================================
    // ROLE DISPLAY
    // =====================================================

    function getRoles(user) {

        if (
            !user.roles ||
            !Array.isArray(user.roles) ||
            user.roles.length === 0
        ) {

            return "USER";
        }

        return user.roles
            .map((role) =>
                String(role).replace("ROLE_", "")
            )
            .join(", ");
    }


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="admin-users-page">

                <div className="admin-users-state">

                    <div className="loading-spinner">
                    </div>

                    <h1>
                        Manage Users
                    </h1>

                    <p>
                        Loading users...
                    </p>

                </div>

            </div>
        );
    }


    // =====================================================
    // PAGE
    // =====================================================

    return (

        <div className="admin-users-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="admin-users-header">

                <div>

                    <p className="admin-label">
                        NEXCART ADMIN
                    </p>

                    <h1>
                        Manage Users
                    </h1>

                    <p className="admin-users-subtitle">
                        View and manage registered customers.
                    </p>

                </div>


                <div className="admin-users-header-actions">

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Dashboard
                    </button>


                    <button
                        type="button"
                        className="primary-button"
                        onClick={loadUsers}
                    >
                        ↻ Refresh
                    </button>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="admin-users-error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        aria-label="Close error"
                    >
                        ×
                    </button>

                </div>
            )}


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="admin-users-summary">

                <div>

                    <strong>
                        {users.length}
                    </strong>

                    <span>
                        {users.length === 1
                            ? "User"
                            : "Users"}
                    </span>

                </div>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {users.length === 0 && (

                <div className="admin-users-empty">

                    <div className="admin-empty-icon">
                        👥
                    </div>

                    <h2>
                        No users found
                    </h2>

                    <p>
                        Registered users will appear here.
                    </p>

                </div>
            )}


            {/* =================================================
                USERS TABLE
            ================================================= */}

            {users.length > 0 && (

                <div className="admin-users-table-wrapper">

                    <table className="admin-users-table">

                        <thead>

                            <tr>

                                <th>
                                    User
                                </th>

                                <th>
                                    Contact
                                </th>

                                <th>
                                    Role
                                </th>

                                <th>
                                    Joined
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {users.map((user) => (

                                <tr key={user.id}>


                                    {/* =================================
                                        USER
                                    ================================= */}

                                    <td>

                                        <div className="admin-user-info">

                                            <div className="admin-user-avatar">

                                                {(
                                                    user.firstName ||
                                                    "U"
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}

                                            </div>


                                            <div>

                                                <strong>

                                                    {user.firstName}{" "}

                                                    {user.lastName}

                                                </strong>


                                                <small>
                                                    {user.email}
                                                </small>

                                            </div>

                                        </div>

                                    </td>


                                    {/* =================================
                                        CONTACT
                                    ================================= */}

                                    <td>

                                        <div className="admin-user-contact">

                                            <span>
                                                {user.email}
                                            </span>

                                            <small>
                                                {user.phone ||
                                                    "No phone"}
                                            </small>

                                        </div>

                                    </td>


                                    {/* =================================
                                        ROLE
                                    ================================= */}

                                    <td>

                                        <span className="admin-user-role">
                                            {getRoles(user)}
                                        </span>

                                    </td>


                                    {/* =================================
                                        JOINED
                                    ================================= */}

                                    <td>

                                        {formatDate(
                                            user.createdAt
                                        )}

                                    </td>


                                    {/* =================================
                                        STATUS
                                    ================================= */}

                                    <td>

                                        <span
                                            className={
                                                `admin-user-status ${getStatusClass(
                                                    user.status
                                                )}`
                                            }
                                        >
                                            {user.status ||
                                                "UNKNOWN"}
                                        </span>

                                    </td>


                                    {/* =================================
                                        ACTIONS
                                    ================================= */}

                                    <td>

                                        <div className="admin-user-actions">

                                            <button
                                                type="button"
                                                className={
                                                    String(
                                                        user.status
                                                    ).toUpperCase() ===
                                                    "ACTIVE"
                                                        ? "admin-small-button danger"
                                                        : "admin-small-button"
                                                }
                                                disabled={
                                                    updatingId ===
                                                    user.id
                                                }
                                                onClick={() =>
                                                    handleStatusChange(
                                                        user.id,
                                                        String(
                                                            user.status
                                                        ).toUpperCase() ===
                                                            "ACTIVE"
                                                            ? "INACTIVE"
                                                            : "ACTIVE"
                                                    )
                                                }
                                            >

                                                {updatingId ===
                                                user.id

                                                    ? "Updating..."

                                                    : String(
                                                        user.status
                                                    ).toUpperCase() ===
                                                        "ACTIVE"

                                                        ? "Deactivate"

                                                        : "Activate"}

                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}


export default AdminUsers;