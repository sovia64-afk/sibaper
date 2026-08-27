/* ============================================================
   SIBAPER - USER REGISTRATION VIA SUPABASE AUTH
   ------------------------------------------------------------
   Profile user dibuat otomatis oleh trigger Supabase.
   File ini TIDAK melakukan INSERT/UPSERT ke profiles dari browser.
============================================================ */

const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");
const backToLoginButton = document.getElementById("backToLoginButton");


/* ============================================================
   MESSAGE
============================================================ */

function showRegisterMessage(message, type = "error") {
    if (!registerMessage) return;

    registerMessage.textContent = message;
    registerMessage.className = "login-message " + type;
}


/* ============================================================
   BACK TO LOGIN
============================================================ */

if (backToLoginButton) {
    backToLoginButton.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}


/* ============================================================
   REGISTRATION
============================================================ */

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        /* ------------------------------------------------------
           AMBIL DATA FORM
        ------------------------------------------------------ */

        const name =
            document.getElementById("registerName")?.value.trim() || "";

        const username =
            document.getElementById("registerUsername")?.value.trim() || "";

        const email =
            document.getElementById("registerEmail")?.value
                .trim()
                .toLowerCase() || "";

        const password =
            document.getElementById("registerPassword")?.value || "";

        const passwordConfirm =
            document.getElementById("registerPasswordConfirm")?.value || "";


        /* ------------------------------------------------------
           VALIDASI
        ------------------------------------------------------ */

        if (
            !name ||
            !username ||
            !email ||
            !password ||
            !passwordConfirm
        ) {
            showRegisterMessage(
                "Semua data wajib diisi."
            );
            return;
        }


        if (username.length < 4) {
            showRegisterMessage(
                "Username minimal 4 karakter."
            );
            return;
        }


        if (!/^[A-Za-z0-9._-]+$/.test(username)) {
            showRegisterMessage(
                "Username hanya boleh menggunakan huruf, angka, titik, underscore, atau strip."
            );
            return;
        }


        if (password.length < 6) {
            showRegisterMessage(
                "Password minimal 6 karakter."
            );
            return;
        }


        if (password !== passwordConfirm) {
            showRegisterMessage(
                "Konfirmasi password tidak sama."
            );
            return;
        }


        /* ------------------------------------------------------
           SUPABASE CLIENT
        ------------------------------------------------------ */

        const sb = window.sibaperSupabase;

        if (!sb) {
            showRegisterMessage(
                "Koneksi Supabase belum tersedia."
            );
            return;
        }


        /* ------------------------------------------------------
           CEK USERNAME
        ------------------------------------------------------ */

        showRegisterMessage(
            "Memeriksa username...",
            "success"
        );


        const {
            data: existing,
            error: checkError
        } = await sb
            .from("profiles")
            .select("id")
            .eq("username", username)
            .maybeSingle();


        if (checkError) {

            console.error(
                "SIBAPER username check:",
                checkError
            );

            showRegisterMessage(
                "Gagal memeriksa username. Silakan coba lagi."
            );

            return;
        }


        if (existing) {

            showRegisterMessage(
                "Username sudah digunakan."
            );

            return;
        }


        /* ------------------------------------------------------
           BUAT AKUN SUPABASE AUTH
        ------------------------------------------------------ */

        showRegisterMessage(
            "Membuat akun...",
            "success"
        );


        const {
            data,
            error
        } = await sb.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {
                    name: name,
                    username: username,
                    role: "user"
                }

            }

        });


        /* ------------------------------------------------------
           ERROR AUTH
        ------------------------------------------------------ */

        if (error) {

            console.error(
                "SIBAPER registration:",
                error
            );


            const message =
                String(error.message || "").toLowerCase();


            if (
                message.includes("already registered") ||
                message.includes("already exists") ||
                message.includes("user already registered")
            ) {

                showRegisterMessage(
                    "Email tersebut sudah terdaftar. Gunakan email lain."
                );

            } else {

                showRegisterMessage(
                    error.message ||
                    "Registrasi gagal."
                );

            }

            return;
        }


        /* ------------------------------------------------------
           AUTH USER BERHASIL
           
           PROFILE TIDAK DIBUAT DARI SINI.

           Supabase Database Trigger:
           on_auth_user_created_sibaper

           akan membuat profile otomatis.
        ------------------------------------------------------ */

        if (!data || !data.user) {

            showRegisterMessage(
                "Registrasi tidak menghasilkan akun."
            );

            return;
        }


        console.log(
            "SIBAPER: akun Auth berhasil dibuat:",
            data.user.id
        );


        /* ------------------------------------------------------
           JIKA EMAIL CONFIRMATION AKTIF
        ------------------------------------------------------ */

        if (!data.session) {

            showRegisterMessage(
                "Registrasi berhasil. Silakan cek email untuk konfirmasi akun.",
                "success"
            );

        } else {

            showRegisterMessage(
                "Registrasi berhasil. Silakan login.",
                "success"
            );

        }


        /* ------------------------------------------------------
           LOGOUT SESSION JIKA ADA
        ------------------------------------------------------ */

        try {
            await sb.auth.signOut();
        } catch (logoutError) {
            console.warn(
                "SIBAPER logout setelah registrasi:",
                logoutError
            );
        }


        /* ------------------------------------------------------
           RESET FORM
        ------------------------------------------------------ */

        registerForm.reset();


        /* ------------------------------------------------------
           KEMBALI KE LOGIN
        ------------------------------------------------------ */

        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);

    });

}