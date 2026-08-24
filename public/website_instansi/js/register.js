/* ============================================================
   SIBAPER - USER REGISTRATION
============================================================ */


/* ============================================================
   ELEMENT
============================================================ */

const registerForm =
    document.getElementById("registerForm");

const registerMessage =
    document.getElementById("registerMessage");

const backToLoginButton =
    document.getElementById("backToLoginButton");



/* ============================================================
   MESSAGE
============================================================ */

function showRegisterMessage(
    message,
    type = "error"
) {

    if (!registerMessage) {
        return;
    }

    registerMessage.textContent =
        message;

    registerMessage.className =
        "login-message " + type;

}



/* ============================================================
   GET REGISTERED USERS
============================================================ */

function getRegisteredUsers() {

    const users =
        localStorage.getItem(
            "sibaperRegisteredUsers"
        );


    if (!users) {

        return [];

    }


    try {

        return JSON.parse(users);

    } catch (error) {

        return [];

    }

}



/* ============================================================
   SAVE USERS
============================================================ */

function saveRegisteredUsers(users) {

    localStorage.setItem(
        "sibaperRegisteredUsers",
        JSON.stringify(users)
    );

}



/* ============================================================
   REGISTER
============================================================ */

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();



            const name =
                document
                    .getElementById("registerName")
                    .value
                    .trim();


            const username =
                document
                    .getElementById("registerUsername")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("registerEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("registerPassword")
                    .value;


            const passwordConfirm =
                document
                    .getElementById(
                        "registerPasswordConfirm"
                    )
                    .value;



            /* =================================================
               VALIDASI
            ================================================= */

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



            /* =================================================
               AMBIL USER
            ================================================= */

            const users =
                getRegisteredUsers();



            /* =================================================
               CEK USERNAME
            ================================================= */

            const usernameExists =
                users.some(
                    function (user) {

                        return (
                            user.username.toLowerCase() ===
                            username.toLowerCase()
                        );

                    }
                );


            if (usernameExists) {

                showRegisterMessage(
                    "Username sudah digunakan."
                );

                return;

            }



            /* =================================================
               CEK EMAIL
            ================================================= */

            const emailExists =
                users.some(
                    function (user) {

                        return (
                            user.email.toLowerCase() ===
                            email
                        );

                    }
                );


            if (emailExists) {

                showRegisterMessage(
                    "Email sudah terdaftar."
                );

                return;

            }



            /* =================================================
               BUAT USER

               ROLE SELALU USER

               TIDAK BOLEH DIUBAH DARI FORM
            ================================================= */

            const newUser = {

                id:
                    "USR-" +
                    Date.now(),

                name:
                    name,

                username:
                    username,

                email:
                    email,

                password:
                    password,

                role:
                    "user",

                status:
                    "active",

                createdAt:
                    new Date().toISOString()

            };



            users.push(newUser);


            saveRegisteredUsers(users);



            /* =================================================
               BERHASIL
            ================================================= */

            showRegisterMessage(
                "Registrasi berhasil. Silakan login.",
                "success"
            );



            registerForm.reset();



            setTimeout(
                function () {

                    window.location.href =
                        "login.html";

                },
                1200
            );

        }
    );

}



/* ============================================================
   BACK TO LOGIN
============================================================ */

if (backToLoginButton) {

    backToLoginButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "login.html";

        }
    );

}