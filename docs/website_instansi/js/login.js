/* ============================================================
   SIBAPER - LOGIN SYSTEM
============================================================ */


/* ============================================================
   ELEMENT
============================================================ */

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");

const registerUserButton =
    document.getElementById("registerUserButton");



/* ============================================================
   DEMO USER & ADMIN ACCOUNT
   ------------------------------------------------------------
   Mendukung kredensial admin bawaan dan akun admin yang telah
   diperbarui melalui Pengaturan Akun di Dashboard.
============================================================ */

function getAdminAccount() {
    try {
        const raw = localStorage.getItem("sibaperAdminAccount");
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.username) {
                return {
                    username: parsed.username,
                    email: parsed.email || "admin@sibaper.local",
                    password: parsed.password || "admin123",
                    name: parsed.name || "Administrator",
                    role: "admin"
                };
            }
        }
    } catch (e) {}
    return {
        username: "admin",
        email: "admin@sibaper.local",
        password: "admin123",
        name: "Administrator",
        role: "admin"
    };
}

const baseDemoUsers = [
    {
        username: "superadmin",
        email: "superadmin@sibaper.local",
        password: "superadmin123",
        name: "Super Administrator",
        role: "superadmin"
    },
    {
        username: "user",
        email: "user@sibaper.local",
        password: "user123",
        name: "User SIBAPER",
        role: "user"
    }
];

function getAllUsers() {
    const adminUser = getAdminAccount();
    return [
        adminUser,
        ...baseDemoUsers,
        ...getRegisteredUsers()
    ];
}

function getRegisteredUsers() {
    try {
        const users = JSON.parse(
            localStorage.getItem("sibaperRegisteredUsers") || "[]"
        );
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}



/* ============================================================
   MESSAGE
============================================================ */

function showLoginMessage(message, type = "error") {

    if (!loginMessage) {
        return;
    }

    loginMessage.textContent = message;

    loginMessage.className =
        "login-message " + type;

}



/* ============================================================
   LOGIN
============================================================ */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    .value;


            if (!username || !email || !password) {

                showLoginMessage(
                    "Username, email, dan password wajib diisi."
                );

                return;

            }



            const users = getAllUsers();

            const user = users.find(
                function (account) {

                    return (
                        String(account.username).toLowerCase() ===
                            username.toLowerCase()
                        &&
                        String(account.email).toLowerCase() ===
                            email
                        &&
                        account.password ===
                            password
                        &&
                        (account.status || "active") ===
                            "active"
                    );

                }
            );



            if (!user) {

                showLoginMessage(
                    "Username, email, atau password tidak sesuai."
                );

                return;

            }



            /* =================================================
               SIMPAN SESSION
            ================================================= */

            const session = {

                username: user.username,

                email: user.email,

                name: user.name,

                role: user.role,

                loginTime: new Date().toISOString()

            };


            localStorage.setItem(
                "sibaperSession",
                JSON.stringify(session)
            );



            showLoginMessage(
                "Login berhasil. Mengarahkan ke dashboard...",
                "success"
            );



            setTimeout(
                function () {

                    window.location.href =
                        user.role === "user"
                            ? "user.html"
                            : "dashboard.html";

                },
                700
            );

        }
    );

}



/* ============================================================
   REGISTRASI USER
============================================================ */

if (registerUserButton) {

    registerUserButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "register.html";

        }
    );

}