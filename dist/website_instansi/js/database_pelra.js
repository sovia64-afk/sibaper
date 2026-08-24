/* =========================================================
   SIBAPER - DATABASE PELRA & ASDP
   Hasil Survei SPM

   Fitur:
   - Tambah file
   - Upload file
   - Menampilkan daftar file
   - Membuka file
   - Download file
   - Edit nama file
   - Ganti file
   - Hapus file

   Penyimpanan sementara:
   localStorage

   Field:
   - Nama File
   - Upload File
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       STORAGE
    ===================================================== */

    const STORAGE_KEY =
        "sibaper_database_pelra_spm";


    /* =====================================================
       UTILITY
    ===================================================== */

    function getData() {

        try {

            const data =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!data) {
                return [];
            }

            const parsed =
                JSON.parse(data);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Gagal membaca database PELRA:",
                error
            );

            return [];

        }

    }


    function saveData(data) {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error(
                "Gagal menyimpan database PELRA:",
                error
            );

            alert(
                "File terlalu besar untuk disimpan di browser."
            );

            return false;

        }

    }


    function generateId() {

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );

    }


    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatDate(dateString) {

        if (!dateString) {
            return "-";
        }

        const date =
            new Date(dateString);

        if (isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString(
            "id-ID",
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );

    }


    function formatFileSize(bytes) {

        if (!bytes) {
            return "0 KB";
        }

        const kb =
            bytes / 1024;

        if (kb < 1024) {

            return (
                Math.round(kb * 10) / 10 +
                " KB"
            );

        }

        const mb =
            kb / 1024;

        return (
            Math.round(mb * 10) / 10 +
            " MB"
        );

    }


    function getFileExtension(fileName) {

        if (!fileName) {
            return "";
        }

        const parts =
            fileName.split(".");

        if (parts.length <= 1) {
            return "";
        }

        return parts[
            parts.length - 1
        ].toUpperCase();

    }


    function getFileIcon(fileName) {

        const extension =
            getFileExtension(fileName);

        if (
            extension === "PDF"
        ) {

            return "📕";

        }

        if (
            extension === "DOC" ||
            extension === "DOCX"
        ) {

            return "📘";

        }

        if (
            extension === "XLS" ||
            extension === "XLSX"
        ) {

            return "📗";

        }

        if (
            extension === "PPT" ||
            extension === "PPTX"
        ) {

            return "📙";

        }

        if (
            extension === "JPG" ||
            extension === "JPEG" ||
            extension === "PNG" ||
            extension === "WEBP"
        ) {

            return "🖼️";

        }

        return "📄";

    }


    function readFile(file) {

        return new Promise(
            function (resolve, reject) {

                const reader =
                    new FileReader();

                reader.onload =
                    function (event) {

                        resolve(
                            event.target.result
                        );

                    };

                reader.onerror =
                    function () {

                        reject(
                            new Error(
                                "Gagal membaca file."
                            )
                        );

                    };

                reader.readAsDataURL(file);

            }
        );

    }


    /* =====================================================
       PAGE
    ===================================================== */

    function getPage() {

        return document.querySelector(
            '[data-content="database-pelra"]'
        );

    }


    function getContainer() {

        const page =
            getPage();

        if (!page) {
            return null;
        }

        let container =
            page.querySelector(
                ".database-pelra-content"
            );

        if (!container) {

            container =
                document.createElement("div");

            container.className =
                "database-pelra-content";

            page.appendChild(
                container
            );

        }

        return container;

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderDatabase() {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        const data =
            getData();


        container.innerHTML = `

            <div class="database-header">

                <div class="database-header-info">

                    <span class="database-label">
                        DOKUMEN PELRA & ASDP
                    </span>

                    <h3>
                        Hasil Survei SPM
                    </h3>

                    <p>
                        Daftar dokumen hasil survei
                        Standar Pelayanan Minimal.
                    </p>

                </div>

                <div class="database-header-actions">

                    <div class="database-total">

                        <strong>
                            ${data.length}
                        </strong>

                        <span>
                            Dokumen
                        </span>

                    </div>

                    ${canManageData() ? `
                    <button
                        type="button"
                        class="database-add-button"
                        id="databasePelraAddButton"
                    >

                        <span>
                            ＋
                        </span>

                        <span>
                            Tambah File
                        </span>

                    </button>
                    ` : ""}

                </div>

            </div>


            <div class="database-search-wrapper">

                <div class="database-search-icon">
                    🔎
                </div>

                <input
                    type="search"
                    id="databasePelraSearch"
                    class="database-search"
                    placeholder="Cari nama file..."
                >

            </div>


            <div
                id="databasePelraList"
                class="database-file-list"
            ></div>

        `;


        renderFileList(
            data
        );


        const addButton =
            document.getElementById(
                "databasePelraAddButton"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                function () {

                    openModal();

                }
            );

        }


        const search =
            document.getElementById(
                "databasePelraSearch"
            );

        if (search) {

            search.addEventListener(
                "input",
                function () {

                    renderFileList(
                        getData(),
                        this.value
                    );

                }
            );

        }

    }


    function renderFileList(
        data,
        keyword = ""
    ) {

        const list =
            document.getElementById(
                "databasePelraList"
            );

        if (!list) {
            return;
        }


        const searchText =
            keyword
                .trim()
                .toLowerCase();


        const filtered =
            data.filter(
                function (item) {

                    return (
                        item.namaFile ||
                        ""
                    )
                        .toLowerCase()
                        .includes(
                            searchText
                        );

                }
            );


        if (filtered.length === 0) {

            list.innerHTML = `

                <div class="database-empty">

                    <div class="database-empty-icon">
                        📂
                    </div>

                    <h3>
                        ${
                            searchText
                                ? "File tidak ditemukan"
                                : "Belum ada dokumen"
                        }
                    </h3>

                    <p>
                        ${
                            searchText
                                ? "Coba gunakan kata kunci lain."
                                : "Belum ada dokumen hasil survei SPM yang tersimpan."
                        }
                    </p>

                </div>

            `;

            return;

        }


        list.innerHTML = "";


        filtered.forEach(
            function (item) {

                const card =
                    createFileCard(item);

                list.appendChild(
                    card
                );

            }
        );

    }


    function createFileCard(item) {

        const card =
            document.createElement("article");

        card.className =
            "database-file-card";


        const extension =
            getFileExtension(
                item.namaFile
            );


        card.innerHTML = `

            <div class="database-file-icon">

                ${getFileIcon(item.namaFile)}

            </div>


            <div class="database-file-info">

                <h4>
                    ${escapeHTML(item.namaFile)}
                </h4>

                <div class="database-file-meta">

                    <span>
                        ${extension || "FILE"}
                    </span>

                    <span>
                        ${formatFileSize(item.fileSize)}
                    </span>

                    <span>
                        ${formatDate(item.createdAt)}
                    </span>

                </div>

            </div>


            <div class="database-file-actions">

                <button
                    type="button"
                    class="database-action-button database-view-button"
                    data-view-id="${item.id}"
                    title="Buka file"
                >
                    👁
                    <span>
                        Lihat
                    </span>
                </button>


                <button
                    type="button"
                    class="database-action-button database-download-button"
                    data-download-id="${item.id}"
                    title="Download file"
                >
                    ↓
                    <span>
                        Download
                    </span>
                </button>


                    ${canManageData() ? `
                    <button
                        type="button"
                        class="database-action-button database-edit-button"
                        data-edit-id="${item.id}"
                        title="Edit file"
                    >
                        ✎
                        <span>
                            Edit
                        </span>
                    </button>

                    <button
                        type="button"
                        class="database-action-button database-delete-button"
                        data-delete-id="${item.id}"
                        title="Hapus file"
                    >
                        🗑
                        <span>
                            Hapus
                        </span>
                    </button>
                    ` : ""}

            </div>

        `;


        return card;

    }


    /* =====================================================
       MODAL
    ===================================================== */

    function createModal() {

        if (
            document.getElementById(
                "databasePelraModal"
            )
        ) {

            return;

        }


        const modal =
            document.createElement("div");

        modal.id =
            "databasePelraModal";

        modal.className =
            "database-modal-overlay";


        modal.innerHTML = `

            <div class="database-modal">

                <div class="database-modal-header">

                    <div>

                        <span>
                            DOKUMEN PELRA & ASDP
                        </span>

                        <h3 id="databaseModalTitle">
                            Tambah Dokumen
                        </h3>

                    </div>


                    <button
                        type="button"
                        class="database-modal-close"
                        id="databasePelraModalClose"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="databasePelraForm"
                    class="database-form"
                >

                    <div class="database-form-group">

                        <label for="databasePelraFileName">

                            Nama File

                        </label>

                        <input
                            type="text"
                            id="databasePelraFileName"
                            placeholder="Contoh: Hasil Survei SPM 2026"
                            required
                        >

                    </div>


                    <div class="database-form-group">

                        <label for="databasePelraFile">

                            Upload File

                        </label>

                        <input
                            type="file"
                            id="databasePelraFile"
                            required
                        >

                        <small>
                            Pilih dokumen yang akan disimpan.
                        </small>

                    </div>


                    <div
                        id="databasePelraCurrentFile"
                        class="database-current-file"
                    ></div>


                    <div class="database-modal-footer">

                        <button
                            type="button"
                            class="database-cancel-button"
                            id="databasePelraCancel"
                        >
                            Batal
                        </button>


                        <button
                            type="submit"
                            class="database-save-button"
                        >
                            Simpan
                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        bindModalEvents();

    }


    let editingId = null;

    function canManageData() {
        try {
            const session = JSON.parse(localStorage.getItem("sibaperSession"));
            return session && ["admin", "superadmin"].includes(session.role);
        } catch (error) {
            return false;
        }
    }


    function bindModalEvents() {

        const modal =
            document.getElementById(
                "databasePelraModal"
            );


        const closeButton =
            document.getElementById(
                "databasePelraModalClose"
            );


        const cancelButton =
            document.getElementById(
                "databasePelraCancel"
            );


        const form =
            document.getElementById(
                "databasePelraForm"
            );


        closeButton.addEventListener(
            "click",
            closeModal
        );


        cancelButton.addEventListener(
            "click",
            closeModal
        );


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeModal();

                }

            }
        );


        form.addEventListener(
            "submit",
            saveFile
        );

    }


    function openModal(
        id = null
    ) {

        if (!canManageData()) return;

        createModal();


        editingId =
            id;


        const modal =
            document.getElementById(
                "databasePelraModal"
            );


        const title =
            document.getElementById(
                "databaseModalTitle"
            );


        const nameInput =
            document.getElementById(
                "databasePelraFileName"
            );


        const fileInput =
            document.getElementById(
                "databasePelraFile"
            );


        const currentFile =
            document.getElementById(
                "databasePelraCurrentFile"
            );


        document
            .getElementById(
                "databasePelraForm"
            )
            .reset();


        currentFile.innerHTML =
            "";


        if (id) {

            const data =
                getData();

            const item =
                data.find(
                    function (entry) {

                        return entry.id === id;

                    }
                );


            if (!item) {

                alert(
                    "Dokumen tidak ditemukan."
                );

                return;

            }


            title.textContent =
                "Edit Dokumen";


            nameInput.value =
                item.namaFile;


            fileInput.required =
                false;


            currentFile.innerHTML = `

                <div class="database-current-file-inner">

                    <span>
                        File saat ini
                    </span>

                    <strong>
                        ${escapeHTML(item.namaFile)}
                    </strong>

                    <small>
                        Jika tidak memilih file baru,
                        file lama tetap digunakan.
                    </small>

                </div>

            `;

        } else {

            title.textContent =
                "Tambah Dokumen";


            fileInput.required =
                true;

        }


        modal.classList.add(
            "show"
        );

    }


    function closeModal() {

        const modal =
            document.getElementById(
                "databasePelraModal"
            );

        if (!modal) {
            return;
        }

        modal.classList.remove(
            "show"
        );

        editingId =
            null;

    }


    /* =====================================================
       SAVE
    ===================================================== */

    async function saveFile(event) {

        event.preventDefault();


        const nameInput =
            document.getElementById(
                "databasePelraFileName"
            );


        const fileInput =
            document.getElementById(
                "databasePelraFile"
            );


        const namaFile =
            nameInput.value.trim();


        const file =
            fileInput.files[0];


        if (!namaFile) {

            alert(
                "Nama file wajib diisi."
            );

            return;

        }


        const data =
            getData();


        /* -------------------------------------------------
           EDIT
        ------------------------------------------------- */

        if (editingId) {

            const index =
                data.findIndex(
                    function (item) {

                        return (
                            item.id ===
                            editingId
                        );

                    }
                );


            if (index === -1) {

                alert(
                    "Dokumen tidak ditemukan."
                );

                return;

            }


            let fileData =
                data[index].fileData;


            let fileNameOriginal =
                data[index].fileNameOriginal;


            let fileSize =
                data[index].fileSize;


            let fileType =
                data[index].fileType;


            if (file) {

                try {

                    fileData =
                        await readFile(
                            file
                        );

                    fileNameOriginal =
                        file.name;

                    fileSize =
                        file.size;

                    fileType =
                        file.type;

                } catch (error) {

                    alert(
                        "Gagal membaca file."
                    );

                    return;

                }

            }


            data[index] = {

                ...data[index],

                namaFile,

                fileData,

                fileNameOriginal,

                fileSize,

                fileType,

                updatedAt:
                    new Date().toISOString()

            };


        } else {


            /* -------------------------------------------------
               TAMBAH
            ------------------------------------------------- */

            if (!file) {

                alert(
                    "Silakan pilih file."
                );

                return;

            }


            let fileData;


            try {

                fileData =
                    await readFile(
                        file
                    );

            } catch (error) {

                alert(
                    "Gagal membaca file."
                );

                return;

            }


            data.push({

                id:
                    generateId(),

                namaFile,

                fileNameOriginal:
                    file.name,

                fileSize:
                    file.size,

                fileType:
                    file.type,

                fileData,

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()

            });

        }


        const success =
            saveData(data);


        if (!success) {
            return;
        }


        closeModal();

        renderDatabase();


        alert(
            editingId
                ? "Dokumen berhasil diperbarui."
                : "Dokumen berhasil ditambahkan."
        );

    }


    /* =====================================================
       VIEW
    ===================================================== */

    function viewFile(id) {

        const data =
            getData();


        const item =
            data.find(
                function (entry) {

                    return entry.id === id;

                }
            );


        if (!item) {

            alert(
                "Dokumen tidak ditemukan."
            );

            return;

        }


        if (!item.fileData) {

            alert(
                "Data file tidak tersedia."
            );

            return;

        }


        const newWindow =
            window.open(
                "",
                "_blank"
            );


        if (!newWindow) {

            alert(
                "Browser memblokir jendela baru. Izinkan popup untuk membuka file."
            );

            return;

        }


        newWindow.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    ${escapeHTML(item.namaFile)}
                </title>

                <style>

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f1f5f9;
                        font-family: Arial, sans-serif;
                    }

                    iframe {
                        width: 100%;
                        height: 100vh;
                        border: 0;
                        background: white;
                    }

                    img {
                        max-width: 95%;
                        max-height: 95vh;
                        object-fit: contain;
                    }

                </style>

            </head>

            <body>

                ${
                    item.fileType &&
                    item.fileType.startsWith(
                        "image/"
                    )

                    ?

                    `
                        <img
                            src="${item.fileData}"
                            alt="${escapeHTML(item.namaFile)}"
                        >
                    `

                    :

                    `
                        <iframe
                            src="${item.fileData}"
                        ></iframe>
                    `

                }

            </body>

            </html>

        `);

        newWindow.document.close();

    }


    /* =====================================================
       DOWNLOAD
    ===================================================== */

    function downloadFile(id) {

        const data =
            getData();


        const item =
            data.find(
                function (entry) {

                    return entry.id === id;

                }
            );


        if (!item) {

            alert(
                "Dokumen tidak ditemukan."
            );

            return;

        }


        const fileName = item.fileNameOriginal || item.namaFile || "dokumen_spm.pdf";
        if (item.fileData && typeof item.fileData === "string" && item.fileData.startsWith("data:")) {
            const link = document.createElement("a");
            link.href = item.fileData;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } else {
            const content = `DOKUMEN HASIL SURVEI STANDAR PELAYANAN MINIMAL (SPM)\n\nJudul: ${item.namaFile || "-"}\nNama Berkas: ${fileName}\nTanggal: ${new Date().toLocaleDateString("id-ID")}\nBidang Pelayaran - Dinas Perhubungan`;
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


    /* =====================================================
       DELETE
    ===================================================== */

    function deleteFile(id) {

        if (!canManageData()) return;

        const data =
            getData();


        const item =
            data.find(
                function (entry) {

                    return entry.id === id;

                }
            );


        if (!item) {
            return;
        }


        const confirmation =
            confirm(
                `Hapus dokumen "${item.namaFile}"?`
            );


        if (!confirmation) {
            return;
        }


        const newData =
            data.filter(
                function (entry) {

                    return entry.id !== id;

                }
            );


        saveData(
            newData
        );


        renderDatabase();


        alert(
            "Dokumen berhasil dihapus."
        );

    }


    /* =====================================================
       ACTIONS
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {


            const viewButton =
                event.target.closest(
                    "[data-view-id]"
                );


            if (viewButton) {

                viewFile(
                    viewButton.dataset.viewId
                );

                return;

            }


            const downloadButton =
                event.target.closest(
                    "[data-download-id]"
                );


            if (downloadButton) {

                downloadFile(
                    downloadButton.dataset.downloadId
                );

                return;

            }


            const editButton =
                event.target.closest(
                    "[data-edit-id]"
                );


            if (editButton) {

                openModal(
                    editButton.dataset.editId
                );

                return;

            }


            const deleteButton =
                event.target.closest(
                    "[data-delete-id]"
                );


            if (deleteButton) {

                deleteFile(
                    deleteButton.dataset.deleteId
                );

                return;

            }

        }
    );


    /* =====================================================
       PAGE CHANGE
    ===================================================== */

    document.addEventListener(
        "sibaperPageChanged",
        function (event) {

            if (
                event.detail &&
                event.detail.page ===
                    "database-pelra"
            ) {

                setTimeout(
                    renderDatabase,
                    0
                );

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        createModal();

        renderDatabase();


        console.log(
            "SIBAPER Database PELRA & ASDP berhasil dijalankan."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();

    }

})();