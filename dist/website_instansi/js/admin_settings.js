/* ============================================================
   SIBAPER - ADMIN ACCOUNT SETTINGS & USER DROPDOWN
============================================================ */

(function () {
    "use strict";

    // DOM Elements
    const userDropdownWrapper = document.getElementById("userDropdownWrapper");
    const userDropdownBtn = document.getElementById("userDropdownBtn");
    const userDropdownMenu = document.getElementById("userDropdownMenu");
    const btnOpenSettings = document.getElementById("btnOpenAccountSettings");
    const dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");

    // Topbar elements
    const topbarUserName = document.getElementById("currentUserName");
    const topbarUserRole = document.getElementById("currentUserRole");
    const topbarAvatar = document.getElementById("topbarAvatar");

    // Dropdown elements
    const dropdownAvatar = document.getElementById("dropdownAvatar");
    const dropdownUserName = document.getElementById("dropdownUserName");
    const dropdownUserEmail = document.getElementById("dropdownUserEmail");
    const dropdownUserBadge = document.getElementById("dropdownUserBadge");

    // Modal elements
    const settingsModal = document.getElementById("adminSettingsModal");
    const settingsClose = document.getElementById("adminSettingsClose");
    const settingsCancel = document.getElementById("adminSettingsCancel");
    const adminAccountForm = document.getElementById("adminAccountForm");
    const btnResetDefaultAdmin = document.getElementById("btnResetDefaultAdmin");
    const settingsMessage = document.getElementById("adminSettingsMessage");

    // Modal display elements
    const currentInfoUsername = document.getElementById("currentInfoUsername");
    const currentInfoEmail = document.getElementById("currentInfoEmail");
    const currentInfoName = document.getElementById("currentInfoName");
    const currentInfoSecurity = document.getElementById("currentInfoSecurity");
    const accountStatusBadge = document.getElementById("accountStatusBadge");
    const accountStatusText = document.getElementById("accountStatusText");

    // Form inputs
    const inputUsername = document.getElementById("adminUsernameInput");
    const inputName = document.getElementById("adminNameInput");
    const inputEmail = document.getElementById("adminEmailInput");
    const inputPassword = document.getElementById("adminPasswordInput");
    const inputPasswordConfirm = document.getElementById("adminPasswordConfirmInput");

    /* ============================================================
       UPDATE UI WITH ACTIVE SESSION & ADMIN DATA
    ============================================================ */
    function syncUserUI() {
        const session = typeof getSibaperSession === "function" ? getSibaperSession() : null;
        const adminAccount = typeof getSibaperAdminAccount === "function" ? getSibaperAdminAccount() : null;

        if (!session) return;

        const displayName = session.name || session.username || "Administrator";
        const roleName = session.role === "superadmin" ? "Super Admin" : (session.role === "user" ? "User Instansi" : "Admin");
        const email = session.email || (adminAccount ? adminAccount.email : "admin@sibaper.local");
        const avatarLetter = displayName.charAt(0).toUpperCase();

        // Topbar
        if (topbarUserName) topbarUserName.textContent = displayName;
        if (topbarUserRole) topbarUserRole.textContent = roleName;
        if (topbarAvatar) topbarAvatar.textContent = avatarLetter;

        // Dropdown Header
        if (dropdownAvatar) dropdownAvatar.textContent = avatarLetter;
        if (dropdownUserName) dropdownUserName.textContent = displayName;
        if (dropdownUserEmail) dropdownUserEmail.textContent = email;
        if (dropdownUserBadge) {
            dropdownUserBadge.textContent = "👤 " + (session.role === "admin" ? "Admin Instansi" : (session.role === "superadmin" ? "Super Admin" : "User"));
        }

        // Modal Current Info
        if (adminAccount) {
            if (currentInfoUsername) currentInfoUsername.textContent = adminAccount.username;
            if (currentInfoEmail) currentInfoEmail.textContent = adminAccount.email;
            if (currentInfoName) currentInfoName.textContent = adminAccount.name || adminAccount.username;

            if (accountStatusBadge && accountStatusText) {
                if (adminAccount.isCustom) {
                    accountStatusBadge.className = "account-status-badge custom";
                    accountStatusText.textContent = "Akun Resmi Instansi (Aktif)";
                } else {
                    accountStatusBadge.className = "account-status-badge temporary";
                    accountStatusText.textContent = "Akun Admin Sementara (Bawaan)";
                }
            }

            if (currentInfoSecurity) {
                if (adminAccount.isCustom) {
                    currentInfoSecurity.textContent = "Kredensial Resmi Telah Diperbarui";
                    currentInfoSecurity.className = "account-info-value text-green";
                } else {
                    currentInfoSecurity.textContent = "Kredensial Default Instansi (Perlu Diubah)";
                    currentInfoSecurity.className = "account-info-value text-amber";
                }
            }
        }
    }

    /* ============================================================
       DROPDOWN INTERACTION
    ============================================================ */
    function toggleDropdown(event) {
        if (event) {
            event.stopPropagation();
        }
        if (!userDropdownWrapper) return;

        const isOpen = userDropdownWrapper.classList.toggle("open");
        if (userDropdownBtn) {
            userDropdownBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
    }

    function closeDropdown() {
        if (!userDropdownWrapper) return;
        userDropdownWrapper.classList.remove("open");
        if (userDropdownBtn) {
            userDropdownBtn.setAttribute("aria-expanded", "false");
        }
    }

    if (userDropdownBtn) {
        userDropdownBtn.addEventListener("click", toggleDropdown);
    }

    // Close dropdown on click outside
    document.addEventListener("click", function (event) {
        if (userDropdownWrapper && !userDropdownWrapper.contains(event.target)) {
            closeDropdown();
        }
    });

    // Close on Escape
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeDropdown();
            closeSettingsModal();
        }
    });

    /* ============================================================
       SETTINGS MODAL OPEN / CLOSE
    ============================================================ */
    function showSettingsMessage(msg, type = "info") {
        if (!settingsMessage) return;
        settingsMessage.style.display = "block";
        settingsMessage.className = "settings-message " + type;
        settingsMessage.textContent = msg;
    }

    function hideSettingsMessage() {
        if (!settingsMessage) return;
        settingsMessage.style.display = "none";
        settingsMessage.textContent = "";
    }

    function openSettingsModal() {
        closeDropdown();
        hideSettingsMessage();

        const adminAccount = typeof getSibaperAdminAccount === "function" ? getSibaperAdminAccount() : null;
        if (adminAccount) {
            if (inputUsername) inputUsername.value = adminAccount.username || "admin";
            if (inputName) inputName.value = adminAccount.name || "Administrator";
            if (inputEmail) inputEmail.value = adminAccount.email || "admin@sibaper.local";
            if (inputPassword) inputPassword.value = adminAccount.password || "";
            if (inputPasswordConfirm) inputPasswordConfirm.value = adminAccount.password || "";
        }

        syncUserUI();

        if (settingsModal) {
            settingsModal.classList.add("show");
            if (inputUsername) inputUsername.focus();
        }
    }

    function closeSettingsModal() {
        if (settingsModal) {
            settingsModal.classList.remove("show");
        }
        hideSettingsMessage();
    }

    if (btnOpenSettings) {
        btnOpenSettings.addEventListener("click", function (e) {
            e.preventDefault();
            openSettingsModal();
        });
    }

    if (settingsClose) {
        settingsClose.addEventListener("click", closeSettingsModal);
    }

    if (settingsCancel) {
        settingsCancel.addEventListener("click", closeSettingsModal);
    }

    if (settingsModal) {
        settingsModal.addEventListener("click", function (e) {
            if (e.target === settingsModal) {
                closeSettingsModal();
            }
        });
    }

    /* ============================================================
       PASSWORD TOGGLE (SHOW / HIDE)
    ============================================================ */
    document.addEventListener("click", function (event) {
        const toggleBtn = event.target.closest(".btn-toggle-pw");
        if (!toggleBtn) return;

        const targetId = toggleBtn.dataset.target;
        if (!targetId) return;

        const targetInput = document.getElementById(targetId);
        if (!targetInput) return;

        if (targetInput.type === "password") {
            targetInput.type = "text";
            toggleBtn.textContent = "🙈";
            toggleBtn.title = "Sembunyikan Password";
        } else {
            targetInput.type = "password";
            toggleBtn.textContent = "👁️";
            toggleBtn.title = "Tampilkan Password";
        }
    });

    /* ============================================================
       RESET TO DEFAULT ADMIN
    ============================================================ */
    if (btnResetDefaultAdmin) {
        btnResetDefaultAdmin.addEventListener("click", function () {
            if (confirm("Kembalikan akun admin ke bawaan sementara (username: admin, password: admin123)?")) {
                localStorage.removeItem("sibaperAdminAccount");
                if (typeof updateSibaperSession === "function") {
                    updateSibaperSession({
                        username: "admin",
                        name: "Administrator",
                        email: "admin@sibaper.local",
                        role: "admin"
                    });
                }
                syncUserUI();
                openSettingsModal();
                showSettingsMessage("Akun admin telah di-reset ke kredensial bawaan sementara.", "info");
            }
        });
    }

    /* ============================================================
       FORM SUBMISSION: SAVE NEW ADMIN ACCOUNT
    ============================================================ */
    if (adminAccountForm) {
        adminAccountForm.addEventListener("submit", function (event) {
            event.preventDefault();
            hideSettingsMessage();

            const username = inputUsername ? inputUsername.value.trim() : "";
            const name = inputName ? inputName.value.trim() : "";
            const email = inputEmail ? inputEmail.value.trim().toLowerCase() : "";
            const password = inputPassword ? inputPassword.value : "";
            const passwordConfirm = inputPasswordConfirm ? inputPasswordConfirm.value : "";

            // Validation
            if (!username || !name || !email || !password || !passwordConfirm) {
                showSettingsMessage("Harap lengkapi semua kolom yang wajib diisi.", "error");
                return;
            }

            if (username.length < 3) {
                showSettingsMessage("Username minimal 3 karakter.", "error");
                if (inputUsername) inputUsername.focus();
                return;
            }

            if (/\s/.test(username)) {
                showSettingsMessage("Username tidak boleh mengandung spasi.", "error");
                if (inputUsername) inputUsername.focus();
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showSettingsMessage("Format alamat email tidak valid.", "error");
                if (inputEmail) inputEmail.focus();
                return;
            }

            if (password.length < 6) {
                showSettingsMessage("Password baru minimal 6 karakter.", "error");
                if (inputPassword) inputPassword.focus();
                return;
            }

            if (password !== passwordConfirm) {
                showSettingsMessage("Konfirmasi password tidak cocok dengan password baru.", "error");
                if (inputPasswordConfirm) inputPasswordConfirm.focus();
                return;
            }

            // Save to localStorage via helper
            const newAdminData = {
                username: username,
                name: name,
                email: email,
                password: password,
                role: "admin",
                isCustom: true,
                updatedAt: new Date().toISOString()
            };

            if (typeof saveSibaperAdminAccount === "function") {
                saveSibaperAdminAccount(newAdminData);
            } else {
                localStorage.setItem("sibaperAdminAccount", JSON.stringify(newAdminData));
                if (typeof updateSibaperSession === "function") {
                    updateSibaperSession({
                        username: username,
                        name: name,
                        email: email,
                        role: "admin"
                    });
                }
            }

            syncUserUI();
            showSettingsMessage("✅ Akun Admin berhasil diperbarui! Kredensial baru telah aktif dan tersimpan.", "success");

            // Feedback alert & auto close
            setTimeout(function () {
                closeSettingsModal();
                alert("Pengaturan Akun Admin Berhasil Disimpan!\n\nUsername: " + username + "\nEmail: " + email + "\n\nSilakan gunakan username/email dan password baru untuk login berikutnya.");
            }, 600);
        });
    }

    /* ============================================================
       DROPDOWN LOGOUT
    ============================================================ */
    if (dropdownLogoutBtn) {
        dropdownLogoutBtn.addEventListener("click", function () {
            if (confirm("Apakah Anda yakin ingin keluar dari sistem SIBAPER?")) {
                if (typeof logoutSibaper === "function") {
                    logoutSibaper();
                } else {
                    localStorage.removeItem("sibaperSession");
                    window.location.href = "login.html";
                }
            }
        });
    }

    /* ============================================================
       INITIALIZATION
    ============================================================ */
    syncUserUI();

    // Re-sync on custom events
    document.addEventListener("sibaperSessionChanged", syncUserUI);

    console.log("SIBAPER Admin Settings & Dropdown initialized.");
})();
