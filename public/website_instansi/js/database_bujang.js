/* SIBAPER - DATABASE BUJANG: PERUSAHAAN ANGKUTAN PELAYARAN */
(function () {
    "use strict";

    const STORAGE_KEY = "sibaper_database_bujang_pelayaran";
    let editingId = null;

    function canManageData() {
        try {
            const session = JSON.parse(localStorage.getItem("sibaperSession"));
            return session && ["admin", "superadmin"].includes(session.role);
        } catch (error) {
            return false;
        }
    }

    function getData() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(data) ? data : [];
        } catch (error) {
            return [];
        }
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            alert("File terlalu besar untuk disimpan di browser.");
            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => resolve(event.target.result);
            reader.onerror = () => reject(new Error("Gagal membaca file."));
            reader.readAsDataURL(file);
        });
    }

    function getPage() {
        return document.querySelector('[data-content="database-bujang"]');
    }

    function getContainer() {
        const page = getPage();
        if (!page) return null;

        let container = page.querySelector(".database-bujang-content");
        if (!container) {
            container = document.createElement("div");
            container.className = "database-pelra-content database-bujang-content";
            page.appendChild(container);
        }
        return container;
    }

    function renderDatabase() {
        const container = getContainer();
        if (!container) return;

        const data = getData();
        container.innerHTML = `
            <div class="database-header">
                <div class="database-header-info">
                    <span class="database-label">DATABASE BUJANG</span>
                    <h3>Perusahaan Angkutan Pelayaran</h3>
                    <p>Daftar dokumen perusahaan angkutan pelayaran.</p>
                </div>
                <div class="database-header-actions">
                    <div class="database-total"><strong>${data.length}</strong><span>Dokumen</span></div>
                    ${canManageData() ? `
                    <button type="button" class="database-add-button" id="databaseBujangAddButton">
                        <span>＋</span><span>Tambah File</span>
                    </button>
                    ` : ""}
                </div>
            </div>
            <div class="database-search-wrapper">
                <div class="database-search-icon">🔎</div>
                <input type="search" id="databaseBujangSearch" class="database-search" placeholder="Cari nama file...">
            </div>
            <div id="databaseBujangList" class="database-file-list"></div>
        `;

        renderFileList(data);
        if (canManageData()) {
            document.getElementById("databaseBujangAddButton")?.addEventListener("click", () => openModal());
        }
        document.getElementById("databaseBujangSearch")?.addEventListener("input", event => {
            renderFileList(getData(), event.target.value);
        });
    }

    function renderFileList(data, keyword = "") {
        const list = document.getElementById("databaseBujangList");
        if (!list) return;

        const searchText = keyword.trim().toLowerCase();
        const filtered = data.filter(item => (item.namaFile || "").toLowerCase().includes(searchText));
        if (!filtered.length) {
            list.innerHTML = `
                <div class="database-empty">
                    <div class="database-empty-icon">📂</div>
                    <h3>${searchText ? "File tidak ditemukan" : "Belum ada dokumen"}</h3>
                    <p>${searchText ? "Coba gunakan kata kunci lain." : "Belum ada dokumen perusahaan yang tersimpan."}</p>
                </div>
            `;
            return;
        }

        list.innerHTML = "";
        filtered.forEach(item => list.appendChild(createFileCard(item)));
    }

    function createFileCard(item) {
        const card = document.createElement("article");
        card.className = "database-file-card";
        card.innerHTML = `
            <div class="database-file-icon">📄</div>
            <div class="database-file-info">
                <h4>${escapeHTML(item.namaFile)}</h4>
                <div class="database-file-meta"><span>${escapeHTML(item.fileNameOriginal || "FILE")}</span></div>
            </div>
            <div class="database-file-actions">
                <button type="button" class="database-action-button database-view-button" data-bujang-view-id="${escapeHTML(item.id)}">👁 <span>Lihat</span></button>
                <button type="button" class="database-action-button database-download-button" data-bujang-download-id="${escapeHTML(item.id)}">↓ <span>Download</span></button>
                ${canManageData() ? `
                <button type="button" class="database-action-button database-edit-button" data-bujang-edit-id="${escapeHTML(item.id)}">✎ <span>Edit</span></button>
                <button type="button" class="database-action-button database-delete-button" data-bujang-delete-id="${escapeHTML(item.id)}">🗑 <span>Hapus</span></button>
                ` : ""}
            </div>
        `;
        return card;
    }

    function createModal() {
        if (document.getElementById("databaseBujangModal")) return;

        const modal = document.createElement("div");
        modal.id = "databaseBujangModal";
        modal.className = "database-modal-overlay";
        modal.innerHTML = `
            <div class="database-modal">
                <div class="database-modal-header">
                    <div><span>DATABASE BUJANG</span><h3 id="databaseBujangModalTitle">Tambah Dokumen</h3></div>
                    <button type="button" class="database-modal-close" id="databaseBujangModalClose">×</button>
                </div>
                <form id="databaseBujangForm" class="database-form">
                    <div class="database-form-group"><label for="databaseBujangFileName">Nama File</label><input type="text" id="databaseBujangFileName" placeholder="Contoh: Data Perusahaan Angkutan 2026" required></div>
                    <div class="database-form-group"><label for="databaseBujangFile">Upload File</label><input type="file" id="databaseBujangFile"><small>Pilih dokumen perusahaan angkutan pelayaran.</small></div>
                    <div id="databaseBujangCurrentFile" class="database-current-file"></div>
                    <div class="database-modal-footer"><button type="button" class="database-cancel-button" id="databaseBujangCancel">Batal</button><button type="submit" class="database-save-button">Simpan</button></div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal();
        });
        document.getElementById("databaseBujangModalClose").addEventListener("click", closeModal);
        document.getElementById("databaseBujangCancel").addEventListener("click", closeModal);
        document.getElementById("databaseBujangForm").addEventListener("submit", saveFile);
    }

    function openModal(id = null) {
        if (!canManageData()) return;
        createModal();
        editingId = id;
        const form = document.getElementById("databaseBujangForm");
        const nameInput = document.getElementById("databaseBujangFileName");
        const fileInput = document.getElementById("databaseBujangFile");
        const currentFile = document.getElementById("databaseBujangCurrentFile");
        form.reset();
        currentFile.innerHTML = "";
        fileInput.required = !id;
        document.getElementById("databaseBujangModalTitle").textContent = id ? "Edit Dokumen" : "Tambah Dokumen";

        if (id) {
            const item = getData().find(entry => String(entry.id) === String(id));
            if (!item) return;
            nameInput.value = item.namaFile;
            currentFile.innerHTML = `<div class="database-current-file-inner"><span>File saat ini</span><strong>${escapeHTML(item.namaFile)}</strong><small>Jika tidak memilih file baru, file lama tetap digunakan.</small></div>`;
        }
        document.getElementById("databaseBujangModal").classList.add("show");
    }

    function closeModal() {
        document.getElementById("databaseBujangModal")?.classList.remove("show");
        editingId = null;
    }

    async function saveFile(event) {
        event.preventDefault();
        const nameInput = document.getElementById("databaseBujangFileName");
        const fileInput = document.getElementById("databaseBujangFile");
        const namaFile = nameInput.value.trim();
        const file = fileInput.files[0];
        if (!namaFile) return;

        const data = getData();
        const index = editingId ? data.findIndex(item => String(item.id) === String(editingId)) : -1;
        let record = index >= 0 ? { ...data[index], namaFile } : { id: Date.now().toString(36), namaFile };

        if (file) {
            record.fileData = await readFile(file);
            record.fileNameOriginal = file.name;
            record.fileSize = file.size;
            record.fileType = file.type;
        }
        record.updatedAt = new Date().toISOString();
        if (index >= 0) data[index] = record;
        else {
            record.createdAt = record.updatedAt;
            data.push(record);
        }
        if (!saveData(data)) return;
        closeModal();
        renderDatabase();
        alert(index >= 0 ? "Dokumen berhasil diperbarui." : "Dokumen berhasil ditambahkan.");
    }

    function findItem(id) {
        return getData().find(item => String(item.id) === String(id));
    }

    function viewFile(id) {
        const item = findItem(id);
        if (!item?.fileData) return;
        const newWindow = window.open("", "_blank");
        if (!newWindow) return;
        newWindow.document.write(`<title>${escapeHTML(item.namaFile)}</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f1f5f9}img{max-width:95%;max-height:95vh}iframe{width:100%;height:100vh;border:0}</style>${item.fileType?.startsWith("image/") ? `<img src="${item.fileData}" alt="${escapeHTML(item.namaFile)}">` : `<iframe src="${item.fileData}"></iframe>`}`);
        newWindow.document.close();
    }

    function downloadFile(id) {
        const item = findItem(id);
        if (!item) return;
        const fileName = item.fileNameOriginal || item.namaFile || "dokumen_perusahaan.pdf";
        if (item.fileData && typeof item.fileData === "string" && item.fileData.startsWith("data:")) {
            const link = document.createElement("a");
            link.href = item.fileData;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            const content = `DOKUMEN PERUSAHAAN ANGKUTAN PELAYARAN (BUJANG)\n\nNama Dokumen: ${item.namaFile || "-"}\nNama Berkas: ${fileName}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\nBidang Pelayaran - Dinas Perhubungan`;
            const blob = new Blob([content], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName.endsWith(".pdf") ? fileName : fileName + ".pdf";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        }
    }

    function deleteFile(id) {
        if (!canManageData()) return;
        const item = findItem(id);
        if (!item || !confirm(`Hapus dokumen "${item.namaFile}"?`)) return;
        saveData(getData().filter(entry => String(entry.id) !== String(id)));
        renderDatabase();
    }

    document.addEventListener("click", event => {
        const target = event.target;
        if (target.closest("[data-bujang-view-id]")) viewFile(target.closest("[data-bujang-view-id]").dataset.bujangViewId);
        else if (target.closest("[data-bujang-download-id]")) downloadFile(target.closest("[data-bujang-download-id]").dataset.bujangDownloadId);
        else if (target.closest("[data-bujang-edit-id]")) openModal(target.closest("[data-bujang-edit-id]").dataset.bujangEditId);
        else if (target.closest("[data-bujang-delete-id]")) deleteFile(target.closest("[data-bujang-delete-id]").dataset.bujangDeleteId);
    });

    document.addEventListener("sibaperPageChanged", event => {
        if (event.detail?.page === "database-bujang") setTimeout(renderDatabase, 0);
    });

    function initialize() {
        createModal();
        renderDatabase();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize);
    else initialize();
})();
