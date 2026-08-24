/* ============================================================
   SIBAPER - AUTHENTICATION
============================================================ */

/* Default demo credentials */
const DEFAULT_DEMO_ADMIN = {
    username: "admin",
    email: "admin@sibaper.local",
    name: "Administrator",
    role: "admin",
    password: "admin123",
    isCustom: false,
    updatedAt: null
};

/* ============================================================
   GET ADMIN ACCOUNT (CUSTOM OR DEFAULT)
============================================================ */

function getSibaperAdminAccount() {
    try {
        const raw = localStorage.getItem("sibaperAdminAccount");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.username) {
                return {
                    ...DEFAULT_DEMO_ADMIN,
                    ...parsed,
                    isCustom: true
                };
            }
        }
    } catch (e) {
        console.error("Error reading sibaperAdminAccount:", e);
    }
    return { ...DEFAULT_DEMO_ADMIN };
}

/* ============================================================
   SAVE ADMIN ACCOUNT
============================================================ */

function saveSibaperAdminAccount(accountData) {
    try {
        const current = getSibaperAdminAccount();
        const updated = {
            ...current,
            ...accountData,
            role: "admin",
            isCustom: true,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem("sibaperAdminAccount", JSON.stringify(updated));

        // Also sync active session if current user is admin
        const currentSession = getSibaperSession();
        if (currentSession && (currentSession.role === "admin" || currentSession.username === current.username)) {
            updateSibaperSession({
                username: updated.username,
                email: updated.email,
                name: updated.name || updated.username,
                role: "admin"
            });
        }

        return updated;
    } catch (e) {
        console.error("Error saving sibaperAdminAccount:", e);
        return null;
    }
}

/* ============================================================
   GET SESSION
============================================================ */

function getSibaperSession() {
    const session = localStorage.getItem("sibaperSession");
    if (!session) {
        return null;
    }

    try {
        return JSON.parse(session);
    } catch (error) {
        return null;
    }
}

/* ============================================================
   UPDATE SESSION
============================================================ */

function updateSibaperSession(data) {
    const current = getSibaperSession() || {};
    const updated = {
        ...current,
        ...data,
        loginTime: current.loginTime || new Date().toISOString()
    };
    localStorage.setItem("sibaperSession", JSON.stringify(updated));
    return updated;
}

/* ============================================================
   REQUIRE LOGIN
============================================================ */

function requireLogin() {
    const session = getSibaperSession();
    if (!session) {
        window.location.href = "login.html";
        return null;
    }
    return session;
}

/* ============================================================
   LOGOUT
============================================================ */

function logoutSibaper() {
    localStorage.removeItem("sibaperSession");
    window.location.href = "login.html";
}

/* ============================================================
   ROLE CHECK
============================================================ */

function hasRole(role) {
    const session = getSibaperSession();
    if (!session) {
        return false;
    }
    return session.role === role;
}