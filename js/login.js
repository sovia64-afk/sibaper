/* ============================================================
   SIBAPER - LOGIN VIA SUPABASE AUTH
   ============================================================ */

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const registerUserButton = document.getElementById("registerUserButton");


function showLoginMessage(message, type = "error") {
    if (!loginMessage) return;

    loginMessage.textContent = message;
    loginMessage.className = "login-message " + type;
}


if (registerUserButton) {
    registerUserButton.addEventListener("click", () => {
        window.location.href = "register.html";
    });
}


if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (window.sibaperReady) {
            await window.sibaperReady;
        }


        // =====================================================
        // AMBIL INPUT
        // =====================================================

        const username =
            document.getElementById("username")?.value.trim() || "";

        const email =
            document.getElementById("email")?.value.trim().toLowerCase() || "";

        const password =
            document.getElementById("password")?.value || "";


        // =====================================================
        // VALIDASI
        // =====================================================

        if (!username || !email || !password) {

            showLoginMessage(
                "Username, email, dan password wajib diisi."
            );

            return;
        }


        // =====================================================
        // CEK SUPABASE
        // =====================================================

        const sb = window.sibaperSupabase;

        if (!sb) {

            console.error(
                "SIBAPER: window.sibaperSupabase tidak tersedia."
            );

            showLoginMessage(
                "Koneksi Supabase belum tersedia."
            );

            return;
        }


        showLoginMessage(
            "Memeriksa akun...",
            "success"
        );


        // =====================================================
        // LOGIN SUPABASE AUTH
        // =====================================================

        const {
            data: authData,
            error: authError
        } = await sb.auth.signInWithPassword({
            email: email,
            password: password
        });


        if (authError || !authData?.user) {

            console.error(
                "SIBAPER AUTH ERROR:",
                authError
            );

            showLoginMessage(
                authError?.message ||
                "Username, email, atau password tidak sesuai."
            );

            return;
        }


        const user = authData.user;

        const {
            data: sessionData,
            error: sessionError
        } = await sb.auth.getSession();

        if (sessionError || sessionData?.session?.user?.id !== user.id) {
            console.error(
                "SIBAPER AUTH SESSION ERROR:",
                sessionError
            );

            await sb.auth.signOut();

            showLoginMessage(
                "Sesi Supabase tidak berhasil dibuat. Silakan coba lagi."
            );

            return;
        }


        console.log(
            "SIBAPER AUTH BERHASIL:",
            user
        );


        // =====================================================
        // AMBIL PROFILE
        // =====================================================

        const {
            data: profile,
            error: profileError
        } = await sb
            .from("profiles")
            .select(
                "id,username,name,role,status,email"
            )
            .eq(
                "id",
                user.id
            )
            .maybeSingle();


        // =====================================================
        // JIKA QUERY PROFILE ERROR
        // =====================================================

        if (profileError) {

            console.error(
                "SIBAPER PROFILE ERROR:",
                profileError
            );

            await sb.auth.signOut();

            showLoginMessage(
                "Login berhasil, tetapi profil tidak dapat dibaca. Cek Console (F12)."
            );

            return;
        }


        // =====================================================
        // PROFILE TIDAK DITEMUKAN
        // =====================================================

        if (!profile) {

            console.error(
                "SIBAPER: profile tidak ditemukan untuk UID:",
                user.id
            );

            await sb.auth.signOut();

            showLoginMessage(
                "Akun berhasil masuk, tetapi profil admin tidak ditemukan."
            );

            return;
        }


        // =====================================================
        // DEBUG PROFILE
        // =====================================================

        console.log(
            "SIBAPER PROFILE:",
            profile
        );


        console.log(
            "Username input:",
            username
        );

        console.log(
            "Username database:",
            profile.username
        );

        console.log(
            "Email Auth:",
            user.email
        );

        console.log(
            "Email Profile:",
            profile.email
        );

        console.log(
            "Role:",
            profile.role
        );

        console.log(
            "Status:",
            profile.status
        );


        // =====================================================
        // CEK STATUS
        // =====================================================

        if (
            String(profile.status || "active").toLowerCase()
            !== "active"
        ) {

            await sb.auth.signOut();

            showLoginMessage(
                "Akun tidak aktif. Hubungi admin."
            );

            return;
        }


        // =====================================================
        // CEK USERNAME
        // =====================================================

        const dbUsername =
            String(profile.username || "")
                .trim()
                .toLowerCase();

        const inputUsername =
            String(username || "")
                .trim()
                .toLowerCase();


        if (
            dbUsername !== inputUsername
        ) {

            console.error(
                "SIBAPER USERNAME MISMATCH:",
                {
                    input: inputUsername,
                    database: dbUsername,
                    uid: user.id
                }
            );

            await sb.auth.signOut();

            showLoginMessage(
                "Username di database adalah: " +
                (profile.username || "(kosong)") +
                ". Masukkan username tersebut."
            );

            return;
        }


        // =====================================================
        // BUAT SESSION
        // =====================================================

        const session = {

            id: user.id,

            username:
                profile.username || "",

            email:
                profile.email ||
                user.email ||
                email,

            name:
                profile.name ||
                profile.username ||
                username,

            role:
                String(profile.role || "user").toLowerCase() === "admin"
                    ? "admin"
                    : "user",

            loginTime:
                new Date().toISOString()

        };


        localStorage.setItem(
            "sibaperSession",
            JSON.stringify(session)
        );


        // =====================================================
        // LOGIN BERHASIL
        // =====================================================

        showLoginMessage(
            "Login berhasil. Mengarahkan ke dashboard...",
            "success"
        );


        console.log(
            "SIBAPER LOGIN BERHASIL:",
            session
        );


        setTimeout(() => {

            if (
                String(session.role).toLowerCase()
                === "user"
            ) {

                window.location.href =
                    "user.html";

            } else {

                window.location.href =
                    "dashboard.html";

            }

        }, 500);

    });

}