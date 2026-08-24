/* =========================================================
   SIBAPER - MODUL PROFIL PEGAWAI (PREMIUM AESTHETIC REDESIGN)
========================================================= */

(function () {

    "use strict";

    const STORAGE_KEY = "sibaper_profil_data";

    const JABATAN = {
        "profil-kepala-bidang": "Kepala Bidang Pelayaran",
        "profil-bujang": "Kepala Seksi BUJANG",
        "profil-pelra": "Kepala Seksi PELRA & ASDP",
        "profil-ketua-tim": "Ketua Tim Kerja Pelabuhan",
        "profil-staf": "Staf"
    };

    const JABATAN_ICONS = {
        "profil-kepala-bidang": "👔",
        "profil-bujang": "⚓",
        "profil-pelra": "🚢",
        "profil-ketua-tim": "🏗️",
        "profil-staf": "👥"
    };

    let editingId = null;
    let currentPage = null;
    const searchQueries = {};

    function canManageData() {
        try {
            const session = JSON.parse(localStorage.getItem("sibaperSession"));
            return session && ["admin", "superadmin"].includes(session.role);
        } catch (error) {
            return false;
        }
    }

    /* =====================================================
       STORAGE
    ===================================================== */

    function getProfiles() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (!data) {
                return [];
            }
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error("Gagal membaca data profil:", error);
            return [];
        }
    }

    function saveProfiles(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Gagal menyimpan data profil:", error);
            alert("Data tidak dapat disimpan di browser. Kemungkinan ukuran foto terlalu besar.");
            return false;
        }
    }

    /* =====================================================
       UTILITY
    ===================================================== */

    function escapeHTML(value) {
        if (value === null || value === undefined) {
            return "";
        }
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
    }

    function getInitials(name) {
        if (!name) return "P";
        const parts = name.replace(/^(Drs\.|Dr\.|Ir\.|H\.|Hj\.)\s+/gi, "").trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return (parts[0][0] || "P").toUpperCase();
    }

    /* =====================================================
       MODAL
    ===================================================== */

    function createModal() {
        if (document.getElementById("profilModalOverlay")) {
            return;
        }

        const modal = document.createElement("div");
        modal.id = "profilModalOverlay";
        modal.className = "profil-modal-overlay";

        modal.innerHTML = `
            <div class="profil-modal">
                <div class="profil-modal-header">
                    <div class="profil-modal-header-left">
                        <div class="profil-modal-header-icon">👤</div>
                        <h3 id="profilModalTitle">Tambah Profil Pegawai</h3>
                    </div>
                    <button type="button" class="profil-modal-close" id="profilModalClose" title="Tutup">×</button>
                </div>

                <form class="profil-form" id="profilForm">
                    <div class="profil-modal-body">
                        <div class="profil-form">
                            
                            <div class="profil-form-group">
                                <label for="profilJabatan">
                                    <span>🏢</span> Jabatan / Posisi
                                </label>
                                <select id="profilJabatan" required>
                                    <option value="">Pilih Jabatan</option>
                                    <option value="profil-kepala-bidang">Kepala Bidang Pelayaran</option>
                                    <option value="profil-bujang">Kepala Seksi BUJANG</option>
                                    <option value="profil-pelra">Kepala Seksi PELRA & ASDP</option>
                                    <option value="profil-ketua-tim">Ketua Tim Kerja Pelabuhan</option>
                                    <option value="profil-staf">Staf</option>
                                </select>
                            </div>

                            <div class="profil-form-group">
                                <label for="profilNama">
                                    <span>👤</span> Nama Lengkap &amp; Gelar
                                </label>
                                <input type="text" id="profilNama" placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Si" required>
                            </div>

                            <div class="profil-form-grid-2">
                                <div class="profil-form-group">
                                    <label for="profilNip">
                                        <span>🆔</span> NIP
                                    </label>
                                    <input type="text" id="profilNip" placeholder="Contoh: 19850115 201001 1 002">
                                </div>

                                <div class="profil-form-group">
                                    <label for="profilPangkat">
                                        <span>🎖️</span> Pangkat / Golongan
                                    </label>
                                    <input type="text" id="profilPangkat" placeholder="Contoh: Pembina / IV.a">
                                </div>
                            </div>

                            <div class="profil-form-group">
                                <label for="profilPendidikan">
                                    <span>🎓</span> Pendidikan Terakhir
                                </label>
                                <input type="text" id="profilPendidikan" placeholder="Contoh: S2 Magister Manajemen Transportasi Laut">
                            </div>

                            <div class="profil-form-group">
                                <label for="profilTugas">
                                    <span>📋</span> Tugas dan Tanggung Jawab
                                </label>
                                <textarea id="profilTugas" placeholder="Tuliskan rincian tugas dan fungsi pokok pegawai..."></textarea>
                            </div>

                            <div class="profil-form-group">
                                <label>
                                    <span>📷</span> Pasfoto Resmi Pegawai
                                </label>
                                
                                <div class="profil-upload-box" id="profilUploadDropzone">
                                    <input type="file" id="profilFoto" accept="image/*">
                                    <div class="profil-upload-icon">📸</div>
                                    <div class="profil-upload-text">Klik atau seret foto pegawai ke sini</div>
                                    <div class="profil-upload-subtext">Format: JPG, PNG, WEBP (Maks 2MB) • Foto tampil proporsional</div>
                                </div>

                                <div class="profil-image-preview-wrapper" id="profilPreviewWrapper">
                                    <img id="profilImagePreview" class="profil-image-preview" alt="Preview foto pegawai">
                                    <button type="button" class="profil-remove-preview" id="profilRemovePreview">Hapus Foto</button>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div class="profil-modal-footer">
                        <button type="button" class="profil-cancel-button" id="profilModalCancel">Batal</button>
                        <button type="submit" class="profil-save-button">Simpan Profil Pegawai</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        bindModalEvents();
    }

    function bindModalEvents() {
        const overlay = document.getElementById("profilModalOverlay");
        const closeButton = document.getElementById("profilModalClose");
        const cancelButton = document.getElementById("profilModalCancel");
        const form = document.getElementById("profilForm");
        const fileInput = document.getElementById("profilFoto");
        const removePreviewBtn = document.getElementById("profilRemovePreview");

        closeButton.addEventListener("click", closeModal);
        cancelButton.addEventListener("click", closeModal);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                closeModal();
            }
        });

        form.addEventListener("submit", handleSubmit);
        fileInput.addEventListener("change", handleImagePreview);

        if (removePreviewBtn) {
            removePreviewBtn.addEventListener("click", function () {
                const preview = document.getElementById("profilImagePreview");
                const wrapper = document.getElementById("profilPreviewWrapper");
                const file = document.getElementById("profilFoto");
                preview.src = "";
                wrapper.classList.remove("show");
                file.value = "";
            });
        }
    }

    function openModal(pageId, profileId = null) {
        if (!canManageData()) {
            return;
        }

        createModal();

        currentPage = pageId;
        editingId = profileId;

        const modal = document.getElementById("profilModalOverlay");
        const title = document.getElementById("profilModalTitle");
        const form = document.getElementById("profilForm");
        const jabatan = document.getElementById("profilJabatan");
        const nama = document.getElementById("profilNama");
        const nip = document.getElementById("profilNip");
        const pangkat = document.getElementById("profilPangkat");
        const pendidikan = document.getElementById("profilPendidikan");
        const tugas = document.getElementById("profilTugas");
        const file = document.getElementById("profilFoto");
        const preview = document.getElementById("profilImagePreview");
        const wrapper = document.getElementById("profilPreviewWrapper");

        form.reset();
        preview.src = "";
        wrapper.classList.remove("show");

        if (profileId) {
            const profiles = getProfiles();
            const profile = profiles.find(item => item.id === profileId);

            if (!profile) {
                return;
            }

            title.textContent = "Edit Profil Pegawai";
            jabatan.value = profile.jabatanId;
            nama.value = profile.nama || "";
            nip.value = profile.nip || "";
            pangkat.value = profile.pangkat || "";
            pendidikan.value = profile.pendidikan || "";
            tugas.value = profile.tugas || "";

            if (profile.foto) {
                preview.src = profile.foto;
                wrapper.classList.add("show");
            }
        } else {
            title.textContent = "Tambah Profil Pegawai";
            jabatan.value = pageId || "profil-kepala-bidang";
        }

        file.value = "";
        modal.classList.add("show");
    }

    function closeModal() {
        const modal = document.getElementById("profilModalOverlay");
        if (!modal) {
            return;
        }
        modal.classList.remove("show");
        editingId = null;
        currentPage = null;
    }

    /* =====================================================
       IMAGE HANDLING
    ===================================================== */

    function handleImagePreview(event) {
        const file = event.target.files[0];
        const preview = document.getElementById("profilImagePreview");
        const wrapper = document.getElementById("profilPreviewWrapper");

        if (!file) {
            preview.src = "";
            wrapper.classList.remove("show");
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("File yang dipilih harus berupa gambar.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            wrapper.classList.add("show");
        };
        reader.readAsDataURL(file);
    }

    function readImageAsDataURL(file) {
        return new Promise(function (resolve, reject) {
            if (!file) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target.result);
            };
            reader.onerror = function () {
                reject(new Error("Gagal membaca foto."));
            };
            reader.readAsDataURL(file);
        });
    }

    /* =====================================================
       SUBMIT FORM
    ===================================================== */

    async function handleSubmit(event) {
        event.preventDefault();

        const jabatanId = document.getElementById("profilJabatan").value;
        const nama = document.getElementById("profilNama").value.trim();
        const nip = document.getElementById("profilNip").value.trim();
        const pangkat = document.getElementById("profilPangkat").value.trim();
        const pendidikan = document.getElementById("profilPendidikan").value.trim();
        const tugas = document.getElementById("profilTugas").value.trim();
        const file = document.getElementById("profilFoto").files[0];
        const preview = document.getElementById("profilImagePreview");

        if (!jabatanId) {
            alert("Silakan pilih jabatan.");
            return;
        }

        if (!nama) {
            alert("Nama lengkap wajib diisi.");
            return;
        }

        const profiles = getProfiles();

        if (editingId) {
            const index = profiles.findIndex(item => item.id === editingId);
            if (index === -1) {
                alert("Data profil tidak ditemukan.");
                return;
            }

            let foto = preview.src && preview.src.startsWith("data:image") ? preview.src : (profiles[index].foto || "");
            if (file) {
                foto = await readImageAsDataURL(file);
            } else if (!preview.src) {
                foto = "";
            }

            profiles[index] = {
                ...profiles[index],
                jabatanId,
                jabatan: JABATAN[jabatanId] || "Pegawai",
                nama,
                nip,
                pangkat,
                pendidikan,
                tugas,
                foto,
                updatedAt: new Date().toISOString()
            };
        } else {
            let foto = "";
            if (file) {
                foto = await readImageAsDataURL(file);
            }

            profiles.push({
                id: generateId(),
                jabatanId,
                jabatan: JABATAN[jabatanId] || "Pegawai",
                nama,
                nip,
                pangkat,
                pendidikan,
                tugas,
                foto,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        const success = saveProfiles(profiles);
        if (!success) {
            return;
        }

        closeModal();
        renderAllProfilePages();
    }

    /* =====================================================
       RENDER PROFILES
    ===================================================== */

    function renderAllProfilePages() {
        Object.keys(JABATAN).forEach(renderProfilePage);
    }

    function renderProfilePage(pageId) {
        const page = document.querySelector(`[data-content="${pageId}"]`);
        if (!page) {
            return;
        }

        const allCategoryProfiles = getProfiles().filter(p => p.jabatanId === pageId);
        const searchQuery = (searchQueries[pageId] || "").toLowerCase().trim();

        const filteredProfiles = allCategoryProfiles.filter(p => {
            if (!searchQuery) return true;
            return (
                (p.nama && p.nama.toLowerCase().includes(searchQuery)) ||
                (p.nip && p.nip.toLowerCase().includes(searchQuery)) ||
                (p.pangkat && p.pangkat.toLowerCase().includes(searchQuery)) ||
                (p.pendidikan && p.pendidikan.toLowerCase().includes(searchQuery))
            );
        });

        let grid = page.querySelector(".profil-card-grid");
        if (!grid) {
            grid = document.createElement("div");
            grid.className = "profil-card-grid";
            page.appendChild(grid);
        }

        const heading = page.querySelector(".content-heading");
        if (heading) {
            const oldToolbar = page.querySelector(".profil-toolbar");
            if (oldToolbar) {
                oldToolbar.remove();
            }

            const icon = JABATAN_ICONS[pageId] || "👔";
            const categoryName = JABATAN[pageId] || "Pegawai";

            const toolbar = document.createElement("div");
            toolbar.className = "profil-toolbar";
            toolbar.innerHTML = `
                <div class="profil-toolbar-left">
                    <div class="profil-toolbar-badge-icon">${icon}</div>
                    <div class="profil-toolbar-info">
                        <small>Struktur Organisasi Bidang Pelayaran</small>
                        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                            <span class="profil-count-pill">
                                <span class="profil-count-dot"></span>
                                ${allCategoryProfiles.length} Pegawai Terdaftar
                            </span>
                        </div>
                    </div>
                </div>

                <div class="profil-toolbar-actions">
                    <div class="profil-search-box">
                        <span class="profil-search-icon">🔍</span>
                        <input 
                            type="text" 
                            class="profil-search-input" 
                            data-search-page="${pageId}" 
                            placeholder="Cari nama, NIP, pangkat..." 
                            value="${escapeHTML(searchQueries[pageId] || "")}"
                        >
                    </div>

                    ${canManageData() ? `
                    <button
                        type="button"
                        class="profil-add-button"
                        data-profile-add="${pageId}"
                    >
                        <span>＋</span>
                        <span>Tambah Profil</span>
                    </button>
                    ` : ""}
                </div>
            `;

            heading.after(toolbar);

            const searchInput = toolbar.querySelector(".profil-search-input");
            if (searchInput) {
                searchInput.addEventListener("input", function (e) {
                    searchQueries[pageId] = e.target.value;
                    renderProfilePage(pageId);
                    const freshInput = page.querySelector(`.profil-search-input[data-search-page="${pageId}"]`);
                    if (freshInput) {
                        freshInput.focus();
                        freshInput.selectionStart = freshInput.selectionEnd = freshInput.value.length;
                    }
                });
            }
        }

        const emptyContent = page.querySelector(".empty-content");
        if (emptyContent) {
            emptyContent.style.display = "none";
        }

        grid.innerHTML = "";

        if (allCategoryProfiles.length === 0) {
            grid.innerHTML = `
                <div class="profil-empty">
                    <div class="profil-empty-icon">👤</div>
                    <h3>Belum Ada Data Profil Pegawai</h3>
                    <p>Belum ada data pegawai yang terdaftar pada kategori ${escapeHTML(JABATAN[pageId] || "ini")}. ${canManageData() ? 'Klik tombol <strong>"+ Tambah Profil"</strong> di atas untuk menambahkan data baru.' : ''}</p>
                </div>
            `;
            return;
        }

        if (filteredProfiles.length === 0 && searchQuery) {
            grid.innerHTML = `
                <div class="profil-empty">
                    <div class="profil-empty-icon">🔍</div>
                    <h3>Data Pegawai Tidak Ditemukan</h3>
                    <p>Tidak ada pegawai yang cocok dengan kata kunci pencarian "<strong>${escapeHTML(searchQuery)}</strong>". Coba kata kunci lain.</p>
                </div>
            `;
            return;
        }

        filteredProfiles.forEach(profile => {
            grid.appendChild(createProfileCard(profile));
        });
    }

    function createProfileCard(profile) {
        const card = document.createElement("article");
        card.className = "profil-card";

        const initials = getInitials(profile.nama);

        const fotoHTML = profile.foto
            ? `
                <img
                    class="profil-photo"
                    src="${profile.foto}"
                    alt="Foto ${escapeHTML(profile.nama)}"
                    loading="lazy"
                >
                <div class="profil-photo-gradient-overlay"></div>
            `
            : `
                <div class="profil-photo-placeholder">
                    <div class="profil-avatar-icon-ring">
                        ${initials}
                    </div>
                    <span class="profil-no-photo-label">Foto Belum Tersedia</span>
                </div>
            `;

        card.innerHTML = `
            <div class="profil-photo-wrapper">
                <span class="profil-photo-badge">
                    <span class="profil-photo-badge-dot"></span>
                    Aktif
                </span>
                <span class="profil-photo-category-tag">
                    ${escapeHTML(profile.jabatan)}
                </span>
                ${fotoHTML}
            </div>

            <div class="profil-card-body">
                <span class="profil-position-badge">
                    <span>🏢</span> ${escapeHTML(profile.jabatan)}
                </span>

                <h3 class="profil-name">
                    ${escapeHTML(profile.nama)}
                </h3>

                <div class="profil-details-grid">
                    <div class="profil-detail-box">
                        <div class="profil-detail-header">
                            <span class="profil-detail-icon">🆔</span> NIP
                        </div>
                        <span class="profil-detail-val ${profile.nip ? 'monospace' : ''}">
                            ${escapeHTML(profile.nip) || "-"}
                        </span>
                    </div>

                    <div class="profil-detail-box">
                        <div class="profil-detail-header">
                            <span class="profil-detail-icon">🎖️</span> Pangkat / Gol
                        </div>
                        <span class="profil-detail-val">
                            ${escapeHTML(profile.pangkat) || "-"}
                        </span>
                    </div>

                    <div class="profil-detail-box">
                        <div class="profil-detail-header">
                            <span class="profil-detail-icon">🎓</span> Pendidikan
                        </div>
                        <span class="profil-detail-val">
                            ${escapeHTML(profile.pendidikan) || "-"}
                        </span>
                    </div>
                </div>

                <div class="profil-task-box">
                    <div class="profil-task-title">
                        <span>📋</span> Tugas dan Tanggung Jawab
                    </div>
                    <div class="profil-task-text">
                        ${escapeHTML(profile.tugas) || "Melaksanakan tugas pokok dan fungsi operasional sesuai arahan kedinasan."}
                    </div>
                </div>

                <div class="profil-actions">
                    <button
                        type="button"
                        class="profil-action profil-download-button"
                        data-profile-download="${profile.id}"
                        title="Unduh Lembar Biodata Pegawai"
                    >
                        <span>⬇</span> Unduh Biodata
                    </button>
                    ${canManageData() ? `
                    <button
                        type="button"
                        class="profil-action profil-edit-button"
                        data-profile-edit="${profile.id}"
                        title="Ubah Data Profil"
                    >
                        <span>✎</span> Edit
                    </button>

                    <button
                        type="button"
                        class="profil-action profil-delete-button"
                        data-profile-delete="${profile.id}"
                        title="Hapus Data Profil"
                    >
                        <span>🗑</span> Hapus
                    </button>
                    ` : ""}
                </div>
            </div>
        `;

        return card;
    }

    /* =====================================================
       DOWNLOAD BIODATA
    ===================================================== */
    function downloadProfile(id) {
        const profiles = getProfiles();
        const profile = profiles.find(item => item.id === id);
        if (!profile) return;

        const content = `BIODATA RESMI PEGAWAI - DINAS PERHUBUNGAN\n` +
            `BIDANG PELAYARAN (SIBAPER)\n` +
            `==================================================\n\n` +
            `Nama Lengkap    : ${profile.nama || "-"}\n` +
            `NIP             : ${profile.nip || "-"}\n` +
            `Pangkat/Golongan: ${profile.pangkat || "-"}\n` +
            `Jabatan/Posisi  : ${profile.jabatan || "-"}\n` +
            `Pendidikan      : ${profile.pendidikan || "-"}\n\n` +
            `TUGAS DAN TANGGUNG JAWAB:\n` +
            `${profile.tugas || "-"}\n\n` +
            `==================================================\n` +
            `Dicetak pada : ${new Date().toLocaleString("id-ID")}\n` +
            `Aplikasi     : SIBAPER (Sistem Informasi Bidang Pelayaran)\n`;

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const cleanName = (profile.nama || "Pegawai").replace(/[^a-zA-Z0-9_-]/g, "_");
        link.download = `Biodata_${cleanName}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }

    /* =====================================================
       ACTION DISPATCHER
    ===================================================== */

    function handleProfileAction(event) {
        const downloadButton = event.target.closest("[data-profile-download]");
        if (downloadButton) {
            const id = downloadButton.dataset.profileDownload;
            downloadProfile(id);
            return;
        }

        if (!canManageData()) {
            return;
        }

        const addButton = event.target.closest("[data-profile-add]");
        if (addButton) {
            const pageId = addButton.dataset.profileAdd;
            openModal(pageId);
            return;
        }

        const editButton = event.target.closest("[data-profile-edit]");
        if (editButton) {
            const id = editButton.dataset.profileEdit;
            const profiles = getProfiles();
            const profile = profiles.find(item => item.id === id);
            if (!profile) return;
            openModal(profile.jabatanId, id);
            return;
        }

        const deleteButton = event.target.closest("[data-profile-delete]");
        if (deleteButton) {
            const id = deleteButton.dataset.profileDelete;
            deleteProfile(id);
        }
    }

    function deleteProfile(id) {
        if (!canManageData()) {
            return;
        }

        const profiles = getProfiles();
        const profile = profiles.find(item => item.id === id);
        if (!profile) return;

        const confirmed = confirm(`Hapus profil pegawai "${profile.nama}"?`);
        if (!confirmed) {
            return;
        }

        const newProfiles = profiles.filter(item => item.id !== id);
        saveProfiles(newProfiles);
        renderAllProfilePages();
    }

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initialize() {
        createModal();
        renderAllProfilePages();
        document.addEventListener("click", handleProfileAction);
        console.log("SIBAPER Profil Pegawai (Aesthetic UI) berhasil diinisialisasi.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }

})();
