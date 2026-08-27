/* ============================================================
   SIBAPER - ACCOUNT SETTINGS
   ------------------------------------------------------------
   BERLAKU UNTUK:
   - ADMIN
   - USER

   Semua data akun diambil berdasarkan:
   Supabase Auth user.id
   +
   public.profiles

   Tidak menggunakan akun admin default.
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       HELPER
    ======================================================== */

    const $ = id =>
        document.getElementById(id);


    /* ========================================================
       ELEMENT
    ======================================================== */

    const wrapper =
        $("userDropdownWrapper");

    const dropdownBtn =
        $("userDropdownBtn");

    const openBtn =
        $("btnOpenAccountSettings");

    const logoutBtn =
        $("dropdownLogoutBtn");

    const modal =
        $("adminSettingsModal");

    const closeBtn =
        $("adminSettingsClose");

    const cancelBtn =
        $("adminSettingsCancel");

    const form =
        $("adminAccountForm");

    const message =
        $("adminSettingsMessage");

    const resetBtn =
        $("btnResetDefaultAdmin");


    const username =
        $("adminUsernameInput");

    const name =
        $("adminNameInput");

    const email =
        $("adminEmailInput");

    const password =
        $("adminPasswordInput");

    const passwordConfirm =
        $("adminPasswordConfirmInput");


    /* ========================================================
       SHOW MESSAGE
    ======================================================== */

    function show(
        msg,
        type = "info"
    ) {

        if (!message) return;


        message.style.display =
            "block";


        message.className =
            "settings-message " +
            type;


        message.textContent =
            msg;
    }


    /* ========================================================
       HIDE MESSAGE
    ======================================================== */

    function hide() {

        if (!message) return;


        message.style.display =
            "none";


        message.textContent =
            "";
    }


    /* ========================================================
       GET SESSION
    ======================================================== */

    function getSession() {

        if (
            typeof window.getSibaperSession ===
            "function"
        ) {

            return window.getSibaperSession();

        }


        try {

            const raw =
                localStorage.getItem(
                    "sibaperSession"
                );


            return raw
                ? JSON.parse(raw)
                : null;

        } catch (_) {

            return null;

        }
    }


    /* ========================================================
       GET AUTH + PROFILE TERBARU
       --------------------------------------------------------
       JANGAN percaya session lama.
    ======================================================== */

    async function getFreshAccount() {

        const sb =
            window.sibaperSupabase;


        if (!sb) {

            throw new Error(
                "Koneksi Supabase belum tersedia."
            );
        }


        /* ----------------------------------------------------
           AUTH SESSION
        ---------------------------------------------------- */

        const {
            data,
            error
        } =
            await sb.auth.getSession();


        if (error) {
            throw error;
        }


        const authSession =
            data?.session;


        if (!authSession) {

            throw new Error(
                "Sesi Supabase sudah berakhir. Silakan login kembali."
            );
        }


        const authUser =
            authSession.user;


        /* ----------------------------------------------------
           PROFILE
        ---------------------------------------------------- */

        const {
            data: profile,
            error: profileError
        } =
            await sb
                .from("profiles")
                .select(
                    "id,name,username,email,role,status"
                )
                .eq(
                    "id",
                    authUser.id
                )
                .maybeSingle();


        if (profileError) {

            console.error(
                "SIBAPER profile:",
                profileError
            );

            throw profileError;
        }


        if (!profile) {

            throw new Error(
                "Profil akun tidak ditemukan di Supabase."
            );
        }


        if (
            profile.status &&
            profile.status !== "active"
        ) {

            throw new Error(
                "Akun tidak aktif. Hubungi admin."
            );
        }


        /* ----------------------------------------------------
           SESSION BARU
        ---------------------------------------------------- */

        const freshSession = {

            id:
                authUser.id,

            username:
                profile.username || "",

            name:
                profile.name ||
                profile.username ||
                authUser.email ||
                "",

            email:
                profile.email ||
                authUser.email ||
                "",

            role:
                profile.role ||
                "user",

            status:
                profile.status ||
                "active"

        };


        if (
            typeof window.updateSibaperSession ===
            "function"
        ) {

            window.updateSibaperSession(
                freshSession
            );

        } else {

            localStorage.setItem(
                "sibaperSession",
                JSON.stringify(
                    freshSession
                )
            );
        }


        return freshSession;
    }


    /* ========================================================
       SYNC UI
    ======================================================== */

    function syncUI(session) {

        if (!session) return;


        const display =
            session.name ||
            session.username ||
            "Pengguna";


        const isAdmin =
            String(session.role || "").toLowerCase() === "admin";


        const roleText =
            isAdmin
                ? "Admin"
                : "User";


        const avatar =
            display
                .charAt(0)
                .toUpperCase();


        /* ----------------------------------------------------
           HEADER
        ---------------------------------------------------- */

        if ($("currentUserName")) {

            $("currentUserName")
                .textContent =
                display;

        }


        if ($("currentUserRole")) {

            $("currentUserRole")
                .textContent =
                roleText;

        }


        if ($("topbarAvatar")) {

            $("topbarAvatar")
                .textContent =
                avatar;

        }


        /* ----------------------------------------------------
           DROPDOWN
        ---------------------------------------------------- */

        if ($("dropdownUserName")) {

            $("dropdownUserName")
                .textContent =
                display;

        }


        if ($("dropdownAvatar")) {

            $("dropdownAvatar")
                .textContent =
                avatar;

        }


        if ($("dropdownUserEmail")) {

            $("dropdownUserEmail")
                .textContent =
                session.email || "";

        }


        if ($("dropdownUserBadge")) {

            $("dropdownUserBadge")
                .textContent =
                isAdmin
                    ? "👤 Admin Instansi"
                    : "👤 User Instansi";

        }


        /* ----------------------------------------------------
           ACCOUNT INFO
        ---------------------------------------------------- */

        if ($("currentInfoUsername")) {

            $("currentInfoUsername")
                .textContent =
                session.username || "-";

        }


        if ($("currentInfoEmail")) {

            $("currentInfoEmail")
                .textContent =
                session.email || "-";

        }


        if ($("currentInfoName")) {

            $("currentInfoName")
                .textContent =
                display;

        }


        if ($("accountStatusText")) {

            $("accountStatusText")
                .textContent =
                "Akun Supabase Aktif";

        }


        if ($("currentInfoSecurity")) {

            $("currentInfoSecurity")
                .textContent =
                "Password dikelola oleh Supabase Auth";


            $("currentInfoSecurity")
                .className =
                "account-info-value text-green";

        }

        if ($("adminSettingsTitle")) {
            $("adminSettingsTitle").textContent =
                isAdmin ? "⚙️ Pengaturan Akun Admin" : "⚙️ Pengaturan Akun User";
        }

        if ($("accountSettingsRoleLabel")) {
            $("accountSettingsRoleLabel").textContent =
                isAdmin ? "ADMINISTRATOR SIBAPER" : "PENGGUNA SIBAPER";
        }

        if ($("accountRoleTag")) {
            $("accountRoleTag").textContent =
                "Role: " + (isAdmin ? "Administrator" : "User");
        }

        if ($("btnResetDefaultAdmin")) {
            $("btnResetDefaultAdmin").style.display = isAdmin ? "" : "none";
        }


        /* ----------------------------------------------------
           JUDUL MODAL
        ---------------------------------------------------- */

        document
            .querySelectorAll(
                ".admin-settings-title, " +
                ".admin-settings-heading"
            )
            .forEach(
                el => {

                    el.textContent =
                        isAdmin
                            ? "Pengaturan Akun Admin"
                            : "Pengaturan Akun User";

                }
            );


        /* ----------------------------------------------------
           LABEL HEADER
        ---------------------------------------------------- */

        document
            .querySelectorAll(
                "[data-account-role-label]"
            )
            .forEach(
                el => {

                    el.textContent =
                        isAdmin
                            ? "Administrator SIBAPER"
                            : "PENGGUNA SIBAPER";

                }
            );
    }


    /* ========================================================
       OPEN MODAL
       --------------------------------------------------------
       SELALU ambil data terbaru dari Supabase.
    ======================================================== */

    async function openModal() {

        hide();


        try {

            show(
                "Mengambil data akun...",
                "info"
            );


            const session =
                await getFreshAccount();


            /* ------------------------------------------------
               ISI FORM DENGAN DATA SUPABASE
            ------------------------------------------------ */

            if (username) {

                username.value =
                    session.username || "";

            }


            if (name) {

                name.value =
                    session.name || "";

            }


            if (email) {

                email.value =
                    session.email || "";

            }


            if (password) {

                password.value =
                    "";

            }


            if (passwordConfirm) {

                passwordConfirm.value =
                    "";

            }


            syncUI(
                session
            );


            hide();


            modal?.classList.add(
                "show"
            );


            /* ------------------------------------------------
               BUKA DROPDOWN DITUTUP
            ------------------------------------------------ */

            wrapper?.classList.remove(
                "open"
            );


        } catch (error) {

            console.error(
                "SIBAPER open account settings:",
                error
            );


            show(
                error?.message ||
                "Gagal mengambil data akun.",
                "error"
            );

        }
    }


    /* ========================================================
       CLOSE MODAL
    ======================================================== */

    function closeModal() {

        modal?.classList.remove(
            "show"
        );


        hide();
    }


    /* ========================================================
       DROPDOWN
    ======================================================== */

    dropdownBtn?.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            wrapper?.classList.toggle(
                "open"
            );

        }
    );


    /* ========================================================
       CLICK OUTSIDE DROPDOWN
    ======================================================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                wrapper &&
                !wrapper.contains(
                    event.target
                )
            ) {

                wrapper.classList.remove(
                    "open"
                );

            }

        }
    );


    /* ========================================================
       OPEN ACCOUNT SETTINGS
    ======================================================== */

    openBtn?.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();


            await openModal();

        }
    );


    /* ========================================================
       CLOSE
    ======================================================== */

    closeBtn?.addEventListener(
        "click",
        closeModal
    );


    cancelBtn?.addEventListener(
        "click",
        closeModal
    );


    modal?.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                closeModal();

            }

        }
    );


    /* ========================================================
       SHOW / HIDE PASSWORD
    ======================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const btn =
                event.target.closest(
                    ".btn-toggle-pw"
                );


            if (!btn) return;


            const input =
                $(btn.dataset.target);


            if (!input) return;


            input.type =
                input.type === "password"
                    ? "text"
                    : "password";


            btn.textContent =
                input.type === "password"
                    ? "👁️"
                    : "🙈";

        }
    );


    /* ========================================================
       RESET DEFAULT
    ======================================================== */

    resetBtn?.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            show(
                "Reset password default tidak tersedia. Gunakan password akun yang sedang login.",
                "info"
            );

        }
    );


    /* ========================================================
       SUBMIT ACCOUNT SETTINGS
    ======================================================== */

    form?.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            hide();


            try {

                /* --------------------------------------------
                   SELALU AMBIL AKUN TERBARU
                -------------------------------------------- */

                const session =
                    await getFreshAccount();


                const u =
                    username?.value
                        .trim() || "";


                const n =
                    name?.value
                        .trim() || "";


                const em =
                    email?.value
                        .trim()
                        .toLowerCase() || "";


                const pw =
                    password?.value || "";


                const pc =
                    passwordConfirm?.value ||
                    "";


                /* --------------------------------------------
                   VALIDASI
                -------------------------------------------- */

                if (
                    !u ||
                    !n ||
                    !em
                ) {

                    show(
                        "Username, nama, dan email wajib diisi.",
                        "error"
                    );

                    return;
                }


                if (u.length < 3) {

                    show(
                        "Username minimal 3 karakter.",
                        "error"
                    );

                    return;
                }


                if (
                    !/^[A-Za-z0-9._-]+$/.test(u)
                ) {

                    show(
                        "Username hanya boleh menggunakan huruf, angka, titik, underscore, atau strip.",
                        "error"
                    );

                    return;
                }


                if (pw || pc) {

                    if (pw.length < 6) {

                        show(
                            "Password minimal 6 karakter.",
                            "error"
                        );

                        return;
                    }


                    if (pw !== pc) {

                        show(
                            "Konfirmasi password tidak cocok.",
                            "error"
                        );

                        return;
                    }

                }


                const sb =
                    window.sibaperSupabase;


                if (!sb) {

                    throw new Error(
                        "Koneksi Supabase belum tersedia."
                    );

                }


                show(
                    "Menyimpan perubahan ke Supabase...",
                    "info"
                );


                /* --------------------------------------------
                   AUTH SESSION TERKINI
                -------------------------------------------- */

                const {
                    data: authData,
                    error: authSessionError
                } =
                    await sb.auth.getSession();


                if (
                    authSessionError ||
                    !authData?.session
                ) {

                    throw new Error(
                        "Sesi Supabase sudah berakhir. Silakan login kembali."
                    );

                }


                const authUser =
                    authData.session.user;


                /* --------------------------------------------
                   ROLE ASLI DARI PROFILE
                -------------------------------------------- */

                const {
                    data: currentProfile,
                    error: currentProfileError
                } =
                    await sb
                        .from("profiles")
                        .select(
                            "id,role,status"
                        )
                        .eq(
                            "id",
                            authUser.id
                        )
                        .maybeSingle();


                if (currentProfileError) {

                    throw currentProfileError;

                }


                if (!currentProfile) {

                    throw new Error(
                        "Profil akun tidak ditemukan."
                    );

                }


                const realRole =
                    currentProfile.role === "admin"
                        ? "admin"
                        : "user";


                /* --------------------------------------------
                   CEK USERNAME DUPLIKAT
                -------------------------------------------- */

                const {
                    data: existing,
                    error: usernameError
                } =
                    await sb
                        .from("profiles")
                        .select("id")
                        .eq(
                            "username",
                            u
                        )
                        .neq(
                            "id",
                            authUser.id
                        )
                        .maybeSingle();


                if (usernameError) {

                    throw usernameError;

                }


                if (existing) {

                    throw new Error(
                        "Username tersebut sudah digunakan oleh akun lain."
                    );

                }


                /* --------------------------------------------
                   UPDATE SUPABASE AUTH
                -------------------------------------------- */

                const authUpdate = {

                    data: {

                        name:
                            n,

                        username:
                            u,

                        role:
                            realRole

                    }

                };


                if (
                    em &&
                    em !== authUser.email
                ) {

                    authUpdate.email =
                        em;

                }


                if (pw) {

                    authUpdate.password =
                        pw;

                }


                const {
                    error: authError
                } =
                    await sb.auth.updateUser(
                        authUpdate
                    );


                if (authError) {

                    throw authError;

                }


                /* --------------------------------------------
                   UPDATE PROFILES
                -------------------------------------------- */

                const {
                    error: profileError
                } =
                    await sb
                        .from("profiles")
                        .update({

                            username:
                                u,

                            name:
                                n,

                            email:
                                em,

                            updated_at:
                                new Date().toISOString()

                        })
                        .eq(
                            "id",
                            authUser.id
                        );


                if (profileError) {

                    throw profileError;

                }


                /* --------------------------------------------
                   UPDATE LOCAL SESSION
                -------------------------------------------- */

                const newSession = {

                    id:
                        authUser.id,

                    username:
                        u,

                    name:
                        n,

                    email:
                        em,

                    role:
                        realRole,

                    status:
                        "active"

                };


                if (
                    typeof window.updateSibaperSession ===
                    "function"
                ) {

                    window.updateSibaperSession(
                        newSession
                    );

                } else {

                    localStorage.setItem(
                        "sibaperSession",
                        JSON.stringify(
                            newSession
                        )
                    );

                }


                /* --------------------------------------------
                   SYNC UI
                -------------------------------------------- */

                syncUI(
                    newSession
                );


                /* --------------------------------------------
                   MESSAGE
                -------------------------------------------- */

                show(
                    pw
                        ? "Data akun dan password berhasil diperbarui."
                        : "Data akun berhasil diperbarui.",
                    "success"
                );


                /* --------------------------------------------
                   CLEAR PASSWORD
                -------------------------------------------- */

                if (password) {

                    password.value =
                        "";

                }


                if (passwordConfirm) {

                    passwordConfirm.value =
                        "";

                }


                /* --------------------------------------------
                   TUTUP MODAL
                -------------------------------------------- */

                setTimeout(
                    closeModal,
                    1200
                );


            } catch (error) {

                console.error(
                    "SIBAPER account settings:",
                    error
                );


                show(
                    error?.message ||
                    "Gagal memperbarui akun.",
                    "error"
                );

            }

        }
    );


    /* ========================================================
       SESSION CHANGED
    ======================================================== */

    document.addEventListener(
        "sibaperSessionChanged",
        function () {

            const session =
                getSession();


            if (session) {

                syncUI(
                    session
                );

            }

        }
    );


    /* ========================================================
       INITIAL
    ======================================================== */

    const initialSession =
        getSession();


    if (initialSession) {

        syncUI(
            initialSession
        );

    }


})();