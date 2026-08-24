/* =========================================================
   SIBAPER - MODUL KINERJA (EVALUASI & PENILAIAN)
   Manajemen Penginputan Dokumen Kinerja Multi-Tahun / Periode
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       STORAGE KEYS & CONSTANTS
    ===================================================== */
    const PROFILE_STORAGE = "sibaper_profil_data";
    const EVALUATION_STORAGE = "sibaper_evaluasi_data";
    const ASSESSMENT_STORAGE = "sibaper_penilaian_data";

    let activeFilterYear = {
        evaluasi: "all",
        penilaian: "all"
    };

    let activeSearchQuery = {
        evaluasi: "",
        penilaian: ""
    };

    let currentDetailProfileId = null;
    let currentDetailType = null;

    /* =====================================================
       SECURITY & PERMISSION
    ===================================================== */
    function canManageData() {
        try {
            const session = JSON.parse(localStorage.getItem("sibaperSession"));
            return session && ["admin", "superadmin"].includes(session.role);
        } catch (error) {
            return false;
        }
    }

    /* =====================================================
       CLEANUP & INITIAL DATA MANAGEMENT
       (Menghapus data contoh/dummy lama jika pernah tersimpan di browser)
    ===================================================== */
    function ensureCleanData() {
        try {
            // Bersihkan profil dummy jika ada
            const rawProfiles = localStorage.getItem(PROFILE_STORAGE);
            if (rawProfiles) {
                const profiles = JSON.parse(rawProfiles);
                if (Array.isArray(profiles)) {
                    const cleanedProfiles = profiles.filter(p => 
                        !["prof_1", "prof_2", "prof_3", "prof_4", "prof_5"].includes(p.id) &&
                        p.nama !== "Drs. H. M. Ridwan, M.Si" &&
                        p.nama !== "Ir. Bambang Sutejo, S.T., M.T."
                    );
                    if (cleanedProfiles.length !== profiles.length) {
                        localStorage.setItem(PROFILE_STORAGE, JSON.stringify(cleanedProfiles));
                    }
                }
            }

            // Bersihkan data dummy evaluasi jika ada
            const rawEvaluasi = localStorage.getItem(EVALUATION_STORAGE);
            if (rawEvaluasi) {
                const evaluasi = JSON.parse(rawEvaluasi);
                if (Array.isArray(evaluasi)) {
                    const cleanedEvaluasi = evaluasi.filter(e => 
                        !["skp_ev_1", "skp_ev_2", "skp_ev_3", "skp_ev_4", "skp_ev_5"].includes(e.id)
                    );
                    if (cleanedEvaluasi.length !== evaluasi.length) {
                        localStorage.setItem(EVALUATION_STORAGE, JSON.stringify(cleanedEvaluasi));
                    }
                }
            }

            // Bersihkan data dummy penilaian jika ada
            const rawPenilaian = localStorage.getItem(ASSESSMENT_STORAGE);
            if (rawPenilaian) {
                const penilaian = JSON.parse(rawPenilaian);
                if (Array.isArray(penilaian)) {
                    const cleanedPenilaian = penilaian.filter(p => 
                        !["skp_pen_1", "skp_pen_2", "skp_pen_3"].includes(p.id)
                    );
                    if (cleanedPenilaian.length !== penilaian.length) {
                        localStorage.setItem(ASSESSMENT_STORAGE, JSON.stringify(cleanedPenilaian));
                    }
                }
            }
        } catch (e) {
            console.error("Gagal membersihkan data cache:", e);
        }
    }

    /* =====================================================
       UTILITY FUNCTIONS
    ===================================================== */
    function getProfiles() {
        try {
            const data = localStorage.getItem(PROFILE_STORAGE);
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function getStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            return [];
        }
    }

    function saveStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            alert("Data tidak dapat disimpan. Kemungkinan penyimpanan browser penuh.");
            return false;
        }
    }

    function escapeHTML(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function generateId() {
        return "kin_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    }

    function formatFileSize(bytes) {
        if (!bytes || isNaN(bytes)) return "";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function formatDate(isoString) {
        if (!isoString) return "-";
        try {
            const d = new Date(isoString);
            return d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch (e) {
            return isoString;
        }
    }

    function getKinerjaRecords(profileId, type) {
        const key = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
        const allRecords = getStorage(key);
        return allRecords.filter(item => String(item.profileId) === String(profileId));
    }

    function getUniquePeriods(type) {
        const key = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
        const records = getStorage(key);
        const periods = new Set();
        records.forEach(r => {
            if (r.periode) periods.add(r.periode.trim());
        });
        return Array.from(periods).sort().reverse();
    }

    function getPhoto(profile) {
        if (profile.foto) {
            return `<img src="${profile.foto}" alt="${escapeHTML(profile.nama)}" class="kinerja-profile-photo">`;
        }
        return `<div class="kinerja-profile-placeholder">👤</div>`;
    }

    function getFileIcon(fileName) {
        const ext = (fileName || "").split(".").pop().toLowerCase();
        if (ext === "pdf") {
            return `<span class="kinerja-file-icon pdf">PDF</span>`;
        } else if (["doc", "docx"].includes(ext)) {
            return `<span class="kinerja-file-icon doc">DOC</span>`;
        } else if (["xls", "xlsx", "csv"].includes(ext)) {
            return `<span class="kinerja-file-icon xls">XLS</span>`;
        } else if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
            return `<span class="kinerja-file-icon img">IMG</span>`;
        }
        return `<span class="kinerja-file-icon default">DOC</span>`;
    }

    /* =====================================================
       DOWNLOAD / PREVIEW FILE HELPER
    ===================================================== */
    function triggerFileDownload(record, type) {
        if (record.fileData && record.fileData.startsWith("data:")) {
            const a = document.createElement("a");
            a.href = record.fileData;
            a.download = record.fileName || (record.namaFile + ".pdf");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            const titleLabel = type === "evaluasi" ? "EVALUASI KINERJA" : "PENILAIAN KINERJA";
            const blob = new Blob(
                [
                    `DOKUMEN ${titleLabel} - SIBAPER\n` +
                    `===================================\n` +
                    `Pegawai  : ${record.namaPegawai || "-"}\n` +
                    `Periode  : ${record.periode || "-"}\n` +
                    `Nama File: ${record.namaFile || "-"}\n` +
                    `File Name: ${record.fileName || "dokumen.pdf"}\n` +
                    `Waktu    : ${record.createdAt || new Date().toISOString()}\n` +
                    `\nFile dokumen ini tersimpan dalam sistem SIBAPER.`
                ],
                { type: "text/plain;charset=utf-8" }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = (record.fileName || record.namaFile || "Dokumen_Kinerja") + ".txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    /* =====================================================
       MAIN RENDER KINERJA
    ===================================================== */
    function renderKinerja() {
        renderPage("kinerja-evaluasi", "evaluasi");
        renderPage("kinerja-penilaian", "penilaian");
    }

    function renderPage(pageId, type) {
        const page = document.querySelector(`[data-content="${pageId}"]`);
        if (!page) return;

        const profiles = getProfiles();
        const storageKey = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
        const allRecords = getStorage(storageKey);
        const canManage = canManageData();

        // Hapus container lama jika ada
        const oldContainer = page.querySelector(".kinerja-container");
        if (oldContainer) oldContainer.remove();

        const container = document.createElement("div");
        container.className = "kinerja-container";

        // Perhitungan Statistik
        let completedProfiles = 0;
        let totalDocuments = allRecords.length;

        profiles.forEach(p => {
            const count = allRecords.filter(r => String(r.profileId) === String(p.id)).length;
            if (count > 0) completedProfiles++;
        });

        const pendingProfiles = profiles.length - completedProfiles;
        const uniquePeriods = getUniquePeriods(type);

        /* -------------------------------------------------
           1. SUMMARY CARDS
        ------------------------------------------------- */
        const summary = document.createElement("div");
        summary.className = "kinerja-summary";
        summary.innerHTML = `
            <div class="kinerja-summary-card">
                <span>TOTAL PEGAWAI</span>
                <strong>${profiles.length}</strong>
                <small>Pegawai Terdaftar</small>
            </div>
            <div class="kinerja-summary-card success">
                <span>DOKUMEN TERUPLOAD</span>
                <strong>${totalDocuments}</strong>
                <small>Berkas ${type === "evaluasi" ? "Evaluasi" : "Penilaian"}</small>
            </div>
            <div class="kinerja-summary-card ${profiles.length > 0 && pendingProfiles === 0 ? "success" : "pending"}">
                <span>PEGAWAI ADA DOKUMEN</span>
                <strong>${completedProfiles} <span style="font-size:18px;color:#71839a;font-weight:600;">/ ${profiles.length}</span></strong>
                <small>${pendingProfiles} Pegawai Belum Ada Data</small>
            </div>
        `;
        container.appendChild(summary);

        /* -------------------------------------------------
           2. HEADER & ACTION TOOLBAR
        ------------------------------------------------- */
        const typeTitle = type === "evaluasi" ? "Evaluasi Kinerja" : "Penilaian Kinerja";
        const typeDesc = type === "evaluasi" 
            ? "Penginputan dan riwayat dokumen evaluasi kinerja pegawai multi-periode."
            : "Penginputan dan riwayat dokumen penilaian capaian kinerja pegawai multi-periode.";

        const headerBar = document.createElement("div");
        headerBar.className = "kinerja-toolbar-header";
        headerBar.innerHTML = `
            <div class="kinerja-header-text">
                <span class="kinerja-badge-title">MODUL KINERJA</span>
                <h3>${typeTitle}</h3>
                <p>${typeDesc}</p>
            </div>
            <div class="kinerja-header-actions">
                ${canManage ? `
                    <button type="button" class="kinerja-btn-primary add-skp-btn" data-kinerja-type="${type}">
                        <span style="font-size:16px;line-height:1;">+</span> Tambah Data
                    </button>
                ` : ""}
            </div>
        `;
        container.appendChild(headerBar);

        /* -------------------------------------------------
           3. FILTER & SEARCH CONTROLS
        ------------------------------------------------- */
        const filterBar = document.createElement("div");
        filterBar.className = "kinerja-filter-bar";
        
        let periodOptions = `<option value="all" ${activeFilterYear[type] === "all" ? "selected" : ""}>Semua Periode / Tahun</option>`;
        uniquePeriods.forEach(period => {
            periodOptions += `<option value="${escapeHTML(period)}" ${activeFilterYear[type] === period ? "selected" : ""}>${escapeHTML(period)}</option>`;
        });

        filterBar.innerHTML = `
            <div class="kinerja-search-box">
                <span class="kinerja-search-icon">🔍</span>
                <input 
                    type="text" 
                    class="kinerja-search-input" 
                    placeholder="Cari nama pegawai, NIP, atau jabatan..." 
                    value="${escapeHTML(activeSearchQuery[type] || "")}"
                    data-search-type="${type}"
                >
                ${activeSearchQuery[type] ? `<button type="button" class="kinerja-search-clear" data-clear-type="${type}">✕</button>` : ""}
            </div>
            <div class="kinerja-filter-group">
                <label>Filter Periode:</label>
                <select class="kinerja-period-select" data-filter-type="${type}">
                    ${periodOptions}
                </select>
            </div>
        `;
        container.appendChild(filterBar);

        /* -------------------------------------------------
           4. EMPTY STATE CHECK (Belum ada pegawai ditambahkan)
        ------------------------------------------------- */
        if (profiles.length === 0) {
            const empty = document.createElement("div");
            empty.className = "kinerja-empty";
            empty.innerHTML = `
                <div class="kinerja-empty-icon">👥</div>
                <h3>Belum ada data pegawai</h3>
                <p>Data profil pegawai belum ditambahkan. Admin dapat menambahkan data pegawai melalui menu <strong>PROFIL</strong>.</p>
                ${canManage ? `
                    <button type="button" class="kinerja-btn-primary" style="margin-top:16px;" onclick="const btn = document.querySelector('[data-page=\\'profil-kepala-bidang\\']'); if (btn) btn.click();">
                        Buka Menu Profil
                    </button>
                ` : ""}
            `;
            container.appendChild(empty);
            page.appendChild(container);
            return;
        }

        /* -------------------------------------------------
           5. PROFILE CARDS
        ------------------------------------------------- */
        const searchQ = (activeSearchQuery[type] || "").toLowerCase().trim();
        const filterPeriod = activeFilterYear[type];

        const filteredProfiles = profiles.filter(p => {
            const matchesSearch = 
                !searchQ || 
                (p.nama && p.nama.toLowerCase().includes(searchQ)) ||
                (p.nip && p.nip.toLowerCase().includes(searchQ)) ||
                (p.jabatan && p.jabatan.toLowerCase().includes(searchQ));

            if (!matchesSearch) return false;

            if (filterPeriod && filterPeriod !== "all") {
                const userRecords = allRecords.filter(r => String(r.profileId) === String(p.id));
                const hasPeriod = userRecords.some(r => r.periode === filterPeriod);
                return hasPeriod;
            }

            return true;
        });

        if (filteredProfiles.length === 0) {
            const emptySearch = document.createElement("div");
            emptySearch.className = "kinerja-empty";
            emptySearch.innerHTML = `
                <div class="kinerja-empty-icon">🔎</div>
                <h3>Data pegawai tidak ditemukan</h3>
                <p>Tidak ada pegawai yang sesuai dengan kriteria pencarian atau filter periode yang dipilih.</p>
                <button type="button" class="kinerja-btn-secondary reset-filter-btn" data-reset-type="${type}" style="margin-top:14px;">
                    Reset Filter Pencarian
                </button>
            `;
            container.appendChild(emptySearch);
            page.appendChild(container);
            return;
        }

        const grid = document.createElement("div");
        grid.className = "kinerja-profile-grid";

        filteredProfiles.forEach(profile => {
            const userRecords = getKinerjaRecords(profile.id, type);
            userRecords.sort((a, b) => {
                const pA = (a.periode || "").toString();
                const pB = (b.periode || "").toString();
                return pB.localeCompare(pA);
            });

            const card = document.createElement("div");
            card.className = "kinerja-card-wrapper";

            let statusBoxHTML = "";
            let fileListHTML = "";

            if (userRecords.length > 0) {
                const periodPills = userRecords.slice(0, 3).map(r => `
                    <span class="kinerja-period-pill">${escapeHTML(r.periode)}</span>
                `).join("");

                const extraCount = userRecords.length > 3 ? `<span class="kinerja-period-more">+${userRecords.length - 3} lainnya</span>` : "";

                const statusLabel = type === "evaluasi" 
                    ? `${userRecords.length} Periode Evaluasi Terupload` 
                    : `${userRecords.length} Periode Penilaian Terupload`;

                statusBoxHTML = `
                    <div class="kinerja-skp-status-box success">
                        <div class="kinerja-skp-status-top">
                            <span class="kinerja-check-icon">✓</span>
                            <strong>${statusLabel}</strong>
                        </div>
                        <div class="kinerja-period-pills-row">
                            ${periodPills}
                            ${extraCount}
                        </div>
                    </div>
                `;

                // Preview 2 berkas terakhir
                const previewFiles = userRecords.slice(0, 2).map(r => `
                    <div class="kinerja-mini-file-item">
                        <div class="kinerja-mini-file-left">
                            ${getFileIcon(r.fileName || r.namaFile)}
                            <div class="kinerja-mini-file-info">
                                <span class="kinerja-mini-file-name" title="${escapeHTML(r.namaFile)}">${escapeHTML(r.namaFile)}</span>
                                <small>${escapeHTML(r.periode)} · ${r.fileSize || "Dokumen"}</small>
                            </div>
                        </div>
                        <button type="button" class="kinerja-mini-download-btn download-record-btn" data-record-id="${r.id}" data-type="${type}" title="Unduh Berkas">
                            ⬇
                        </button>
                    </div>
                `).join("");

                fileListHTML = `
                    <div class="kinerja-files-preview-container">
                        <div class="kinerja-files-preview-title">Berkas Terakhir:</div>
                        ${previewFiles}
                    </div>
                `;
            } else {
                // Belum ada data evaluasi / penilaian
                const emptyTitle = type === "evaluasi" ? "belum ada evaluasi" : "belum ada penilaian";
                const emptySubtitle = type === "evaluasi" ? "Belum ada dokumen evaluasi terunggah" : "Belum ada dokumen penilaian terunggah";

                statusBoxHTML = `
                    <div class="kinerja-skp-status-box empty">
                        <div class="kinerja-skp-status-top">
                            <span class="kinerja-empty-dot">○</span>
                            <span style="text-transform: lowercase;">${emptyTitle}</span>
                        </div>
                        <small style="color:#94a3b8;font-size:11px;">${emptySubtitle}</small>
                    </div>
                `;
            }

            const actionLabel = canManage
                ? (type === "evaluasi" 
                    ? `Kelola &amp; Riwayat Evaluasi (${userRecords.length}) →` 
                    : `Kelola &amp; Riwayat Penilaian (${userRecords.length}) →`)
                : (type === "evaluasi" 
                    ? `Riwayat Evaluasi (${userRecords.length}) →` 
                    : `Riwayat Penilaian (${userRecords.length}) →`);

            card.innerHTML = `
                <div class="kinerja-profile-card" data-profile-id="${profile.id}" data-kinerja-type="${type}">
                    <div class="kinerja-photo-wrapper">
                        ${getPhoto(profile)}
                        <span class="kinerja-card-badge">${userRecords.length} Dokumen</span>
                    </div>

                    <div class="kinerja-profile-info">
                        <span class="kinerja-position">${escapeHTML(profile.jabatan || "-")}</span>
                        <h3>${escapeHTML(profile.nama || "-")}</h3>
                        <div class="kinerja-nip">NIP: ${escapeHTML(profile.nip || "-")}</div>

                        ${statusBoxHTML}
                        ${fileListHTML}

                        <div class="kinerja-card-actions">
                            <button type="button" class="kinerja-card-btn-view view-profile-skp" data-profile-id="${profile.id}" data-kinerja-type="${type}">
                                ${actionLabel}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        container.appendChild(grid);
        page.appendChild(container);
    }

    /* =====================================================
       MODAL 1: DETAIL & RIWAYAT DOKUMEN PEGAWAI
    ===================================================== */
    function createDetailModal() {
        if (document.getElementById("kinerjaDetailModal")) return;

        const modal = document.createElement("div");
        modal.id = "kinerjaDetailModal";
        modal.className = "kinerja-modal-overlay";
        modal.innerHTML = `
            <div class="kinerja-modal kinerja-modal-large">
                <div class="kinerja-modal-header">
                    <div>
                        <span id="kinerjaDetailTypeLabel" class="kinerja-modal-label">RIWAYAT DOKUMEN PEGAWAI</span>
                        <h2 id="kinerjaDetailEmployeeName">Nama Pegawai</h2>
                        <div id="kinerjaDetailEmployeeMeta" class="kinerja-detail-meta">NIP: - | Jabatan: -</div>
                    </div>
                    <button type="button" id="kinerjaDetailModalClose" class="kinerja-modal-close">×</button>
                </div>

                <div class="kinerja-detail-body">
                    <div class="kinerja-detail-action-row">
                        <div class="kinerja-detail-summary-text">
                            <strong>Daftar File Dokumen Multi-Tahun / Periode:</strong>
                            <span id="kinerjaDetailCount">0 Berkas</span>
                        </div>
                        <button type="button" id="kinerjaDetailAddButton" class="kinerja-btn-primary">
                            + Tambah Periode / File Baru
                        </button>
                    </div>

                    <div id="kinerjaDetailListContainer" class="kinerja-detail-table-wrap">
                        <!-- Dynamically filled table -->
                    </div>
                </div>

                <div class="kinerja-modal-footer">
                    <button type="button" id="kinerjaDetailCloseFooter" class="kinerja-cancel-button">
                        Tutup
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind events
        document.getElementById("kinerjaDetailModalClose").addEventListener("click", closeDetailModal);
        document.getElementById("kinerjaDetailCloseFooter").addEventListener("click", closeDetailModal);
        modal.addEventListener("click", e => {
            if (e.target === modal) closeDetailModal();
        });

        document.getElementById("kinerjaDetailAddButton").addEventListener("click", () => {
            if (currentDetailProfileId && currentDetailType) {
                openInputFormModal(currentDetailType, currentDetailProfileId);
            }
        });
    }

    function openDetailModal(profileId, type) {
        createDetailModal();
        createInputFormModal();

        currentDetailProfileId = profileId;
        currentDetailType = type;

        const profiles = getProfiles();
        const profile = profiles.find(p => String(p.id) === String(profileId));
        if (!profile) {
            alert("Data pegawai tidak ditemukan.");
            return;
        }

        const userRecords = getKinerjaRecords(profileId, type);
        userRecords.sort((a, b) => (b.periode || "").localeCompare(a.periode || ""));

        const typeLabel = type === "evaluasi" ? "RIWAYAT EVALUASI KINERJA" : "RIWAYAT PENILAIAN KINERJA";
        document.getElementById("kinerjaDetailTypeLabel").textContent = typeLabel;
        document.getElementById("kinerjaDetailEmployeeName").textContent = profile.nama || "-";
        document.getElementById("kinerjaDetailEmployeeMeta").textContent = `NIP: ${profile.nip || "-"} | Jabatan: ${profile.jabatan || "-"}`;
        document.getElementById("kinerjaDetailCount").textContent = `${userRecords.length} Periode Tersedia`;

        const canManage = canManageData();
        const detailAddBtn = document.getElementById("kinerjaDetailAddButton");
        if (detailAddBtn) {
            detailAddBtn.style.display = canManage ? "inline-flex" : "none";
        }
        const listContainer = document.getElementById("kinerjaDetailListContainer");

        if (userRecords.length === 0) {
            const emptyLabel = type === "evaluasi" ? "Evaluasi" : "Penilaian";
            listContainer.innerHTML = `
                <div class="kinerja-detail-empty">
                    <div style="font-size:36px;margin-bottom:10px;">📁</div>
                    <h4>Belum Ada Dokumen ${emptyLabel}</h4>
                    <p>Pegawai ini belum memiliki dokumen file ${emptyLabel.toLowerCase()} yang tersimpan dalam sistem.</p>
                </div>
            `;
        } else {
            const rows = userRecords.map((rec, idx) => `
                <tr>
                    <td class="col-number">${idx + 1}</td>
                    <td class="col-period">
                        <span class="kinerja-table-period-badge">${escapeHTML(rec.periode)}</span>
                    </td>
                    <td class="col-filename">
                        <div class="kinerja-table-file-title">${escapeHTML(rec.namaFile)}</div>
                        <div class="kinerja-table-file-sub">
                            ${getFileIcon(rec.fileName || rec.namaFile)}
                            <span>${escapeHTML(rec.fileName || (rec.namaFile + ".pdf"))} (${rec.fileSize || "Dokumen"})</span>
                        </div>
                    </td>
                    <td class="col-date">${formatDate(rec.createdAt || rec.updatedAt)}</td>
                    <td class="col-actions">
                        <div class="kinerja-table-action-btns">
                            <button type="button" class="kinerja-btn-action download-record-btn" data-record-id="${rec.id}" data-type="${type}" title="Unduh Berkas">
                                ⬇ Unduh
                            </button>
                            ${canManage ? `
                                <button type="button" class="kinerja-btn-action edit-record-btn" data-record-id="${rec.id}" data-type="${type}" data-profile-id="${profileId}" title="Edit Data">
                                    ✏ Edit
                                </button>
                                <button type="button" class="kinerja-btn-action danger delete-record-btn" data-record-id="${rec.id}" data-type="${type}" data-profile-id="${profileId}" title="Hapus Data">
                                    🗑 Hapus
                                </button>
                            ` : ""}
                        </div>
                    </td>
                </tr>
            `).join("");

            listContainer.innerHTML = `
                <table class="kinerja-detail-table">
                    <thead>
                        <tr>
                            <th class="col-number">No</th>
                            <th class="col-period">Periode</th>
                            <th class="col-filename">Nama Dokumen &amp; File</th>
                            <th class="col-date">Tgl Upload</th>
                            <th class="col-actions">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            `;
        }

        const modal = document.getElementById("kinerjaDetailModal");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeDetailModal() {
        const modal = document.getElementById("kinerjaDetailModal");
        if (modal) modal.classList.remove("show");
        document.body.style.overflow = "";
    }

    /* =====================================================
       MODAL 2: INPUT / EDIT FORM MODAL (PERIODE, NAMA FILE, UPLOAD FILE)
    ===================================================== */
    function createInputFormModal() {
        if (document.getElementById("kinerjaInputModal")) return;

        const modal = document.createElement("div");
        modal.id = "kinerjaInputModal";
        modal.className = "kinerja-modal-overlay";
        modal.innerHTML = `
            <div class="kinerja-modal">
                <div class="kinerja-modal-header">
                    <div>
                        <span id="kinerjaInputModalType" class="kinerja-modal-label">TAMBAH DATA</span>
                        <h2 id="kinerjaInputModalTitle">Form Dokumen</h2>
                    </div>
                    <button type="button" id="kinerjaInputModalClose" class="kinerja-modal-close">×</button>
                </div>

                <form id="kinerjaInputForm" class="kinerja-form">
                    <input type="hidden" id="inputRecordId" value="">
                    <input type="hidden" id="inputType" value="">
                    
                    <!-- Pegawai Selection -->
                    <div class="kinerja-form-group" id="inputProfileGroup">
                        <label for="inputProfileSelect">Pegawai <span style="color:#e11d48;">*</span></label>
                        <select id="inputProfileSelect" required>
                            <option value="">-- Pilih Pegawai --</option>
                        </select>
                    </div>

                    <!-- 1. Input Periode -->
                    <div class="kinerja-form-group">
                        <label for="inputPeriode">
                            Periode <span style="color:#e11d48;">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="inputPeriode" 
                            placeholder="Contoh: Tahun 2026 atau 2025 (Triwulan I)" 
                            required
                        >
                        <div class="kinerja-period-quick-tags">
                            <span>Saran:</span>
                            <button type="button" class="quick-period-tag" data-val="Tahun 2026">2026</button>
                            <button type="button" class="quick-period-tag" data-val="Tahun 2025">2025</button>
                            <button type="button" class="quick-period-tag" data-val="Tahun 2024">2024</button>
                            <button type="button" class="quick-period-tag" data-val="Tahun 2023">2023</button>
                            <button type="button" class="quick-period-tag" data-val="Tahun 2022">2022</button>
                        </div>
                    </div>

                    <!-- 2. Input Nama File -->
                    <div class="kinerja-form-group">
                        <label for="inputNamaFile">
                            Nama File / Judul Dokumen <span style="color:#e11d48;">*</span>
                        </label>
                        <input 
                            type="text" 
                            id="inputNamaFile" 
                            placeholder="Contoh: Dokumen Tahunan 2026 - Pelayaran" 
                            required
                        >
                    </div>

                    <!-- 3. Upload File -->
                    <div class="kinerja-form-group">
                        <label for="inputUploadFile">
                            Upload File <span id="fileRequiredBadge" style="color:#e11d48;">*</span>
                        </label>
                        
                        <div class="kinerja-upload-dropzone" id="dropzoneArea">
                            <input 
                                type="file" 
                                id="inputUploadFile" 
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            >
                            <div class="kinerja-dropzone-content">
                                <div class="kinerja-dropzone-icon">📄</div>
                                <div class="kinerja-dropzone-text">
                                    <strong>Pilih file</strong> atau seret dokumen ke sini
                                </div>
                                <small>Mendukung format PDF, Word (.docx), Excel (.xlsx), atau Gambar (Maks 3MB)</small>
                            </div>
                        </div>

                        <div id="selectedFileInfo" class="kinerja-selected-file-info" style="display:none;">
                            <div class="kinerja-file-preview-left">
                                <span class="kinerja-preview-icon">📎</span>
                                <div>
                                    <strong id="selectedFileNameDisplay">nama_file.pdf</strong>
                                    <small id="selectedFileSizeDisplay">1.2 MB</small>
                                </div>
                            </div>
                            <button type="button" id="removeSelectedFileBtn" class="kinerja-remove-file-btn">✕ Ganti</button>
                        </div>
                    </div>

                    <div class="kinerja-modal-footer">
                        <button type="button" id="kinerjaInputModalCancel" class="kinerja-cancel-button">
                            Batal
                        </button>
                        <button type="submit" id="kinerjaInputSubmitBtn" class="kinerja-save-button">
                            Simpan Data
                        </button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        // Bind events
        document.getElementById("kinerjaInputModalClose").addEventListener("click", closeInputFormModal);
        document.getElementById("kinerjaInputModalCancel").addEventListener("click", closeInputFormModal);
        modal.addEventListener("click", e => {
            if (e.target === modal) closeInputFormModal();
        });

        // Quick Period Tags
        modal.querySelectorAll(".quick-period-tag").forEach(btn => {
            btn.addEventListener("click", function () {
                const val = this.dataset.val;
                document.getElementById("inputPeriode").value = val;
                
                const type = document.getElementById("inputType").value;
                const typeLabel = type === "evaluasi" ? "Evaluasi" : "Penilaian";
                const namaFileInput = document.getElementById("inputNamaFile");
                const profileSelect = document.getElementById("inputProfileSelect");
                const selectedProfileName = profileSelect.options[profileSelect.selectedIndex]?.text || "";
                
                if (!namaFileInput.value && selectedProfileName && selectedProfileName !== "-- Pilih Pegawai --") {
                    namaFileInput.value = `Dokumen ${typeLabel} ${val} - ${selectedProfileName}`;
                }
            });
        });

        // File Selection handling
        const fileInput = document.getElementById("inputUploadFile");
        const fileInfoBox = document.getElementById("selectedFileInfo");
        const fileNameDisplay = document.getElementById("selectedFileNameDisplay");
        const fileSizeDisplay = document.getElementById("selectedFileSizeDisplay");
        const removeFileBtn = document.getElementById("removeSelectedFileBtn");

        fileInput.addEventListener("change", function () {
            if (this.files && this.files[0]) {
                const f = this.files[0];
                fileNameDisplay.textContent = f.name;
                fileSizeDisplay.textContent = formatFileSize(f.size);
                fileInfoBox.style.display = "flex";

                // Auto-fill nama file jika masih kosong
                const namaFileInput = document.getElementById("inputNamaFile");
                if (!namaFileInput.value) {
                    const cleanName = f.name.replace(/\.[^/.]+$/, "");
                    namaFileInput.value = cleanName;
                }
            } else {
                fileInfoBox.style.display = "none";
            }
        });

        removeFileBtn.addEventListener("click", function () {
            fileInput.value = "";
            fileInfoBox.style.display = "none";
        });

        // Form Submit
        const form = document.getElementById("kinerjaInputForm");
        form.addEventListener("submit", handleSaveInputForm);
    }

    function openInputFormModal(type, preselectedProfileId = null, editingRecordId = null) {
        createInputFormModal();

        const form = document.getElementById("kinerjaInputForm");
        form.reset();

        document.getElementById("inputType").value = type;
        document.getElementById("inputRecordId").value = editingRecordId || "";

        const typeLabel = type === "evaluasi" ? "EVALUASI KINERJA" : "PENILAIAN KINERJA";
        document.getElementById("kinerjaInputModalType").textContent = typeLabel;

        const profileSelect = document.getElementById("inputProfileSelect");
        profileSelect.innerHTML = `<option value="">-- Pilih Pegawai --</option>`;

        const profiles = getProfiles();
        profiles.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.nama} (${p.jabatan || "-"})`;
            profileSelect.appendChild(opt);
        });

        const fileInput = document.getElementById("inputUploadFile");
        const fileInfoBox = document.getElementById("selectedFileInfo");
        fileInput.value = "";
        fileInfoBox.style.display = "none";

        const fileRequiredBadge = document.getElementById("fileRequiredBadge");

        if (editingRecordId) {
            // EDIT MODE
            document.getElementById("kinerjaInputModalTitle").textContent = type === "evaluasi" ? "Edit Dokumen Evaluasi" : "Edit Dokumen Penilaian";
            fileRequiredBadge.textContent = "(Opsional jika tidak ganti)";
            fileInput.required = false;

            const storageKey = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
            const records = getStorage(storageKey);
            const record = records.find(r => r.id === editingRecordId);

            if (record) {
                profileSelect.value = record.profileId;
                document.getElementById("inputPeriode").value = record.periode || "";
                document.getElementById("inputNamaFile").value = record.namaFile || "";

                if (record.fileName) {
                    document.getElementById("selectedFileNameDisplay").textContent = record.fileName;
                    document.getElementById("selectedFileSizeDisplay").textContent = record.fileSize || "File tersimpan";
                    fileInfoBox.style.display = "flex";
                }
            }
        } else {
            // CREATE NEW MODE
            document.getElementById("kinerjaInputModalTitle").textContent = type === "evaluasi" ? "Tambah Data Evaluasi" : "Tambah Data Penilaian";
            fileRequiredBadge.textContent = "*";
            fileInput.required = true;

            if (preselectedProfileId) {
                profileSelect.value = preselectedProfileId;
            }
        }

        const modal = document.getElementById("kinerjaInputModal");
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
    }

    function closeInputFormModal() {
        const modal = document.getElementById("kinerjaInputModal");
        if (modal) modal.classList.remove("show");
        document.body.style.overflow = "";
    }

    /* =====================================================
       SAVE INPUT FORM (PERIODE, NAMA FILE, UPLOAD FILE)
    ===================================================== */
    async function handleSaveInputForm(event) {
        event.preventDefault();

        const type = document.getElementById("inputType").value;
        const recordId = document.getElementById("inputRecordId").value;
        const profileId = document.getElementById("inputProfileSelect").value;
        const periode = document.getElementById("inputPeriode").value.trim();
        const namaFile = document.getElementById("inputNamaFile").value.trim();
        const fileInput = document.getElementById("inputUploadFile");

        if (!profileId) {
            alert("Silakan pilih pegawai terlebih dahulu.");
            return;
        }

        if (!periode || !namaFile) {
            alert("Periode dan Nama File wajib diisi.");
            return;
        }

        const profiles = getProfiles();
        const profile = profiles.find(p => String(p.id) === String(profileId));
        const namaPegawai = profile ? profile.nama : "";

        const storageKey = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
        const records = getStorage(storageKey);

        let fileName = "";
        let fileSize = "";
        let fileType = "";
        let fileData = "";

        const file = fileInput.files && fileInput.files[0];
        if (file) {
            fileName = file.name;
            fileSize = formatFileSize(file.size);
            fileType = file.type || "application/octet-stream";

            if (file.size <= 2.5 * 1024 * 1024) {
                try {
                    fileData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                    });
                } catch (e) {
                    console.warn("Gagal membaca berkas:", e);
                }
            }
        }

        if (recordId) {
            // UPDATE EXISTING
            const idx = records.findIndex(r => r.id === recordId);
            if (idx >= 0) {
                const existing = records[idx];
                records[idx] = {
                    ...existing,
                    profileId,
                    namaPegawai,
                    periode,
                    namaFile,
                    fileName: fileName || existing.fileName || (namaFile + ".pdf"),
                    fileSize: fileSize || existing.fileSize || "1.2 MB",
                    fileType: fileType || existing.fileType || "application/pdf",
                    fileData: fileData || existing.fileData || "",
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // CREATE NEW RECORD
            const newRecord = {
                id: generateId(),
                profileId,
                namaPegawai,
                periode,
                namaFile,
                fileName: fileName || (namaFile + ".pdf"),
                fileSize: fileSize || "1.2 MB",
                fileType: fileType || "application/pdf",
                fileData: fileData || "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            records.push(newRecord);
        }

        const saved = saveStorage(storageKey, records);
        if (!saved) return;

        closeInputFormModal();

        // Refresh Detail Modal jika sedang terbuka
        if (currentDetailProfileId && currentDetailType === type) {
            openDetailModal(currentDetailProfileId, type);
        }

        // Refresh Dashboard Grid
        renderKinerja();

        alert(`Data ${type === "evaluasi" ? "Evaluasi" : "Penilaian"} periode "${periode}" berhasil disimpan.`);
    }

    /* =====================================================
       DELETE & ACTION EVENT HANDLERS
    ===================================================== */
    function handleDeleteRecord(recordId, type, profileId) {
        if (!canManageData()) return;

        const storageKey = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
        const records = getStorage(storageKey);
        const record = records.find(r => r.id === recordId);

        if (!record) return;

        const confirmed = confirm(`Hapus file "${record.namaFile}" (Periode: ${record.periode})?`);
        if (!confirmed) return;

        const updated = records.filter(r => r.id !== recordId);
        saveStorage(storageKey, updated);

        if (currentDetailProfileId && currentDetailType === type) {
            openDetailModal(currentDetailProfileId, type);
        }

        renderKinerja();
    }

    /* =====================================================
       GLOBAL EVENT LISTENERS
    ===================================================== */
    document.addEventListener("click", function (event) {
        // 1. Tombol Tambah Data dari header atau toolbar
        const addBtn = event.target.closest(".add-skp-btn, [data-form='kinerja-evaluasi'], [data-form='kinerja-penilaian']");
        if (addBtn) {
            if (!canManageData()) {
                event.preventDefault();
                return;
            }
            const type = addBtn.dataset.kinerjaType || (addBtn.dataset.form === "kinerja-evaluasi" ? "evaluasi" : "penilaian");
            if (type === "evaluasi" || type === "penilaian") {
                event.preventDefault();
                openInputFormModal(type);
                return;
            }
        }

        // 2. Klik Kartu Profil / Tombol Lihat Riwayat
        const viewBtn = event.target.closest(".view-profile-skp, .kinerja-profile-card");
        if (viewBtn) {
            if (event.target.closest(".download-record-btn")) return;

            const profileId = viewBtn.dataset.profileId;
            const type = viewBtn.dataset.kinerjaType;
            if (profileId && type) {
                openDetailModal(profileId, type);
                return;
            }
        }

        // 3. Tombol Unduh Berkas
        const downloadBtn = event.target.closest(".download-record-btn");
        if (downloadBtn) {
            event.stopPropagation();
            const recordId = downloadBtn.dataset.recordId;
            const type = downloadBtn.dataset.type;
            const storageKey = type === "evaluasi" ? EVALUATION_STORAGE : ASSESSMENT_STORAGE;
            const records = getStorage(storageKey);
            const record = records.find(r => r.id === recordId);
            if (record) {
                triggerFileDownload(record, type);
            }
            return;
        }

        // 4. Edit Dokumen
        const editBtn = event.target.closest(".edit-record-btn");
        if (editBtn) {
            const recordId = editBtn.dataset.recordId;
            const type = editBtn.dataset.type;
            const profileId = editBtn.dataset.profileId;
            openInputFormModal(type, profileId, recordId);
            return;
        }

        // 5. Hapus Dokumen
        const deleteBtn = event.target.closest(".delete-record-btn");
        if (deleteBtn) {
            const recordId = deleteBtn.dataset.recordId;
            const type = deleteBtn.dataset.type;
            const profileId = deleteBtn.dataset.profileId;
            handleDeleteRecord(recordId, type, profileId);
            return;
        }

        // 6. Hapus Filter Pencarian
        const clearBtn = event.target.closest(".kinerja-search-clear");
        if (clearBtn) {
            const type = clearBtn.dataset.clearType;
            activeSearchQuery[type] = "";
            renderPage(`kinerja-${type}`, type);
            return;
        }

        // 7. Reset Filter
        const resetBtn = event.target.closest(".reset-filter-btn");
        if (resetBtn) {
            const type = resetBtn.dataset.resetType;
            activeSearchQuery[type] = "";
            activeFilterYear[type] = "all";
            renderPage(`kinerja-${type}`, type);
            return;
        }
    });

    // Event input pencarian dan filter
    document.addEventListener("input", function (event) {
        const searchInput = event.target.closest(".kinerja-search-input");
        if (searchInput) {
            const type = searchInput.dataset.searchType;
            activeSearchQuery[type] = searchInput.value;
            renderPage(`kinerja-${type}`, type);
            
            const newSearchInput = document.querySelector(`.kinerja-search-input[data-search-type="${type}"]`);
            if (newSearchInput) {
                newSearchInput.focus();
                newSearchInput.selectionStart = newSearchInput.selectionEnd = newSearchInput.value.length;
            }
        }
    });

    document.addEventListener("change", function (event) {
        const periodSelect = event.target.closest(".kinerja-period-select");
        if (periodSelect) {
            const type = periodSelect.dataset.filterType;
            activeFilterYear[type] = periodSelect.value;
            renderPage(`kinerja-${type}`, type);
        }
    });

    /* =====================================================
       PAGE CHANGED EVENT
    ===================================================== */
    document.addEventListener("sibaperPageChanged", function (event) {
        if (!event.detail) return;
        const page = event.detail.page;
        if (page === "kinerja-evaluasi" || page === "kinerja-penilaian") {
            setTimeout(renderKinerja, 0);
        }
    });

    /* =====================================================
       EXPOSE TO WINDOW
    ===================================================== */
    window.openKinerjaAddModal = function (type, profileId) {
        openInputFormModal(type, profileId);
    };

    window.openKinerjaDetailModal = function (profileId, type) {
        openDetailModal(profileId, type);
    };

    /* =====================================================
       INITIALIZATION
    ===================================================== */
    function initialize() {
        ensureCleanData();
        createDetailModal();
        createInputFormModal();
        renderKinerja();
        console.log("SIBAPER Kinerja (Evaluasi & Penilaian) berhasil dijalankan.");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
