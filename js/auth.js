/* ============================================================
   SIBAPER - SUPABASE AUTHENTICATION
   ------------------------------------------------------------
   Generic session + account settings for ADMIN and USER.
   ============================================================ */
(function () {
    "use strict";

    const DEFAULT_ADMIN = {
        username: "admin",
        email: "admin@sibaper.local",
        name: "Administrator",
        role: "admin",
        isCustom: false
    };

    function client() {
        return window.sibaperSupabase;
    }

    function getSibaperSession() {
        try {
            const raw = localStorage.getItem("sibaperSession");
            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    function updateSibaperSession(data) {
        const current = getSibaperSession() || {};
        const updated = {
            ...current,
            ...data,
            loginTime: current.loginTime || new Date().toISOString()
        };
        localStorage.setItem("sibaperSession", JSON.stringify(updated));
        document.dispatchEvent(new CustomEvent("sibaperSessionChanged"));
        return updated;
    }

    function getSibaperAdminAccount() {
        const session = getSibaperSession();
        if (session && session.role === "admin") {
            return { ...DEFAULT_ADMIN, ...session, isCustom: true };
        }
        return { ...DEFAULT_ADMIN };
    }

    /*
     * Save the ACCOUNT THAT IS CURRENTLY LOGGED IN.
     * This replaces the old admin-only save function.
     */
    async function saveSibaperAccount(accountData) {
        const sb = client();
        if (!sb) throw new Error("Koneksi Supabase belum tersedia.");

        const session = getSibaperSession();
        if (!session || !session.id) {
            throw new Error("Sesi pengguna tidak ditemukan. Silakan login kembali.");
        }

        const role = String(session.role || "user").toLowerCase() === "admin"
            ? "admin"
            : "user";

        const u = String(accountData.username || "").trim();
        const n = String(accountData.name || "").trim();
        const em = String(accountData.email || "").trim().toLowerCase();
        const pw = String(accountData.password || "");

        if (!u || !n || !em || !pw) {
            throw new Error("Username, nama, email, dan password wajib diisi.");
        }

        // Make sure the Supabase Auth session belongs to the same user.
        const { data: sessionData, error: sessionError } = await sb.auth.getSession();
        if (sessionError) throw sessionError;

        const authUser = sessionData?.session?.user;
        if (!authUser || authUser.id !== session.id) {
            throw new Error("Sesi Supabase tidak cocok dengan akun aktif. Silakan logout lalu login kembali.");
        }

        const { data: authData, error: authError } = await sb.auth.updateUser({
            email: em,
            password: pw,
            data: {
                name: n,
                username: u,
                role: role
            }
        });

        if (authError) throw authError;

        const finalUser = authData?.user || authUser;

        /*
         * Keep the public profile synchronized with Auth.
         * Admin has an UPDATE policy in the current schema.
         * If USER profile UPDATE is blocked by RLS, the error is
         * surfaced instead of silently overwriting another account.
         */
        const { error: profileError } = await sb
            .from("profiles")
            .update({
                name: n,
                username: u,
                email: em,
                role: role,
                status: "active",
                updated_at: new Date().toISOString()
            })
            .eq("id", finalUser.id);

        if (profileError) {
            throw new Error(
                "Password/Auth berhasil diperbarui, tetapi profil Supabase belum dapat diperbarui: " +
                profileError.message
            );
        }

        return updateSibaperSession({
            id: finalUser.id,
            username: u,
            email: finalUser.email || em,
            name: n,
            role: role
        });
    }

    // Backward-compatible name used by older code.
    async function saveSibaperAdminAccount(accountData) {
        const session = getSibaperSession();
        if (!session || session.role !== "admin") {
            throw new Error("Hanya admin yang dapat menggunakan fungsi admin.");
        }
        return saveSibaperAccount(accountData);
    }

    async function requireLogin() {
        const sb = client();

        if (!sb) {
            const session = getSibaperSession();
            if (!session) window.location.href = "login.html";
            return session;
        }

        const { data, error } = await sb.auth.getSession();
        if (error) {
            console.error("SIBAPER Auth session:", error);
        }

        if (!data.session) {
            localStorage.removeItem("sibaperSession");
            window.location.href = "login.html";
            return null;
        }

        const u = data.session.user;
        const meta = u.user_metadata || {};

        /*
         * Prefer the existing SIBAPER session because login.js
         * already loads the role/profile from public.profiles.
         * Only fill missing values from Auth metadata.
         */
        const old = getSibaperSession() || {};
        const session = updateSibaperSession({
            id: u.id,
            email: u.email || old.email || meta.email || "",
            username: old.username || meta.username || "",
            name: old.name || meta.name || old.username || meta.username || u.email || "",
            role: old.role || meta.role || "user"
        });

        return session;
    }

    async function logoutSibaper() {
        const sb = client();
        if (sb) await sb.auth.signOut();
        localStorage.removeItem("sibaperSession");
        window.location.href = "login.html";
    }

    function hasRole(role) {
        const session = getSibaperSession();
        return !!session && String(session.role).toLowerCase() === String(role).toLowerCase();
    }

    window.getSibaperSession = getSibaperSession;
    window.updateSibaperSession = updateSibaperSession;
    window.getSibaperAdminAccount = getSibaperAdminAccount;
    window.saveSibaperAccount = saveSibaperAccount;
    window.saveSibaperAdminAccount = saveSibaperAdminAccount;
    window.requireLogin = requireLogin;
    window.logoutSibaper = logoutSibaper;
    window.hasRole = hasRole;
})();
