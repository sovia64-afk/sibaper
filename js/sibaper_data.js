/* =========================================================
   SIBAPER - MODUL DATA + SUPABASE STORAGE
   ---------------------------------------------------------
   Fungsi:
   - Database
   - Struktur Organisasi
   - Perencanaan
   - Realisasi
   - Laporan
   - Galeri
   - Regulasi

   PENYIMPANAN:
   - Data aplikasi -> localStorage bridge -> Supabase
   - File -> Supabase Storage bucket "dokumen-sibaper"

   IMPORTANT:
   File TIDAK lagi disimpan sebagai Base64 di localStorage.
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       KONFIGURASI
    ===================================================== */

    const PREFIX = "sibaper_data_";

    const STORAGE_BUCKET = "dokumen-sibaper";

    function canManageData() {
        try {
            const session = JSON.parse(localStorage.getItem("sibaperSession"));
            return session?.role === "admin";
        } catch (_) {
            return false;
        }
    }

    const CONFIG = {

        /* =================================================
           STRUKTUR ORGANISASI
        ================================================= */

        "struktur-2025": {
            title: "Upload Struktur Organisasi 2025",
            type: "file",
            accept: "image/*,.pdf",
            fields: [
                ["judul", "Judul / Keterangan", "text", true],
                ["file", "File Struktur", "file", true]
            ]
        },

        "struktur-2026": {
            title: "Upload Struktur Organisasi 2026",
            type: "file",
            accept: "image/*,.pdf",
            fields: [
                ["judul", "Judul / Keterangan", "text", true],
                ["file", "File Struktur", "file", true]
            ]
        },


        /* =================================================
           DATABASE PELRA
        ================================================= */

        "database-pelra": {
            title: "Tambah Data PELRA ASDP",
            fields: [
                ["namaPerusahaan", "Nama Perusahaan", "text", true],
                ["jenisPerusahaan", "Jenis Perusahaan", "text", false],
                ["pimpinan", "Pimpinan Perusahaan", "text", false],
                ["nomorIzin", "Nomor Izin / Dokumen", "text", false],
                ["status", "Status", "text", false],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "Dokumen / File", "file", false]
            ]
        },


        /* =================================================
           DATABASE BUJANG
        ================================================= */

        "database-bujang": {
            title: "Tambah Data BUJANG",
            fields: [
                ["namaPerusahaan", "Nama Perusahaan", "text", true],
                ["jenisPerusahaan", "Jenis Perusahaan", "text", false],
                ["pimpinan", "Pimpinan Perusahaan", "text", false],
                ["nomorIzin", "Nomor Izin / Dokumen", "text", false],
                ["status", "Status", "text", false],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "Dokumen / File", "file", false]
            ]
        },


        /* =================================================
           PERENCANAAN
        ================================================= */

        "perencanaan-2025": {
            title: "Tambah Dokumen Perencanaan 2025",
            fields: [
                ["program", "Program", "text", false],
                ["kegiatan", "Kegiatan", "text", false],
                ["subKegiatan", "Sub Kegiatan PK", "text", false],
                ["rencanaAksi", "Rencana Aksi", "textarea", false],
                ["realisasiPk", "Realisasi PK", "textarea", false],
                ["realisasiRencanaAksi", "Realisasi Rencana Aksi", "textarea", false],
                ["dokumen", "Dokumen", "file", false]
            ]
        },

        "perencanaan-2026": {
            title: "Tambah Dokumen Perencanaan 2026",
            fields: [
                ["jenisDokumen", "Jenis Dokumen", "select", true, [
                    "SK",
                    "NOTULEN",
                    "KWITANSI",
                    "DLL"
                ]],
                ["judul", "Judul Dokumen", "text", true],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "File Dokumen", "file", false]
            ]
        },

        "perencanaan-2027": {
            title: "Tambah Dokumen Perencanaan 2027",
            fields: [
                ["judul", "Judul / Kegiatan", "text", true],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "File Dokumen", "file", false]
            ]
        },


        /* =================================================
           REALISASI ANGGARAN
        ================================================= */

        "realisasi-anggaran": {
            title: "Tambah Realisasi Anggaran",
            fields: [
                ["kegiatan", "Kegiatan", "text", true],
                ["pagu", "Pagu Anggaran", "number", false],
                ["realisasi", "Realisasi", "number", false],
                ["persentase", "Persentase (%)", "number", false],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "Dokumen Pendukung", "file", false]
            ]
        },


        /* =================================================
           REALISASI PELRA
        ================================================= */

        "realisasi-pelra": {
            title: "Tambah Pengawasan SPM",
            fields: [
                ["tanggal", "Tanggal", "date", true],
                ["perusahaan", "Perusahaan", "text", true],
                ["jenis", "Jenis / Kegiatan", "text", false],
                ["lokasi", "Lokasi", "text", false],
                ["hasil", "Hasil Pengawasan", "textarea", false],
                ["dokumen", "Dokumen Pendukung", "file", false]
            ]
        },


        /* =================================================
           REKOMENDASI TEKNIS
        ================================================= */

        "realisasi-rekomendasi-teknis": {
            title: "Tambah Rekomendasi Teknis",
            fields: [
                ["nomorSurat", "Nomor Surat", "text", true],
                ["tanggal", "Tanggal", "date", true],
                ["perihal", "Perihal", "text", false],
                ["namaPerusahaan", "Nama Perusahaan", "text", true],
                ["pimpinan", "Pimpinan Perusahaan", "text", false],
                ["jenisPerusahaan", "Jenis Perusahaan", "text", false],
                ["dokumen", "File PDF Rekomendasi", "file", false]
            ]
        },


        /* =================================================
           REKOMENDASI SMU
        ================================================= */

        "realisasi-rekomendasi-smu": {
            title: "Tambah Rekomendasi SMU",
            fields: [
                ["nomorSurat", "Nomor Surat", "text", true],
                ["tanggal", "Tanggal", "date", true],
                ["perihal", "Perihal", "text", false],
                ["namaPerusahaan", "Nama Perusahaan", "text", true],
                ["pimpinan", "Pimpinan Perusahaan", "text", false],
                ["jenisPerusahaan", "Jenis Perusahaan", "text", false],
                ["dokumen", "File PDF Rekomendasi", "file", false]
            ]
        },


        /* =================================================
           PENGAWASAN BADAN USAHA
        ================================================= */

        "realisasi-pengawasan-usaha": {
            title: "Tambah Pengawasan Badan Usaha",
            fields: [
                ["tanggal", "Tanggal", "date", true],
                ["perusahaan", "Perusahaan", "text", true],
                ["jenis", "Jenis", "text", false],
                ["lokasi", "Lokasi", "text", false],
                ["pimpinan", "Pimpinan", "text", false],
                ["hasil", "Hasil Pengawasan", "textarea", false],
                ["dokumen", "Dokumen", "file", false]
            ]
        },


        /* =================================================
           LAPORAN TAHUNAN
        ================================================= */

        "laporan-tahunan": {
            title: "Upload Laporan Tahunan",
            fields: [
                ["judul", "Judul Laporan", "text", true],
                ["tahun", "Tahun", "number", false],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "File Laporan", "file", true]
            ]
        },


        /* =================================================
           LAPORAN BADAN USAHA
        ================================================= */

        "laporan-badan-usaha": {
            title: "Tambah Laporan Badan Usaha",
            fields: [
                ["namaPerusahaan", "Nama Perusahaan", "text", true],
                ["jenisPerusahaan", "Jenis Perusahaan", "text", false],
                ["pimpinan", "Pimpinan Perusahaan", "text", false],
                ["muatan", "Muatan Ton / M³", "number", false],
                ["jenisMuatan", "Jenis Muatan", "text", false],
                ["bulan", "Bulan", "text", false],
                ["asal", "Asal Lokasi", "text", false],
                ["tujuan", "Tujuan", "text", false],
                ["kendaraan", "Kendaraan yang Digunakan", "text", false]
            ]
        },


        /* =================================================
           GALERI FOTO
        ================================================= */

        "galeri-foto": {
            title: "Tambah Foto",
            fields: [
                ["judul", "Judul Foto", "text", true],
                ["tanggal", "Tanggal", "date", false],
                ["keterangan", "Keterangan", "textarea", false],
                ["file", "Foto", "file", true]
            ]
        },


        /* =================================================
           GALERI VIDEO
        ================================================= */

        "galeri-video": {
            title: "Tambah Video",
            fields: [
                ["judul", "Judul Video", "text", true],
                ["tanggal", "Tanggal", "date", false],
                ["url", "URL Video YouTube / Video", "url", false],
                ["keterangan", "Keterangan", "textarea", false]
            ]
        },


        /* =================================================
           REGULASI
        ================================================= */

        "galeri-regulasi": {
            title: "Tambah Regulasi",
            fields: [
                ["judul", "Judul Regulasi", "text", true],
                ["nomor", "Nomor Regulasi", "text", false],
                ["tahun", "Tahun", "number", false],
                ["keterangan", "Keterangan", "textarea", false],
                ["dokumen", "File Regulasi", "file", false]
            ]
        }
    };


    /* =====================================================
       LOCAL STORAGE KEY
    ===================================================== */

    function key(page) {
        return PREFIX + page;
    }


    /* =====================================================
       SUPABASE CLIENT
    ===================================================== */

    function getSupabase() {
        if (window.sibaperSupabase) {
            return window.sibaperSupabase;
        }

        console.error(
            "SIBAPER: window.sibaperSupabase belum tersedia."
        );

        return null;
    }


    /* =====================================================
       BACA DATA
    ===================================================== */

    function read(page) {
        try {
            const value = JSON.parse(
                localStorage.getItem(key(page)) || "[]"
            );

            return Array.isArray(value) ? value : [];

        } catch (error) {

            console.error(
                "SIBAPER: gagal membaca data",
                page,
                error
            );

            return [];
        }
    }


    /* =====================================================
       SIMPAN DATA
       -----------------------------------------------------
       localStorage tetap digunakan sebagai cache.
       File TIDAK disimpan di sini sebagai Base64.
    ===================================================== */

    function write(page, data) {

        try {

            localStorage.setItem(
                key(page),
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error(
                "SIBAPER: gagal menyimpan data",
                page,
                error
            );

            alert(
                "Data gagal disimpan. Silakan coba lagi."
            );

            return false;
        }
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function esc(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       ID DATA
    ===================================================== */

    function id() {

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }


    /* =====================================================
       NAMA FILE AMAN
    ===================================================== */

    function sanitizeFileName(name) {

        return String(name || "file")
            .replace(/[^a-zA-Z0-9._-]/g, "_")
            .replace(/_+/g, "_")
            .slice(0, 150);
    }


    /* =====================================================
       UPLOAD FILE KE SUPABASE STORAGE
       -----------------------------------------------------
       INILAH BAGIAN PENTING.

       File langsung dikirim sebagai File/Blob.
       Tidak diubah menjadi Base64.
    ===================================================== */

    async function uploadFileToSupabase(file, page) {

        if (!file) {
            throw new Error(
                "File belum dipilih."
            );
        }

        const sb = getSupabase();

        if (!sb) {
            throw new Error(
                "Koneksi Supabase belum tersedia."
            );
        }


        /* ---------------------------------------------
           Pastikan koneksi Supabase sudah siap
        --------------------------------------------- */

        if (
            window.sibaperWaitForReady &&
            typeof window.sibaperWaitForReady === "function"
        ) {

            try {
                await window.sibaperWaitForReady();
            } catch (error) {
                console.warn(
                    "SIBAPER: menunggu Supabase gagal:",
                    error
                );
            }
        }


        /* ---------------------------------------------
           Validasi ukuran
           50 MB mengikuti batas bucket saat ini.
        --------------------------------------------- */

        const maxSize =
            50 * 1024 * 1024;

        if (file.size > maxSize) {

            throw new Error(
                "Ukuran file melebihi batas 50 MB."
            );
        }


        /* ---------------------------------------------
           Validasi tipe umum
        --------------------------------------------- */

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];

        if (
            file.type &&
            !allowedTypes.includes(file.type)
        ) {

            console.warn(
                "SIBAPER: tipe file:",
                file.type
            );
        }


        /* ---------------------------------------------
           Folder Storage
        --------------------------------------------- */

        const safePage =
            sanitizeFileName(page);

        const safeName =
            sanitizeFileName(file.name);

        const uniqueName =
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .slice(2, 10) +
            "_" +
            safeName;

        const storagePath =
            safePage +
            "/" +
            uniqueName;


        console.log(
            "SIBAPER: mulai upload file:",
            storagePath
        );


        /* ---------------------------------------------
           Upload langsung ke bucket
        --------------------------------------------- */

        const uploadResult =
            await sb.storage
                .from(STORAGE_BUCKET)
                .upload(
                    storagePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType:
                            file.type ||
                            "application/octet-stream"
                    }
                );


        if (uploadResult.error) {

            console.error(
                "SIBAPER: upload Storage gagal:",
                uploadResult.error
            );

            throw new Error(
                uploadResult.error.message ||
                "Upload file ke Supabase Storage gagal."
            );
        }


        /* ---------------------------------------------
           Ambil URL publik
        --------------------------------------------- */

        const publicResult =
            sb.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(
                    storagePath
                );


        const publicUrl =
            publicResult?.data?.publicUrl || "";


        if (!publicUrl) {

            console.error(
                "SIBAPER: public URL tidak berhasil dibuat."
            );

            throw new Error(
                "File berhasil diupload tetapi URL file tidak berhasil dibuat."
            );
        }


        console.log(
            "SIBAPER: upload berhasil:",
            publicUrl
        );


        return {
            url: publicUrl,
            path: storagePath,
            name: file.name,
            type: file.type || "",
            size: file.size
        };
    }


    /* =====================================================
       HAPUS FILE DARI SUPABASE STORAGE
    ===================================================== */

    async function deleteStorageFile(path) {

        if (!path) {
            return;
        }

        const sb = getSupabase();

        if (!sb) {
            return;
        }

        try {

            const result =
                await sb.storage
                    .from(STORAGE_BUCKET)
                    .remove([
                        path
                    ]);

            if (result.error) {

                console.warn(
                    "SIBAPER: file Storage gagal dihapus:",
                    result.error
                );

            } else {

                console.log(
                    "SIBAPER: file Storage dihapus:",
                    path
                );
            }

        } catch (error) {

            console.warn(
                "SIBAPER: kesalahan hapus file Storage:",
                error
            );
        }
    }


    /* =====================================================
       MODAL
    ===================================================== */

    function buildModal() {

        if (
            document.getElementById(
                "sibaperDataModal"
            )
        ) {
            return;
        }


        const el =
            document.createElement("div");

        el.id =
            "sibaperDataModal";

        el.className =
            "sibaper-data-modal-overlay";


        el.innerHTML = `
            <div class="sibaper-data-modal">

                <div class="sibaper-data-modal-head">

                    <div>

                        <span>
                            DATA SIBAPER
                        </span>

                        <h3 id="sibaperDataModalTitle">
                            Tambah Data
                        </h3>

                    </div>

                    <button
                        type="button"
                        id="sibaperDataClose"
                    >
                        ×
                    </button>

                </div>


                <form id="sibaperDataForm">

                    <input
                        type="hidden"
                        id="sibaperDataPage"
                    >

                    <input
                        type="hidden"
                        id="sibaperDataId"
                    >


                    <div
                        id="sibaperDataFields"
                        class="sibaper-data-fields"
                    ></div>


                    <div
                        class="sibaper-data-footer"
                    >

                        <button
                            type="button"
                            class="sibaper-data-cancel"
                            id="sibaperDataCancel"
                        >
                            Batal
                        </button>


                        <button
                            type="submit"
                            class="sibaper-data-save"
                            id="sibaperDataSaveButton"
                        >
                            Simpan Data
                        </button>

                    </div>

                </form>

            </div>
        `;


        document.body.appendChild(el);


        document
            .getElementById(
                "sibaperDataClose"
            )
            .onclick =
            closeModal;


        document
            .getElementById(
                "sibaperDataCancel"
            )
            .onclick =
            closeModal;


        el.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === el
                ) {
                    closeModal();
                }

            }
        );


        document
            .getElementById(
                "sibaperDataForm"
            )
            .addEventListener(
                "submit",
                save
            );
    }


    /* =====================================================
       RENDER FIELD
    ===================================================== */

    function renderFields(
        page,
        existing = {}
    ) {

        const cfg =
            CONFIG[page];

        const box =
            document.getElementById(
                "sibaperDataFields"
            );


        if (!cfg || !box) {
            return;
        }


        box.innerHTML = "";


        cfg.fields.forEach(
            function (fieldConfig) {

                const [
                    name,
                    label,
                    type,
                    required,
                    options
                ] = fieldConfig;


                const group =
                    document.createElement(
                        "div"
                    );

                group.className =
                    "sibaper-data-field";


                let input = "";


                const value =
                    existing[name] || "";


                /* -----------------------------------------
                   TEXTAREA
                ----------------------------------------- */

                if (
                    type === "textarea"
                ) {

                    input = `
                        <textarea
                            id="data_${name}"
                            ${required ? "required" : ""}
                            placeholder="${esc(label)}"
                        >${esc(value)}</textarea>
                    `;

                }


                /* -----------------------------------------
                   SELECT
                ----------------------------------------- */

                else if (
                    type === "select"
                ) {

                    input = `
                        <select
                            id="data_${name}"
                            ${required ? "required" : ""}
                        >

                            <option value="">
                                Pilih ${esc(label)}
                            </option>

                            ${
                                (options || [])
                                    .map(
                                        function (option) {

                                            return `
                                                <option
                                                    value="${esc(option)}"
                                                    ${
                                                        value === option
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    ${esc(option)}
                                                </option>
                                            `;
                                        }
                                    )
                                    .join("")
                            }

                        </select>
                    `;

                }


                /* -----------------------------------------
                   FILE
                ----------------------------------------- */

                else if (
                    type === "file"
                ) {

                    const accept =
                        cfg.accept ||
                        getAcceptByField(
                            page,
                            name
                        );


                    input = `
                        <input
                            id="data_${name}"
                            type="file"
                            ${
                                accept
                                    ? `accept="${esc(accept)}"`
                                    : ""
                            }
                            ${
                                required &&
                                !existing[name]
                                    ? "required"
                                    : ""
                            }
                        >

                        ${
                            existing[name]
                                ? `
                                    <small>
                                        File tersimpan.
                                        Pilih file baru
                                        jika ingin mengganti.
                                    </small>
                                `
                                : ""
                        }
                    `;

                }


                /* -----------------------------------------
                   INPUT BIASA
                ----------------------------------------- */

                else {

                    input = `
                        <input
                            id="data_${name}"
                            type="${esc(type)}"
                            value="${esc(value)}"
                            ${
                                required
                                    ? "required"
                                    : ""
                            }
                            placeholder="${esc(label)}"
                        >
                    `;
                }


                group.innerHTML = `
                    <label>
                        ${esc(label)}
                        ${
                            required
                                ? " <b>*</b>"
                                : ""
                        }
                    </label>

                    ${input}
                `;


                box.appendChild(group);

            }
        );
    }


    /* =====================================================
       ACCEPT FILE
    ===================================================== */

    function getAcceptByField(
        page,
        name
    ) {

        if (
            page === "galeri-foto"
        ) {
            return "image/*";
        }


        if (
            name === "dokumen"
        ) {
            return ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png";
        }


        if (
            name === "file"
        ) {
            return ".pdf,.jpg,.jpeg,.png,.webp";
        }


        return ".pdf,.jpg,.jpeg,.png,.webp";
    }


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openModal(
        page,
        editId = ""
    ) {

        const cfg =
            CONFIG[page];

        if (!cfg) {
            return;
        }


        buildModal();


        const data =
            read(page);


        const existing =
            data.find(
                function (item) {
                    return item.id === editId;
                }
            ) || {};


        document
            .getElementById(
                "sibaperDataPage"
            )
            .value =
            page;


        document
            .getElementById(
                "sibaperDataId"
            )
            .value =
            editId;


        document
            .getElementById(
                "sibaperDataModalTitle"
            )
            .textContent =
            editId
                ? "Edit Data"
                : cfg.title;


        renderFields(
            page,
            existing
        );


        document
            .getElementById(
                "sibaperDataModal"
            )
            .classList
            .add("show");
    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        const modal =
            document.getElementById(
                "sibaperDataModal"
            );


        if (modal) {

            modal.classList.remove(
                "show"
            );
        }
    }


    /* =====================================================
       SAVE DATA
       -----------------------------------------------------
       FILE:
       input -> Supabase Storage -> URL
       DATA:
       URL -> localStorage -> Supabase bridge
    ===================================================== */

    async function save(event) {

        event.preventDefault();


        const page =
            document
                .getElementById(
                    "sibaperDataPage"
                )
                .value;


        const editId =
            document
                .getElementById(
                    "sibaperDataId"
                )
                .value;


        const cfg =
            CONFIG[page];


        if (!cfg) {
            return;
        }


        const saveButton =
            document
                .getElementById(
                    "sibaperDataSaveButton"
                );


        const originalButtonText =
            saveButton
                ? saveButton.textContent
                : "";


        try {

            /* -----------------------------------------
               Disable tombol sementara
            ----------------------------------------- */

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Menyimpan...";
            }


            /* -----------------------------------------
               Tunggu Supabase
            ----------------------------------------- */

            if (
                window.sibaperWaitForReady &&
                typeof window.sibaperWaitForReady === "function"
            ) {

                await window.sibaperWaitForReady();
            }


            const data =
                read(page);


            const existing =
                data.find(
                    function (item) {
                        return item.id === editId;
                    }
                ) || {};


            const record = {
                ...existing,

                id:
                    editId ||
                    id(),

                updatedAt:
                    new Date()
                        .toISOString()
            };


            /* -----------------------------------------
               BACA SEMUA FIELD
            ----------------------------------------- */

            for (
                const fieldConfig
                of cfg.fields
            ) {

                const [
                    name,
                    ,
                    type
                ] = fieldConfig;


                const input =
                    document.getElementById(
                        "data_" + name
                    );


                if (!input) {
                    continue;
                }


                /* =====================================
                   FILE
                ===================================== */

                if (
                    type === "file"
                ) {

                    const file =
                        input.files &&
                        input.files[0];


                    /* ---------------------------------
                       Jika user memilih file baru
                    --------------------------------- */

                    if (file) {

                        console.log(
                            "SIBAPER: file dipilih:",
                            file.name,
                            file.size,
                            file.type
                        );


                        /* Upload ke Supabase */

                        const upload =
                            await uploadFileToSupabase(
                                file,
                                page
                            );


                        /* Simpan URL */

                        record[name] =
                            upload.url;


                        /* Nama asli */

                        record[name + "Name"] =
                            upload.name;


                        /* MIME */

                        record[name + "Type"] =
                            upload.type;


                        /* Ukuran */

                        record[name + "Size"] =
                            upload.size;


                        /* Path Storage */

                        record[name + "StoragePath"] =
                            upload.path;


                        console.log(
                            "SIBAPER: file berhasil disimpan:",
                            upload
                        );
                    }

                    /*
                       Jika edit data dan tidak memilih
                       file baru, file lama tetap dipakai.
                    */

                }


                /* =====================================
                   FIELD BIASA
                ===================================== */

                else {

                    record[name] =
                        input.value.trim();
                }
            }


            /* -----------------------------------------
               UPDATE / INSERT
            ----------------------------------------- */

            if (editId) {

                const index =
                    data.findIndex(
                        function (item) {
                            return item.id === editId;
                        }
                    );


                if (index >= 0) {

                    data[index] =
                        record;
                }

            } else {

                record.createdAt =
                    new Date()
                        .toISOString();


                data.push(record);
            }


            /* -----------------------------------------
               Simpan data
            ----------------------------------------- */

            if (
                !write(
                    page,
                    data
                )
            ) {

                throw new Error(
                    "Data gagal disimpan."
                );
            }


            /* -----------------------------------------
               Tutup modal
            ----------------------------------------- */

            closeModal();


            /* -----------------------------------------
               Render ulang
            ----------------------------------------- */

            renderPage(page);


            console.log(
                "SIBAPER: data berhasil disimpan:",
                record
            );


            /* -----------------------------------------
               Pesan berhasil
            ----------------------------------------- */

            alert(
                "Data berhasil disimpan."
            );


        } catch (error) {

            console.error(
                "SIBAPER: proses penyimpanan gagal:",
                error
            );


            alert(
                "Gagal menyimpan data:\n\n" +
                (
                    error?.message ||
                    "Terjadi kesalahan."
                )
            );


        } finally {

            if (saveButton) {

                saveButton.disabled =
                    false;

                saveButton.textContent =
                    originalButtonText ||
                    "Simpan Data";
            }
        }
    }


    /* =====================================================
       NAMA FILE
    ===================================================== */

    function humanFileName(record) {

        return (
            record.fileName ||
            record.dokumenName ||
            "Lihat file"
        );
    }


    /* =====================================================
       FILE BUTTON
    ===================================================== */

    function fileButton(record) {

        const src =
            record.file ||
            record.dokumen;


        if (!src) {
            return "";
        }


        const fileName =
            humanFileName(record);


        return `
            <a
                class="sibaper-file-link"
                href="${esc(src)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                📎 ${esc(fileName)}
            </a>
        `;
    }


    /* =====================================================
       RECORD TITLE
    ===================================================== */

    function recordTitle(
        page,
        record
    ) {

        return (
            record.judul ||
            record.namaPerusahaan ||
            record.perusahaan ||
            record.kegiatan ||
            record.nomorSurat ||
            record.nomor ||
            record.program ||
            "Data"
        );
    }


    /* =====================================================
       RENDER RECORD
    ===================================================== */

    function renderRecord(
        page,
        record
    ) {

        const cfg =
            CONFIG[page];


        let details = "";


        cfg.fields.forEach(
            function (fieldConfig) {

                const [
                    name,
                    label,
                    type
                ] = fieldConfig;


                if (
                    type === "file"
                ) {
                    return;
                }


                if (
                    !record[name]
                ) {
                    return;
                }


                details += `
                    <div
                        class="sibaper-data-detail"
                    >

                        <span>
                            ${esc(label)}
                        </span>

                        <strong>
                            ${esc(record[name])}
                        </strong>

                    </div>
                `;
            }
        );


        let media = "";


        /* ---------------------------------------------
           GALERI FOTO
        --------------------------------------------- */

        if (
            page === "galeri-foto" &&
            record.file
        ) {

            media = `
                <img
                    class="sibaper-data-image"
                    src="${esc(record.file)}"
                    alt="${esc(record.judul)}"
                >
            `;
        }


        /* ---------------------------------------------
           VIDEO
        --------------------------------------------- */

        else if (
            page === "galeri-video" &&
            record.url
        ) {

            media = `
                <div
                    class="sibaper-video-box"
                >

                    <a
                        href="${esc(record.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ▶ Buka Video
                    </a>

                </div>
            `;
        }


        /* ---------------------------------------------
           FILE BIASA
        --------------------------------------------- */

        else {

            media =
                fileButton(record);
        }


        return `
            <article
                class="sibaper-data-card"
            >

                ${media}


                <div
                    class="sibaper-data-card-body"
                >

                    <span
                        class="sibaper-data-tag"
                    >
                        ${
                            esc(
                                page
                                    .replace(
                                        /-/g,
                                        " "
                                    )
                                    .toUpperCase()
                            )
                        }
                    </span>


                    <h3>
                        ${esc(
                            recordTitle(
                                page,
                                record
                            )
                        )}
                    </h3>


                    <div
                        class="sibaper-data-details"
                    >
                        ${details}
                    </div>


                    <div
                        class="sibaper-data-actions"
                    >

                        <button
                            type="button"
                            data-sibaper-edit="${esc(record.id)}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            data-sibaper-delete="${esc(record.id)}"
                        >
                            Hapus
                        </button>

                    </div>

                </div>

            </article>
        `;
    }


    /* =====================================================
       RENDER PAGE
    ===================================================== */

    function renderPage(page) {

        const container =
            document.querySelector(
                `[data-content="${page}"]`
            );


        if (
            !container ||
            !CONFIG[page]
        ) {
            return;
        }


        const old =
            container.querySelector(
                ".sibaper-data-render"
            );


        if (old) {
            old.remove();
        }


        const data =
            read(page);


        const wrap =
            document.createElement(
                "div"
            );


        wrap.className =
            "sibaper-data-render";


        if (!data.length) {

            wrap.innerHTML = `
                <div
                    class="sibaper-data-empty"
                >

                    <div>
                        📂
                    </div>

                    <h3>
                        Belum ada data
                    </h3>

                    <p>
                        Klik tombol tambah di atas
                        untuk memasukkan data.
                    </p>

                </div>
            `;

        } else {

            wrap.innerHTML = `

                <div
                    class="sibaper-data-summary"
                >

                    <strong>
                        ${data.length}
                    </strong>

                    <span>
                        data tersimpan
                    </span>

                </div>


                <div
                    class="sibaper-data-grid"
                >

                    ${
                        data
                            .map(
                                function (record) {
                                    return renderRecord(
                                        page,
                                        record
                                    );
                                }
                            )
                            .join("")
                    }

                </div>
            `;
        }


        container.appendChild(
            wrap
        );


        const empty =
            container.querySelector(
                ".empty-content"
            );


        if (empty) {
            empty.style.display =
                "none";
        }
    }


    /* =====================================================
       RENDER SEMUA
    ===================================================== */

    function renderAll() {

        Object.keys(
            CONFIG
        ).forEach(
            function (page) {
                renderPage(page);
            }
        );
    }


    /* =====================================================
       DELETE DATA
    ===================================================== */

    async function deleteRecord(
        page,
        record
    ) {

        if (!record) {
            return;
        }


        const title =
            recordTitle(
                page,
                record
            );


        if (
            !confirm(
                `Hapus "${title}"?`
            )
        ) {
            return;
        }


        try {

            /* -----------------------------------------
               Hapus file Storage
            ----------------------------------------- */

            const possiblePaths = [];


            cfgFileNames:
            for (
                const fieldConfig
                of CONFIG[page].fields
            ) {

                const [
                    name,
                    ,
                    type
                ] = fieldConfig;


                if (
                    type !== "file"
                ) {
                    continue;
                }


                const path =
                    record[
                        name +
                        "StoragePath"
                    ];


                if (path) {

                    possiblePaths.push(
                        path
                    );
                }
            }


            for (
                const path
                of possiblePaths
            ) {

                await deleteStorageFile(
                    path
                );
            }


            /* -----------------------------------------
               Hapus record
            ----------------------------------------- */

            const data =
                read(page);


            const newData =
                data.filter(
                    function (item) {
                        return item.id !== record.id;
                    }
                );


            if (
                !write(
                    page,
                    newData
                )
            ) {

                return;
            }


            renderPage(
                page
            );


            console.log(
                "SIBAPER: data berhasil dihapus."
            );


        } catch (error) {

            console.error(
                "SIBAPER: gagal menghapus:",
                error
            );


            alert(
                "Data gagal dihapus:\n\n" +
                (
                    error?.message ||
                    "Terjadi kesalahan."
                )
            );
        }
    }


    /* =====================================================
       BUTTON EVENT
    ===================================================== */

    function bindButtons() {

        document.addEventListener(
            "click",
            function (event) {


                /* -----------------------------------------
                   TAMBAH DATA
                ----------------------------------------- */

                const actionButton =
                    event.target.closest(
                        ".primary-action"
                    );


                if (actionButton) {

                    if (!canManageData()) {
                        event.preventDefault();
                        return;
                    }

                    const page =
                        actionButton
                            .closest(
                                ".sibaper-page"
                            )
                            ?.dataset
                            .content;


                    if (
                        page &&
                        CONFIG[page]
                    ) {

                        event.preventDefault();

                        openModal(
                            page
                        );

                        return;
                    }
                }


                /* -----------------------------------------
                   EDIT
                ----------------------------------------- */

                const edit =
                    event.target.closest(
                        "[data-sibaper-edit]"
                    );


                if (edit) {

                    if (!canManageData()) {
                        event.preventDefault();
                        return;
                    }

                    const card =
                        edit.closest(
                            ".sibaper-page"
                        );


                    const page =
                        card
                            ?.dataset
                            .content;


                    if (page) {

                        openModal(
                            page,
                            edit.dataset
                                .sibaperEdit
                        );
                    }


                    return;
                }


                /* -----------------------------------------
                   DELETE
                ----------------------------------------- */

                const del =
                    event.target.closest(
                        "[data-sibaper-delete]"
                    );


                if (del) {

                    if (!canManageData()) {
                        event.preventDefault();
                        return;
                    }

                    const card =
                        del.closest(
                            ".sibaper-page"
                        );


                    const page =
                        card
                            ?.dataset
                            .content;


                    if (!page) {
                        return;
                    }


                    const data =
                        read(page);


                    const item =
                        data.find(
                            function (record) {

                                return (
                                    record.id ===
                                    del.dataset
                                        .sibaperDelete
                                );
                            }
                        );


                    if (!item) {
                        return;
                    }


                    void deleteRecord(
                        page,
                        item
                    );


                    return;
                }
            }
        );
    }


    /* =====================================================
       INIT
    ===================================================== */

    async function init() {

        buildModal();

        bindButtons();


        /* ---------------------------------------------
           Tunggu bridge Supabase
        --------------------------------------------- */

        if (
            window.sibaperWaitForReady &&
            typeof window.sibaperWaitForReady === "function"
        ) {

            try {

                await window.sibaperWaitForReady();

            } catch (error) {

                console.warn(
                    "SIBAPER: Supabase belum siap:",
                    error
                );
            }
        }


        renderAll();


        /* ---------------------------------------------
           Perubahan halaman
        --------------------------------------------- */

        document.addEventListener(
            "sibaperPageChanged",
            function (event) {

                const page =
                    event.detail?.page;


                if (
                    CONFIG[page]
                ) {

                    renderPage(
                        page
                    );
                }
            }
        );


        console.log(
            "SIBAPER Data Module + Supabase Storage berhasil dijalankan."
        );
    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    } else {

        init();
    }

})();