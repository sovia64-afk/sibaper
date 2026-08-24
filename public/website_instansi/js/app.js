/* =========================================================
   SIBAPER - APPLICATION + MODUL DATA
   Semua fungsi utama dalam SATU FILE
========================================================= */


/* =========================================================
   PAGE INFORMATION
========================================================= */

const pageInformation = {

    "beranda": {
        title: "Beranda",
        description:
            "Selamat datang di Sistem Informasi Bidang Pelayaran"
    },

    "profil-kepala-bidang": {
        title: "Kepala Bidang Pelayaran",
        description:
            "Data profil Kepala Bidang Pelayaran"
    },

    "profil-bujang": {
        title: "Kepala Seksi BUJANG",
        description:
            "Data profil Kepala Seksi BUJANG"
    },

    "profil-pelra": {
        title: "Kepala Seksi PELRA & ASDP",
        description:
            "Data profil Kepala Seksi PELRA & ASDP"
    },

    "profil-ketua-tim": {
        title: "Ketua Tim Kerja Pelabuhan",
        description:
            "Data profil Ketua Tim Kerja Pelabuhan"
    },

    "profil-staf": {
        title: "Staf",
        description:
            "Data staf Bidang Pelayaran"
    },

    "struktur-2025": {
        title: "Struktur Organisasi 2025",
        description:
            "Struktur organisasi Bidang Pelayaran tahun 2025"
    },

    "struktur-2026": {
        title: "Struktur Organisasi 2026",
        description:
            "Struktur organisasi Bidang Pelayaran tahun 2026"
    },

    "struktur-2027": {
        title: "Struktur Organisasi 2027",
        description:
            "Struktur organisasi Bidang Pelayaran tahun 2027"
    },

    "database-pelra": {
        title: "Hasil Survei SPM",
        description:
            "Dokumen hasil survei Standar Pelayanan Minimal"
    },

    "database-bujang": {
        title: "Perusahaan Angkutan Pelayaran",
        description:
            "Dokumen perusahaan angkutan pelayaran"
    },

    "perencanaan-2025": {
        title: "Perencanaan SAKIP",
        description:
            "Kebutuhan SAKIP (PROGRAM, PK, RENCANA AKSI, REALISASI PK, REALISASI RENCANA AKSI)"
    },

    "perencanaan-sakip-program": {
        title: "PROGRAM",
        description:
            "Perencanaan SAKIP - Program & Kegiatan"
    },

    "perencanaan-sakip-pk": {
        title: "PK",
        description:
            "Perencanaan SAKIP - Perjanjian Kinerja"
    },

    "perencanaan-sakip-rencana-aksi": {
        title: "RENCANA AKSI",
        description:
            "Perencanaan SAKIP - Rencana Aksi"
    },

    "perencanaan-sakip-realisasi-pk": {
        title: "REALISASI PK",
        description:
            "Perencanaan SAKIP - Realisasi Perjanjian Kinerja"
    },

    "perencanaan-sakip-realisasi-rencana-aksi": {
        title: "REALISASI RENCANA AKSI",
        description:
            "Perencanaan SAKIP - Realisasi Rencana Aksi"
    },

    "perencanaan-2026": {
        title: "Perencanaan 2026",
        description:
            "Kebutuhan SIMBANGDA"
    },

    "perencanaan-2027": {
        title: "Perencanaan 2027",
        description:
            "Data perencanaan tahun 2027"
    },

    "realisasi-anggaran": {
        title: "Realisasi Rinci Keseluruhan",
        description:
            "Input data Excel dan tautan Spreadsheet"
    },

    "realisasi-pelra": {
        title: "Seksi PELRA & ASDP",
        description:
            "Pengawasan SPM"
    },

    "realisasi-bujang": {
        title: "Seksi BUJANG",
        description:
            "Data realisasi Seksi BUJANG"
    },

    "realisasi-rekomendasi-teknis": {
        title: "Rekomendasi Teknis",
        description:
            "Rekomendasi teknis Seksi BUJANG"
    },

    "realisasi-rekomendasi-smu": {
        title: "Rekomendasi SMU",
        description:
            "Rekomendasi SMU Seksi BUJANG"
    },

    "laporan-tahunan": {
        title: "Laporan Tahunan",
        description:
            "Laporan kegiatan tahunan seluruh sub kegiatan"
    },

    "laporan-badan-usaha": {
        title: "Laporan Badan Usaha",
        description:
            "Laporan bulanan JPT dan PBM"
    },

    "laporan-analisis": {
        title: "Analisis & Grafik",
        description:
            "Analisis data dan visualisasi kinerja Bidang Pelayaran"
    },

    "kinerja-evaluasi": {
        title: "Evaluasi",
        description:
            "Evaluasi kinerja pegawai Bidang Pelayaran"
    },

    "kinerja-penilaian": {
        title: "Penilaian",
        description:
            "Penilaian kinerja pegawai Bidang Pelayaran"
    },

    "galeri-foto": {
        title: "Foto",
        description:
            "Dokumentasi foto kegiatan Bidang Pelayaran"
    },

    "galeri-video": {
        title: "Video",
        description:
            "Dokumentasi video kegiatan Bidang Pelayaran"
    },

    "galeri-regulasi": {
        title: "Regulasi",
        description:
            "Peraturan terkait pelayaran"
    }

};


/* =========================================================
   SHOW PAGE
========================================================= */

function showPage(pageName) {

    if (!pageName) {
        pageName = "beranda";
    }


    document
        .querySelectorAll(".sibaper-page")
        .forEach(function(page) {

            page.classList.remove("active");

        });


    const selectedPage =
        document.querySelector(
            `.sibaper-page[data-content="${pageName}"]`
        );


    if (selectedPage) {

        selectedPage.classList.add("active");

    }


    const pageTitle =
        document.getElementById("pageTitle");

    const pageDescription =
        document.getElementById("pageDescription");


    const information =
        pageInformation[pageName];


    if (
        information &&
        pageTitle &&
        pageDescription
    ) {

        pageTitle.textContent =
            information.title;

        pageDescription.textContent =
            information.description;

    }


    document
        .querySelectorAll(
            ".sibaper-menu-item[data-page]"
        )
        .forEach(function(item) {

            item.classList.remove("active");

        });


    document
        .querySelectorAll(
            ".sibaper-submenu button"
        )
        .forEach(function(item) {

            item.classList.remove("active");

        });


    const selectedSubmenu =
        document.querySelector(
            `.sibaper-submenu button[data-page="${pageName}"]`
        );


    if (selectedSubmenu) {

        selectedSubmenu.classList.add("active");


        const parentGroup =
            selectedSubmenu.closest(
                ".sibaper-menu-group"
            );


        if (parentGroup) {

            parentGroup.classList.add("open");


            const parentButton =
                parentGroup.querySelector(
                    ".sibaper-parent"
                );


            if (parentButton) {

                parentButton.classList.add("active");

            }

        }

    }


    const selectedMenu =
        document.querySelector(
            `.sibaper-menu-item[data-page="${pageName}"]`
        );


    if (selectedMenu) {

        selectedMenu.classList.add("active");

    }


    const main =
        document.querySelector(".sibaper-main");


    if (main) {

        main.scrollTop = 0;

    }


    document.dispatchEvent(
        new CustomEvent(
            "sibaperPageChanged",
            {
                detail: {
                    page: pageName
                }
            }
        )
    );

}


/* =========================================================
   INITIALIZATION APP
========================================================= */

function initializeSibaperApp() {


    document
        .querySelectorAll(
            ".sibaper-menu-item[data-page]"
        )
        .forEach(function(item) {

            item.addEventListener(
                "click",
                function() {

                    showPage(
                        this.dataset.page
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".sibaper-submenu button[data-page]"
        )
        .forEach(function(item) {

            item.addEventListener(
                "click",
                function() {

                    showPage(
                        this.dataset.page
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".sibaper-parent"
        )
        .forEach(function(parent) {

            parent.addEventListener(
                "click",
                function() {

                    const group =
                        this.closest(
                            ".sibaper-menu-group"
                        );


                    if (!group) {
                        return;
                    }


                    group.classList.toggle(
                        "open"
                    );

                }
            );

        });


    document
        .querySelectorAll("[data-page]")
        .forEach(function(element) {

            if (
                element.matches(
                    ".sibaper-menu-item, .sibaper-submenu button"
                )
            ) {

                return;

            }


            element.addEventListener(
                "click",
                function() {

                    if (this.dataset.page) {

                        showPage(
                            this.dataset.page
                        );

                    }

                }
            );

        });


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function() {

                if (
                    confirm(
                        "Apakah Anda yakin ingin keluar dari SIBAPER?"
                    )
                ) {

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    const mobileButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const sidebar =
        document.querySelector(
            ".sibaper-sidebar"
        );


    if (
        mobileButton &&
        sidebar
    ) {

        mobileButton.addEventListener(
            "click",
            function() {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }
        );

    }


    document
        .querySelectorAll(
            ".sibaper-submenu button"
        )
        .forEach(function(item) {

            item.addEventListener(
                "click",
                function() {

                    if (
                        window.innerWidth <= 900 &&
                        sidebar
                    ) {

                        sidebar.classList.remove(
                            "mobile-open"
                        );

                    }

                }
            );

        });


    showPage("beranda");


    console.log(
        "SIBAPER Application berhasil dijalankan."
    );

}


/* =========================================================
   MODUL DATA SIBAPER
========================================================= */

(function () {

    "use strict";


    const PREFIX =
        "sibaper_data_";


    /* =====================================================
       KONFIGURASI SEMUA DATA
    ===================================================== */

    const CONFIG = {


        /* ================= STRUCTURE ================= */

        "struktur-2025": {

            title:
                "Upload Struktur Organisasi 2025",

            fields: [

                [
                    "judul",
                    "Judul / Keterangan",
                    "text",
                    true
                ],

                [
                    "file",
                    "File Struktur",
                    "file",
                    true,
                    ".jpg,.jpeg,.png,.webp"
                ]

            ]

        },


        "struktur-2026": {

            title:
                "Upload Struktur Organisasi 2026",

            fields: [

                [
                    "judul",
                    "Judul / Keterangan",
                    "text",
                    true
                ],

                [
                    "file",
                    "File Struktur",
                    "file",
                    true,
                    ".jpg,.jpeg,.png,.webp"
                ]

            ]

        },


        "struktur-2027": {

            title:
                "Upload Struktur Organisasi 2027",

            fields: [

                [
                    "judul",
                    "Judul / Keterangan",
                    "text",
                    true
                ],

                [
                    "file",
                    "Gambar Struktur",
                    "file",
                    true,
                    ".jpg,.jpeg,.png,.webp"
                ]

            ]

        },


        /* ================= DATABASE ================= */

        "database-pelra": {

            title:
                "Tambah Data PELRA ASDP",

            fields: [

                [
                    "namaPerusahaan",
                    "Nama Perusahaan",
                    "text",
                    true
                ],

                [
                    "jenisPerusahaan",
                    "Jenis Perusahaan",
                    "text",
                    false
                ],

                [
                    "pimpinan",
                    "Pimpinan Perusahaan",
                    "text",
                    false
                ],

                [
                    "nomorIzin",
                    "Nomor Izin / Dokumen",
                    "text",
                    false
                ],

                [
                    "status",
                    "Status",
                    "text",
                    false
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ]

            ]

        },


        "database-bujang": {

            title:
                "Tambah Data BUJANG",

            fields: [

                [
                    "namaPerusahaan",
                    "Nama Perusahaan",
                    "text",
                    true
                ],

                [
                    "jenisPerusahaan",
                    "Jenis Perusahaan",
                    "text",
                    false
                ],

                [
                    "pimpinan",
                    "Pimpinan Perusahaan",
                    "text",
                    false
                ],

                [
                    "nomorIzin",
                    "Nomor Izin / Dokumen",
                    "text",
                    false
                ],

                [
                    "status",
                    "Status",
                    "text",
                    false
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ]

            ]

        },


        /* ================= PERENCANAAN ================= */

        "perencanaan-2025": {
            title: "Tambah Dokumen SAKIP 2025",
            fields: [
                ["kategori", "Kategori SAKIP", "select", true, ["PROGRAM", "PK", "RENCANA AKSI", "REALISASI PK", "REALISASI RENCANA AKSI"]],
                ["judul", "Nama / Judul Dokumen", "text", true],
                ["tahun", "Tahun / Periode", "text", true],
                ["keterangan", "Uraian / Keterangan", "textarea", false],
                ["dokumen", "File Dokumen", "file", false]
            ]
        },

        "perencanaan-sakip-program": {
            title: "Tambah Data PROGRAM",
            fields: [
                ["judul", "Nama / Judul Program", "text", true],
                ["pagu", "Target / Indikator Capaian", "text", false],
                ["tahun", "Tahun / Periode", "text", true],
                ["keterangan", "Uraian / Keterangan Program", "textarea", false],
                ["dokumen", "Upload Berkas Dokumen Program", "file", false]
            ]
        },

        "perencanaan-sakip-pk": {
            title: "Tambah Data PK (Perjanjian Kinerja)",
            fields: [
                ["judul", "Nama / Uraian PK", "text", true],
                ["pihak", "Jabatan / Pihak yang Berjanji", "text", false],
                ["tahun", "Tahun / Periode", "text", true],
                ["keterangan", "Target / Uraian Kinerja", "textarea", false],
                ["dokumen", "Upload Berkas Dokumen PK", "file", false]
            ]
        },

        "perencanaan-sakip-rencana-aksi": {
            title: "Tambah Data RENCANA AKSI",
            fields: [
                ["judul", "Judul Rencana Aksi", "text", true],
                ["target", "Target / Jadwal Pelaksanaan", "text", false],
                ["tahun", "Tahun / Periode", "text", true],
                ["keterangan", "Uraian Rencana Aksi", "textarea", false],
                ["dokumen", "Upload Berkas Rencana Aksi", "file", false]
            ]
        },

        "perencanaan-sakip-realisasi-pk": {
            title: "Tambah Data REALISASI PK",
            fields: [
                ["judul", "Judul / Uraian Realisasi PK", "text", true],
                ["capaian", "Capaian Realisasi (%)", "text", false],
                ["periode", "Periode / Triwulan / Tahun", "text", true],
                ["keterangan", "Evaluasi & Keterangan Capaian", "textarea", false],
                ["dokumen", "Upload Berkas Realisasi PK", "file", false]
            ]
        },

        "perencanaan-sakip-realisasi-rencana-aksi": {
            title: "Tambah Data REALISASI RENCANA AKSI",
            fields: [
                ["judul", "Judul Realisasi Rencana Aksi", "text", true],
                ["capaian", "Capaian Realisasi Aksi", "text", false],
                ["periode", "Periode / Triwulan / Tahun", "text", true],
                ["keterangan", "Evaluasi Kendala & Catatan", "textarea", false],
                ["dokumen", "Upload Berkas Realisasi Rencana Aksi", "file", false]
            ]
        },


        "perencanaan-2026": {

            title:
                "Tambah Dokumen Perencanaan 2026",

            fields: [

                [
                    "jenisDokumen",
                    "Jenis Dokumen",
                    "select",
                    true,
                    [
                        "SK",
                        "NOTULEN",
                        "KWITANSI",
                        "DLL"
                    ]
                ],

                [
                    "judul",
                    "Judul Dokumen",
                    "text",
                    true
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ],

                [
                    "dokumen",
                    "File Dokumen",
                    "file",
                    false
                ]

            ]

        },


        "perencanaan-2027": {

            title:
                "Tambah Dokumen Perencanaan 2027",

            fields: [

                [
                    "judul",
                    "Judul / Kegiatan",
                    "text",
                    true
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ],

                [
                    "dokumen",
                    "File Dokumen",
                    "file",
                    false
                ]

            ]

        },


        /* ================= REALISASI ================= */

        "realisasi-anggaran": {

            title:
                "Tambah Realisasi Rinci Keseluruhan",

            fields: [

                [
                    "namaFile",
                    "Nama File",
                    "text",
                    true
                ],

                [
                    "fileExcel",
                    "Upload Data Excel",
                    "file",
                    true,
                    ".xls,.xlsx,.csv"
                ],

                [
                    "linkSpreadsheet",
                    "Link Spreadsheet",
                    "url",
                    false
                ]

            ]

        },


        "realisasi-pelra": {

            title:
                "Tambah Pengawasan SPM",

            fields: [

                [
                    "tanggal",
                    "Tanggal",
                    "date",
                    true
                ],

                [
                    "perusahaan",
                    "Perusahaan",
                    "text",
                    true
                ],

                [
                    "jenis",
                    "Jenis / Kegiatan",
                    "text",
                    false
                ],

                [
                    "lokasi",
                    "Lokasi",
                    "text",
                    false
                ],

                [
                    "hasil",
                    "Hasil Pengawasan",
                    "textarea",
                    false
                ],

                [
                    "dokumen",
                    "Dokumen Pendukung",
                    "file",
                    false
                ]

            ]

        },


        "realisasi-rekomendasi-teknis": {

            title:
                "Tambah Rekomendasi Teknis",

            fields: [

                [
                    "nomorSurat",
                    "Nomor Surat",
                    "text",
                    true
                ],

                [
                    "tanggal",
                    "Tanggal",
                    "date",
                    true
                ],

                [
                    "perihal",
                    "Perihal",
                    "text",
                    false
                ],

                [
                    "namaPerusahaan",
                    "Nama Perusahaan",
                    "text",
                    true
                ],

                [
                    "pimpinan",
                    "Pimpinan Perusahaan",
                    "text",
                    false
                ],

                [
                    "jenisPerusahaan",
                    "Jenis Perusahaan",
                    "text",
                    false
                ],

                [
                    "dokumen",
                    "File PDF Rekomendasi",
                    "file",
                    false
                ]

            ]

        },


        "realisasi-rekomendasi-smu": {

            title:
                "Tambah Rekomendasi SMU",

            fields: [

                [
                    "nomorSurat",
                    "Nomor Surat",
                    "text",
                    true
                ],

                [
                    "tanggal",
                    "Tanggal",
                    "date",
                    true
                ],

                [
                    "perihal",
                    "Perihal",
                    "text",
                    false
                ],

                [
                    "namaPerusahaan",
                    "Nama Perusahaan",
                    "text",
                    true
                ],

                [
                    "pimpinan",
                    "Pimpinan Perusahaan",
                    "text",
                    false
                ],

                [
                    "jenisPerusahaan",
                    "Jenis Perusahaan",
                    "text",
                    false
                ],

                [
                    "dokumen",
                    "File PDF Rekomendasi",
                    "file",
                    false
                ]

            ]

        },


        "realisasi-pengawasan-usaha": {

            title:
                "Tambah Pengawasan Badan Usaha",

            fields: [

                [
                    "tanggal",
                    "Tanggal",
                    "date",
                    true
                ],

                [
                    "perusahaan",
                    "Perusahaan",
                    "text",
                    true
                ],

                [
                    "jenis",
                    "Jenis",
                    "text",
                    false
                ],

                [
                    "lokasi",
                    "Lokasi",
                    "text",
                    false
                ],

                [
                    "pimpinan",
                    "Pimpinan",
                    "text",
                    false
                ],

                [
                    "hasil",
                    "Hasil Pengawasan",
                    "textarea",
                    false
                ],

                [
                    "dokumen",
                    "Dokumen",
                    "file",
                    false
                ]

            ]

        },


        /* ================= LAPORAN ================= */

        "laporan-tahunan": {

            title:
                "Upload Laporan Tahunan",

            fields: [

                [
                    "judul",
                    "Judul Laporan",
                    "text",
                    true
                ],

                [
                    "tahun",
                    "Tahun",
                    "number",
                    false
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ],

                [
                    "dokumen",
                    "File Laporan",
                    "file",
                    true
                ]

            ]

        },


        "laporan-badan-usaha": {

            title:
                "Tambah Laporan Badan Usaha",

            fields: [

                [
                    "namaPerusahaan",
                    "Nama Perusahaan",
                    "text",
                    true
                ],

                [
                    "jenisPerusahaan",
                    "Jenis Perusahaan",
                    "text",
                    false
                ],

                [
                    "pimpinan",
                    "Pimpinan Perusahaan",
                    "text",
                    false
                ],

                [
                    "muatan",
                    "Muatan Ton / M³",
                    "number",
                    false
                ],

                [
                    "jenisMuatan",
                    "Jenis Muatan",
                    "text",
                    false
                ],

                [
                    "bulan",
                    "Bulan",
                    "text",
                    false
                ],

                [
                    "asal",
                    "Asal Lokasi",
                    "text",
                    false
                ],

                [
                    "tujuan",
                    "Tujuan",
                    "text",
                    false
                ],

                [
                    "kendaraan",
                    "Kendaraan yang Digunakan",
                    "text",
                    false
                ]

            ]

        },


        /* ================= GALERI ================= */

        "galeri-foto": {

            title:
                "Tambah Foto",

            fields: [

                [
                    "judul",
                    "Judul Foto",
                    "text",
                    true
                ],

                [
                    "tanggal",
                    "Tanggal",
                    "date",
                    false
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ],

                [
                    "file",
                    "Foto",
                    "file",
                    true
                ]

            ]

        },


        "galeri-video": {

            title:
                "Tambah Video",

            fields: [

                [
                    "judul",
                    "Judul Video",
                    "text",
                    true
                ],

                [
                    "tanggal",
                    "Tanggal",
                    "date",
                    false
                ],

                [
                    "url",
                    "Link YouTube / Google Drive",
                    "url",
                    false
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ]

            ]

        },


        "galeri-regulasi": {

            title:
                "Tambah Regulasi",

            fields: [

                [
                    "judul",
                    "Judul Regulasi",
                    "text",
                    true
                ],

                [
                    "nomor",
                    "Nomor Regulasi",
                    "text",
                    false
                ],

                [
                    "tahun",
                    "Tahun",
                    "number",
                    false
                ],

                [
                    "keterangan",
                    "Keterangan",
                    "textarea",
                    false
                ],

                [
                    "dokumen",
                    "File Regulasi",
                    "file",
                    false
                ]

            ]

        }

    };


    /* =====================================================
       STORAGE
    ===================================================== */

    function storageKey(page) {

        return PREFIX + page;

    }


    function read(page) {

        try {

            const raw =
                localStorage.getItem(
                    storageKey(page)
                );


            if (!raw) {
                return [];
            }


            const data =
                JSON.parse(raw);


            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Gagal membaca data:",
                error
            );

            return [];

        }

    }


    function write(page, data) {

        try {

            localStorage.setItem(
                storageKey(page),
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error(
                "Gagal menyimpan data:",
                error
            );


            alert(
                "Data gagal disimpan. Kemungkinan ukuran file terlalu besar untuk localStorage browser."
            );


            return false;

        }

    }


    function createId() {

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2, 9)
        );

    }


    function canManageData() {

        try {
            const session = JSON.parse(localStorage.getItem("sibaperSession"));
            return session && ["admin", "superadmin"].includes(session.role);
        } catch (error) {
            return false;
        }

    }


    function sameRecordId(left, right) {

        return String(left) === String(right);

    }


    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    function fileToDataURL(file) {

        return new Promise(
            function(resolve, reject) {

                const reader =
                    new FileReader();


                reader.onload =
                    function() {

                        resolve(
                            reader.result
                        );

                    };


                reader.onerror =
                    reject;


                reader.readAsDataURL(
                    file
                );

            }
        );

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


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "sibaperDataModal";


        modal.className =
            "sibaper-data-modal";


        modal.innerHTML = `

            <div class="sibaper-data-modal-box">

                <div class="sibaper-data-modal-header">

                    <div>

                        <span>
                            SIBAPER
                        </span>

                        <h2
                            id="sibaperDataModalTitle"
                        >
                            Tambah Data
                        </h2>

                    </div>


                    <button
                        type="button"
                        id="sibaperDataClose"
                        class="sibaper-data-close"
                    >
                        ×
                    </button>

                </div>


                <form
                    id="sibaperDataForm"
                >

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
                    >
                    </div>


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
                        >
                            Simpan Data
                        </button>

                    </div>

                </form>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "sibaperDataClose"
            )
            .addEventListener(
                "click",
                closeModal
            );


        document
            .getElementById(
                "sibaperDataCancel"
            )
            .addEventListener(
                "click",
                closeModal
            );


        modal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === modal
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
                saveData
            );

    }


    /* =====================================================
       RENDER FORM
    ===================================================== */

    function renderFields(
        page,
        existing
    ) {

        const cfg =
            CONFIG[page];


        const box =
            document.getElementById(
                "sibaperDataFields"
            );


        box.innerHTML = "";


        cfg.fields.forEach(
            function(field) {

                const name =
                    field[0];

                const label =
                    field[1];

                const type =
                    field[2];

                const required =
                    field[3];

                const options =
                    field[4];


                const group =
                    document.createElement(
                        "div"
                    );


                group.className =
                    "sibaper-data-field";


                const value =
                    existing[name] || "";


                let inputHTML =
                    "";


                if (
                    type === "textarea"
                ) {

                    inputHTML = `

                        <textarea
                            id="data_${name}"
                            ${
                                required
                                    ? "required"
                                    : ""
                            }
                            placeholder="${escapeHTML(label)}"
                        >${escapeHTML(value)}</textarea>

                    `;

                }

                else if (
                    type === "select"
                ) {

                    inputHTML = `

                        <select
                            id="data_${name}"
                            ${
                                required
                                    ? "required"
                                    : ""
                            }
                        >

                            <option value="">
                                Pilih ${escapeHTML(label)}
                            </option>

                            ${
                                options
                                    .map(
                                        function(option) {

                                            return `

                                                <option
                                                    value="${escapeHTML(option)}"
                                                    ${
                                                        value === option
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    ${escapeHTML(option)}
                                                </option>

                                            `;

                                        }
                                    )
                                    .join("")
                            }

                        </select>

                    `;

                }

                else if (
                    type === "file"
                ) {

                    inputHTML = `

                        <input
                            id="data_${name}"
                            type="file"
                            ${
                                typeof options === "string" && options
                                    ? `accept="${escapeHTML(options)}"`
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
                                        Pilih file baru jika
                                        ingin mengganti.
                                    </small>
                                `
                                : ""
                        }

                    `;

                }

                else {

                    inputHTML = `

                        <input
                            id="data_${name}"
                            type="${type}"
                            value="${escapeHTML(value)}"
                            ${
                                required
                                    ? "required"
                                    : ""
                            }
                            placeholder="${escapeHTML(label)}"
                        >

                    `;

                }


                group.innerHTML = `

                    <label>

                        ${escapeHTML(label)}

                        ${
                            required
                                ? " *"
                                : ""
                        }

                    </label>

                    ${inputHTML}

                `;


                box.appendChild(
                    group
                );

            }
        );

    }


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openDataModal(
        page,
        editId
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
                function(item) {

                    return sameRecordId(item.id, editId);

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
            editId || "";


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
            .classList.add(
                "show"
            );

    }


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
    ===================================================== */

    async function saveData(
        event
    ) {

        event.preventDefault();


        const page =
            document.getElementById(
                "sibaperDataPage"
            ).value;


        const editId =
            document.getElementById(
                "sibaperDataId"
            ).value;


        const cfg =
            CONFIG[page];


        if (!cfg) {
            return;
        }


        const data =
            read(page);


        const existing =
            data.find(
                function(item) {

                    return sameRecordId(item.id, editId);

                }
            ) || {};


        const record = {

            ...existing,

            id:
                editId ||
                createId(),

            updatedAt:
                new Date()
                    .toISOString()

        };


        for (
            const field
            of cfg.fields
        ) {

            const name =
                field[0];

            const type =
                field[2];


            const input =
                document.getElementById(
                    "data_" + name
                );


            if (!input) {
                continue;
            }


            if (
                type === "file"
            ) {

                if (
                    input.files &&
                    input.files[0]
                ) {

                    try {

                        record[name] =
                            await fileToDataURL(
                                input.files[0]
                            );


                        record[name + "Name"] =
                            input.files[0].name;


                        record[name + "Type"] =
                            input.files[0].type;

                    } catch (error) {

                        console.error(
                            "Gagal membaca file:",
                            error
                        );


                        alert(
                            "File gagal dibaca."
                        );


                        return;

                    }

                }

            }

            else {

                record[name] =
                    input.value.trim();

            }

        }


        if (editId) {

            const index =
                data.findIndex(
                    function(item) {

                        return sameRecordId(item.id, editId);

                    }
                );


            if (index >= 0) {

                data[index] =
                    record;

            }

        }

        else {

            record.createdAt =
                new Date()
                    .toISOString();


            data.push(
                record
            );

        }


        if (
            !write(
                page,
                data
            )
        ) {

            return;

        }


        closeModal();


        renderDataPage(
            page
        );


        alert(
            editId
                ? "Data berhasil diperbarui."
                : "Data berhasil disimpan."
        );

    }


    /* =====================================================
       FILE
    ===================================================== */

    function getFileName(
        record
    ) {

        return (
            record.fileName ||
            record.dokumenName ||
            record.fileExcelName ||
            "Lihat file"
        );

    }


    function downloadSibaperRecordFile(fileName, src, desc) {
        const cleanName = fileName || "dokumen_dishub.pdf";
        if (src && (src.startsWith("data:") || src.startsWith("blob:"))) {
            const link = document.createElement("a");
            link.href = src;
            link.download = cleanName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (window.SibaperSheetsSync && window.SibaperSheetsSync.showToast) {
                window.SibaperSheetsSync.showToast(`Berkas "${cleanName}" berhasil diunduh!`, "success");
            }
            return;
        }

        if (src && isSafeUrl(src)) {
            const link = document.createElement("a");
            link.href = src;
            link.target = "_blank";
            link.download = cleanName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            return;
        }

        // Fallback: Generate downloadable document with description & metadata
        const content = `DOKUMEN DINAS PERHUBUNGAN - SIBAPER\n` +
            `====================================\n` +
            `Nama Berkas : ${cleanName}\n` +
            `Waktu Unduh : ${new Date().toLocaleString("id-ID")}\n` +
            (desc ? `Keterangan  : ${desc}\n` : '') +
            `Status      : Terverifikasi Sistem SIBAPER\n\n` +
            `Dokumen ini tercatat dalam pangkalan data Bidang Pelayaran Dinas Perhubungan.`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = cleanName.endsWith(".txt") || cleanName.endsWith(".pdf") || cleanName.endsWith(".doc") || cleanName.endsWith(".docx") || cleanName.endsWith(".xlsx") || cleanName.endsWith(".jpg") || cleanName.endsWith(".png") ? cleanName : cleanName + ".txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        if (window.SibaperSheetsSync && window.SibaperSheetsSync.showToast) {
            window.SibaperSheetsSync.showToast(`Berkas "${cleanName}" berhasil diunduh!`, "success");
        }
    }

    function getFileButton(
        record
    ) {

        const src =
            record.file ||
            record.dokumen ||
            record.fileExcel ||
            record.fileData ||
            "";

        const fileName = getFileName(record);

        if (!src && !record.fileName && !record.dokumenName && !record.fileExcelName && !record.judul && !record.namaPerusahaan) {
            return "";
        }

        return `
            <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 18px 0;align-items:center;">
                <button
                    type="button"
                    class="sibaper-download-btn"
                    data-file-src="${escapeHTML(src)}"
                    data-file-name="${escapeHTML(fileName)}"
                    data-file-desc="${escapeHTML(record.keterangan || '')}"
                    style="display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;background:#2563eb;color:#fff;font-size:12px;font-weight:700;border:none;cursor:pointer;"
                >
                    ⬇ Unduh File (${escapeHTML(fileName)})
                </button>
            </div>
        `;

    }


    function isSafeUrl(value) {

        try {
            const url = new URL(value, window.location.href);
            return ["http:", "https:"].includes(url.protocol);
        } catch (error) {
            return false;
        }

    }


    function getSpreadsheetLink(record) {

        if (
            !record.linkSpreadsheet ||
            !isSafeUrl(record.linkSpreadsheet)
        ) {
            return "";
        }

        return `
            <a
                class="sibaper-spreadsheet-link"
                href="${escapeHTML(record.linkSpreadsheet)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Buka Spreadsheet
            </a>
        `;

    }

    function formatDateDisplay(dStr) {
        if (!dStr) return "-";
        try {
            const parts = dStr.split("-");
            if (parts.length === 3) {
                const dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                return dateObj.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                });
            }
            const d = new Date(dStr);
            if (isNaN(d.getTime())) return dStr;
            return d.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
        } catch (e) {
            return dStr;
        }
    }

    function getYouTubeVideoId(url) {
        if (!url) return null;
        try {
            const trimmed = url.trim();
            const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
            if (ytMatch && ytMatch[1]) {
                return ytMatch[1];
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    function getGoogleDriveFileId(url) {
        if (!url) return null;
        try {
            const trimmed = url.trim();
            const gMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/i);
            if (gMatch && gMatch[1]) {
                return gMatch[1];
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    /* =====================================================
       FOTO CARD RENDERER
    ===================================================== */
    function renderFotoCard(record) {
        const hasImg = record.file && (record.file.startsWith("data:image/") || record.file.startsWith("http"));
        const fileName = record.fileName || (record.judul ? record.judul.replace(/[^a-zA-Z0-9_-]/g, "_") + ".jpg" : "foto_kegiatan.jpg");
        const dateFormatted = record.tanggal ? formatDateDisplay(record.tanggal) : "-";

        return `
            <article class="sibaper-foto-card" id="foto-${escapeHTML(record.id)}">
                <div class="foto-card-media-wrapper">
                    ${hasImg ? `
                        <img 
                            src="${escapeHTML(record.file)}" 
                            alt="${escapeHTML(record.judul || 'Foto Kegiatan')}" 
                            class="foto-card-img"
                            loading="lazy"
                        >
                        <div class="foto-card-overlay-badge">
                            <span>📷 FOTO DOKUMENTASI</span>
                        </div>
                        <button type="button" class="btn-foto-quick-zoom" data-preview-img="${escapeHTML(record.file)}" data-preview-title="${escapeHTML(record.judul || 'Foto Dokumentasi')}">
                            🔍 Perbesar
                        </button>
                    ` : `
                        <div class="foto-card-placeholder">
                            <div class="foto-ph-icon">📷</div>
                            <span>Foto Belum Diunggah</span>
                        </div>
                    `}
                </div>
                <div class="foto-card-body">
                    <div class="foto-card-header">
                        <span class="foto-card-date">📅 ${escapeHTML(dateFormatted)}</span>
                    </div>
                    <h3 class="foto-card-title">${escapeHTML(record.judul || 'Foto Kegiatan')}</h3>
                    ${record.keterangan ? `
                        <p class="foto-card-desc">${escapeHTML(record.keterangan)}</p>
                    ` : `
                        <p class="foto-card-desc text-muted">Tidak ada keterangan tambahan.</p>
                    `}
                    
                    <div class="foto-card-footer">
                        <button 
                            type="button" 
                            class="btn-foto-download-full sibaper-download-btn"
                            data-file-src="${escapeHTML(record.file || '')}"
                            data-file-name="${escapeHTML(fileName)}"
                            data-file-desc="${escapeHTML(record.keterangan || '')}"
                            title="Unduh foto beserta keterangan"
                        >
                            ⬇ Unduh Foto & Keterangan
                        </button>
                        
                        ${canManageData() ? `
                            <div class="foto-card-admin-actions">
                                <button type="button" class="btn-action-edit" data-sibaper-edit="${escapeHTML(record.id)}" title="Edit Data">✏ Edit</button>
                                <button type="button" class="btn-action-del" data-sibaper-delete="${escapeHTML(record.id)}" title="Hapus Data">🗑 Hapus</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;
    }

    /* =====================================================
       VIDEO CARD RENDERER
    ===================================================== */
    function renderVideoCard(record) {
        const rawUrl = record.url ? record.url.trim() : "";
        const ytId = getYouTubeVideoId(rawUrl);
        const gDriveId = getGoogleDriveFileId(rawUrl);
        const dateFormatted = record.tanggal ? formatDateDisplay(record.tanggal) : "-";
        const isDirectVideo = rawUrl && (rawUrl.endsWith(".mp4") || rawUrl.endsWith(".webm") || rawUrl.startsWith("data:video/") || rawUrl.startsWith("blob:"));

        let playerHTML = "";
        if (ytId) {
            playerHTML = `
                <div class="video-embed-container">
                    <iframe 
                        src="https://www.youtube.com/embed/${escapeHTML(ytId)}?rel=0" 
                        title="${escapeHTML(record.judul || 'Video')}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        } else if (gDriveId) {
            playerHTML = `
                <div class="video-embed-container gdrive-embed">
                    <iframe 
                        src="https://drive.google.com/file/d/${escapeHTML(gDriveId)}/preview" 
                        title="${escapeHTML(record.judul || 'Video Google Drive')}" 
                        allow="autoplay"
                    ></iframe>
                </div>
            `;
        } else if (isDirectVideo) {
            playerHTML = `
                <div class="video-embed-container">
                    <video controls class="video-html5-player" preload="metadata">
                        <source src="${escapeHTML(rawUrl)}">
                        Browser tidak mendukung pemutar video.
                    </video>
                </div>
            `;
        } else if (rawUrl) {
            playerHTML = `
                <div class="video-poster-box">
                    <div class="video-poster-badge">🎬 Video Tautan Luar</div>
                    <div class="video-play-disc">▶</div>
                    <a href="${escapeHTML(rawUrl)}" target="_blank" rel="noopener noreferrer" class="video-poster-link">
                        Buka Video di Tab Baru
                    </a>
                </div>
            `;
        } else {
            playerHTML = `
                <div class="video-poster-box empty">
                    <div class="video-play-disc empty">🎬</div>
                    <span>Tautan video belum diinput</span>
                </div>
            `;
        }

        return `
            <article class="sibaper-video-card" id="video-${escapeHTML(record.id)}">
                ${playerHTML}
                <div class="video-card-body">
                    <div class="video-card-meta">
                        <span class="video-badge-pill">🎬 DOKUMENTASI VIDEO</span>
                        <span class="video-date-text">📅 ${escapeHTML(dateFormatted)}</span>
                    </div>
                    <h3 class="video-card-title">${escapeHTML(record.judul || 'Video Kegiatan')}</h3>
                    ${record.keterangan ? `
                        <p class="video-card-desc">${escapeHTML(record.keterangan)}</p>
                    ` : `
                        <p class="video-card-desc text-muted">Tidak ada keterangan tambahan.</p>
                    `}
                    <div class="video-card-actions-bar">
                        ${rawUrl ? `
                            <a href="${escapeHTML(rawUrl)}" target="_blank" rel="noopener noreferrer" class="btn-video-watch">
                                ▶ Buka Video
                            </a>
                            <button type="button" class="btn-video-copy-url" data-copy-url="${escapeHTML(rawUrl)}" title="Salin Tautan Video">
                                🔗 Salin Link
                            </button>
                        ` : ''}
                        ${canManageData() ? `
                            <div class="video-admin-actions">
                                <button type="button" class="btn-action-edit" data-sibaper-edit="${escapeHTML(record.id)}" title="Edit Data">✏ Edit</button>
                                <button type="button" class="btn-action-del" data-sibaper-delete="${escapeHTML(record.id)}" title="Hapus Data">🗑 Hapus</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;
    }

    /* =====================================================
       REGULASI CARD RENDERER
    ===================================================== */
    function renderRegulasiCard(record) {
        const fileName = record.dokumenName || record.fileName || (record.judul ? "Regulasi_" + record.judul.replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf" : "Regulasi_Pelayaran.pdf");
        const docSrc = record.dokumen || record.file || "";
        const dateFormatted = record.tanggal ? formatDateDisplay(record.tanggal) : "-";
        const noText = record.nomor ? `No. ${record.nomor}` : "Regulasi";
        const thnText = record.tahun ? `Tahun ${record.tahun}` : "";
        const nomThnBadge = [noText, thnText].filter(Boolean).join(" · ");

        return `
            <article class="sibaper-regulasi-card" id="regulasi-${escapeHTML(record.id)}" data-search-text="${escapeHTML((record.judul + ' ' + (record.nomor || '') + ' ' + (record.tahun || '') + ' ' + (record.keterangan || '')).toLowerCase())}">
                <div class="regulasi-card-top">
                    <div class="regulasi-card-badges">
                        <span class="regulasi-badge-type">📜 REGULASI PELAYARAN</span>
                        <span class="regulasi-badge-status">🟢 Berlaku / Sah</span>
                    </div>
                    <div class="regulasi-nomor-pill">
                        📌 ${escapeHTML(nomThnBadge)}
                    </div>
                </div>
                <div class="regulasi-card-body">
                    <h3 class="regulasi-card-title">${escapeHTML(record.judul || 'Peraturan Terkait Pelayaran')}</h3>
                    
                    <div class="regulasi-meta-grid">
                        <div class="reg-meta-item">
                            <span class="reg-meta-label">Nomor Regulasi</span>
                            <strong class="reg-meta-val">${escapeHTML(record.nomor || '-')}</strong>
                        </div>
                        <div class="reg-meta-item">
                            <span class="reg-meta-label">Tahun Terbit</span>
                            <strong class="reg-meta-val">${escapeHTML(record.tahun || '-')}</strong>
                        </div>
                        <div class="reg-meta-item">
                            <span class="reg-meta-label">Tanggal Penetapan</span>
                            <strong class="reg-meta-val">${escapeHTML(dateFormatted)}</strong>
                        </div>
                    </div>

                    ${record.keterangan ? `
                        <div class="regulasi-desc-box">
                            <span class="reg-desc-label">Ringkasan / Ketentuan Regulasi:</span>
                            <p class="reg-desc-text">${escapeHTML(record.keterangan)}</p>
                        </div>
                    ` : ''}

                    <div class="regulasi-file-strip">
                        <div class="reg-file-info">
                            <span class="reg-file-icon">📄</span>
                            <span class="reg-file-name" title="${escapeHTML(fileName)}">${escapeHTML(fileName)}</span>
                        </div>
                        
                        <div class="regulasi-btn-group">
                            <button 
                                type="button" 
                                class="btn-regulasi-dl sibaper-download-btn"
                                data-file-src="${escapeHTML(docSrc)}"
                                data-file-name="${escapeHTML(fileName)}"
                                data-file-desc="${escapeHTML(record.keterangan || '')}"
                            >
                                ⬇ Unduh Regulasi
                            </button>
                            ${docSrc ? `
                                <button 
                                    type="button" 
                                    class="btn-regulasi-prev" 
                                    data-preview-doc="${escapeHTML(docSrc)}" 
                                    data-preview-title="${escapeHTML(record.judul || 'Dokumen Regulasi')}"
                                >
                                    👁 Pratinjau
                                </button>
                            ` : ''}
                            ${canManageData() ? `
                                <button type="button" class="btn-action-edit" data-sibaper-edit="${escapeHTML(record.id)}" title="Edit Regulasi">✏ Edit</button>
                                <button type="button" class="btn-action-del" data-sibaper-delete="${escapeHTML(record.id)}" title="Hapus Regulasi">🗑 Hapus</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    /* =====================================================
       JUDUL CARD
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

            "Data"

        );

    }


    /* =====================================================
       RENDER CARD (GENERAL & ROUTING)
    ===================================================== */

    function renderRecord(
        page,
        record
    ) {

        if (page === "galeri-foto") {
            return renderFotoCard(record);
        }

        if (page === "galeri-video") {
            return renderVideoCard(record);
        }

        if (page === "galeri-regulasi") {
            return renderRegulasiCard(record);
        }

        const cfg =
            CONFIG[page];


        let details =
            "";


        cfg.fields.forEach(
            function(field) {

                const name =
                    field[0];

                const label =
                    field[1];

                const type =
                    field[2];


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
                            ${escapeHTML(label)}
                        </span>

                        <strong>
                            ${escapeHTML(
                                record[name]
                            )}
                        </strong>

                    </div>

                `;

            }
        );


        let media =
            "";


        if (
            [
                "struktur-2025",
                "struktur-2026",
                "struktur-2027"
            ].includes(page) &&
            record.file &&
            record.file.startsWith("data:image/")
        ) {

            media = `

                <img
                    class="sibaper-data-image"
                    src="${escapeHTML(record.file)}"
                    alt="${escapeHTML(
                        record.judul
                    )}"
                >

            `;

        }

        else if (
            [
                "struktur-2025",
                "struktur-2026",
                "struktur-2027"
            ].includes(page)
        ) {

            media = `

                <div class="sibaper-data-image-missing">
                    <strong>Gambar struktur belum tersedia</strong>
                    <span>Pilih Edit lalu unggah gambar struktur untuk menampilkannya.</span>
                </div>

            `;

        }

        else {

            media =
                getFileButton(
                    record
                );

            if (
                page === "realisasi-anggaran"
            ) {
                media += getSpreadsheetLink(record);
            }

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

                        ${escapeHTML(
                            page
                                .replace(
                                    /-/g,
                                    " "
                                )
                                .toUpperCase()
                        )}

                    </span>


                    <h3>

                        ${escapeHTML(
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

                    ${canManageData() ? `
                    <div
                        class="sibaper-data-actions"
                    >

                        <button
                            type="button"
                            data-sibaper-edit="${escapeHTML(
                                record.id
                            )}"
                        >

                            Edit

                        </button>


                        <button
                            type="button"
                            data-sibaper-delete="${escapeHTML(
                                record.id
                            )}"
                        >

                            Hapus

                        </button>

                    </div>
                    ` : ""}

                </div>

            </article>

        `;

    }


    /* =====================================================
       RENDER PAGE
    ===================================================== */

    function renderDataPage(
        page
    ) {

        if (
            page === "database-pelra" ||
            page === "database-bujang"
        ) {

            return;

        }

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


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "sibaper-data-render";


        if (
            data.length === 0
        ) {

            let emptyMsg = "Belum ada data dokumen yang tersimpan pada menu ini.";
            if (page === "galeri-foto") emptyMsg = "Belum ada dokumentasi foto yang diunggah. Klik tombol + Tambah Foto di atas untuk menambahkan foto.";
            if (page === "galeri-video") emptyMsg = "Belum ada video dokumentasi yang diinput. Klik tombol + Tambah Video di atas untuk menambahkan video.";
            if (page === "galeri-regulasi") emptyMsg = "Belum ada berkas regulasi pelayaran yang diinput. Klik tombol + Tambah Regulasi di atas untuk menambahkan regulasi.";

            wrapper.innerHTML = `

                <div
                    class="sibaper-data-empty"
                >

                    <div style="font-size: 38px; margin-bottom: 8px;">
                        ${page === 'galeri-foto' ? '📷' : page === 'galeri-video' ? '🎬' : page === 'galeri-regulasi' ? '📜' : '📂'}
                    </div>

                    <h3>
                        Belum ada data
                    </h3>

                    <p>
                        ${escapeHTML(emptyMsg)}
                    </p>

                </div>

            `;

        }

        else {

            const isGallery = ["galeri-foto", "galeri-video", "galeri-regulasi"].includes(page);
            let searchBarHTML = "";
            if (page === "galeri-regulasi" && data.length > 0) {
                searchBarHTML = `
                    <div class="sibaper-regulasi-search-wrap">
                        <input 
                            type="text" 
                            id="regulasiSearchInput" 
                            class="sibaper-regulasi-search-input" 
                            placeholder="🔍 Cari regulasi berdasarkan Nomor, Tahun, atau Judul..."
                        >
                    </div>
                `;
            }

            wrapper.innerHTML = `

                <div
                    class="sibaper-data-summary"
                >

                    <strong>
                        ${data.length}
                    </strong>

                    <span>
                        ${page === 'galeri-foto' ? 'foto tersimpan' : page === 'galeri-video' ? 'video tersimpan' : page === 'galeri-regulasi' ? 'regulasi tersimpan' : 'data tersimpan'}
                    </span>

                </div>

                ${searchBarHTML}

                <div
                    class="sibaper-data-grid ${isGallery ? 'gallery-grid' : ''}"
                    id="${page}-grid-container"
                >

                    ${data
                        .map(
                            function(record) {

                                return renderRecord(
                                    page,
                                    record
                                );

                            }
                        )
                        .join("")}

                </div>

            `;

        }


        container.appendChild(
            wrapper
        );


        const oldEmpty =
            container.querySelector(
                ".empty-content"
            );


        if (oldEmpty) {

            oldEmpty.style.display =
                "none";

        }

    }


    /* =====================================================
       LIGHTBOX / PREVIEW MODAL
    ===================================================== */

    function buildLightboxModal() {
        if (document.getElementById("sibaperLightboxModal")) return;

        const modal = document.createElement("div");
        modal.id = "sibaperLightboxModal";
        modal.className = "sibaper-lightbox-modal";
        modal.innerHTML = `
            <div class="sibaper-lightbox-backdrop" id="sibaperLightboxBackdrop"></div>
            <div class="sibaper-lightbox-dialog">
                <div class="sibaper-lightbox-header">
                    <h3 id="sibaperLightboxTitle" class="sibaper-lightbox-title">Pratinjau</h3>
                    <button type="button" class="sibaper-lightbox-close" id="sibaperLightboxClose" title="Tutup Pratinjau">✕</button>
                </div>
                <div class="sibaper-lightbox-body" id="sibaperLightboxBody">
                    <!-- Dynamic preview content -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector("#sibaperLightboxClose");
        const backdrop = modal.querySelector("#sibaperLightboxBackdrop");

        function closeLightbox() {
            modal.classList.remove("active");
            document.body.style.overflow = "";
            const body = document.getElementById("sibaperLightboxBody");
            if (body) body.innerHTML = "";
        }

        closeBtn.addEventListener("click", closeLightbox);
        backdrop.addEventListener("click", closeLightbox);
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    function openImagePreview(src, title) {
        buildLightboxModal();
        const modal = document.getElementById("sibaperLightboxModal");
        const titleEl = document.getElementById("sibaperLightboxTitle");
        const bodyEl = document.getElementById("sibaperLightboxBody");

        titleEl.textContent = title || "Pratinjau Foto Dokumentasi";
        bodyEl.innerHTML = `
            <div class="sibaper-lightbox-img-wrap">
                <img src="${escapeHTML(src)}" alt="${escapeHTML(title)}" class="sibaper-lightbox-img">
            </div>
            <div style="margin-top: 14px; text-align: center;">
                <a href="${escapeHTML(src)}" download="${escapeHTML((title || 'foto').replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg')}" class="btn-foto-download-full" style="display:inline-flex;width:auto;padding:8px 20px;">
                    ⬇ Unduh Foto Asli
                </a>
            </div>
        `;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }

    function openDocPreview(src, title) {
        if (!src) return;
        if (src.startsWith("http")) {
            window.open(src, "_blank", "noopener,noreferrer");
            return;
        }
        buildLightboxModal();
        const modal = document.getElementById("sibaperLightboxModal");
        const titleEl = document.getElementById("sibaperLightboxTitle");
        const bodyEl = document.getElementById("sibaperLightboxBody");

        titleEl.textContent = title || "Pratinjau Dokumen Regulasi";
        if (src.startsWith("data:application/pdf") || src.startsWith("data:text/")) {
            bodyEl.innerHTML = `
                <iframe src="${escapeHTML(src)}" class="sibaper-lightbox-iframe" title="Dokumen Preview"></iframe>
            `;
        } else {
            bodyEl.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #1e293b;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📄</div>
                    <h4 style="font-weight: 700; margin-bottom: 8px;">${escapeHTML(title || 'Dokumen Regulasi')}</h4>
                    <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">Dokumen siap untuk diunduh dan dibuka di perangkat Anda.</p>
                    <button type="button" class="btn-regulasi-dl sibaper-download-btn" data-file-src="${escapeHTML(src)}" data-file-name="${escapeHTML(title ? title + '.pdf' : 'regulasi.pdf')}" style="margin: 0 auto;">
                        ⬇ Unduh Dokumen Sekarang
                    </button>
                </div>
            `;
        }

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }


    /* =====================================================
       RENDER SEMUA
    ===================================================== */

    function renderAllData() {

        Object
            .keys(CONFIG)
            .forEach(
                function(page) {

                    renderDataPage(
                        page
                    );

                }
            );

    }


    /* =====================================================
       BUTTON TAMBAH / EDIT / HAPUS / INTERACTION
    ===================================================== */

    function bindDataButtons() {

        document.addEventListener(
            "click",
            function(event) {


                /* DOWNLOAD FILE */
                const dlBtn = event.target.closest(".sibaper-download-btn");
                if (dlBtn) {
                    event.preventDefault();
                    event.stopPropagation();
                    const src = dlBtn.dataset.fileSrc || "";
                    const name = dlBtn.dataset.fileName || "dokumen.pdf";
                    const desc = dlBtn.dataset.fileDesc || "";
                    downloadSibaperRecordFile(name, src, desc);
                    return;
                }

                /* PREVIEW IMAGE */
                const prevImgBtn = event.target.closest("[data-preview-img]");
                if (prevImgBtn) {
                    event.preventDefault();
                    event.stopPropagation();
                    const src = prevImgBtn.dataset.previewImg;
                    const title = prevImgBtn.dataset.previewTitle;
                    openImagePreview(src, title);
                    return;
                }

                /* PREVIEW DOC */
                const prevDocBtn = event.target.closest("[data-preview-doc]");
                if (prevDocBtn) {
                    event.preventDefault();
                    event.stopPropagation();
                    const src = prevDocBtn.dataset.previewDoc;
                    const title = prevDocBtn.dataset.previewTitle;
                    openDocPreview(src, title);
                    return;
                }

                /* COPY VIDEO LINK */
                const copyBtn = event.target.closest("[data-copy-url]");
                if (copyBtn) {
                    event.preventDefault();
                    event.stopPropagation();
                    const url = copyBtn.dataset.copyUrl;
                    if (url) {
                        navigator.clipboard.writeText(url).then(() => {
                            if (window.SibaperSheetsSync && window.SibaperSheetsSync.showToast) {
                                window.SibaperSheetsSync.showToast("Tautan video berhasil disalin ke clipboard!", "success");
                            } else {
                                alert("Tautan video berhasil disalin!");
                            }
                        }).catch(() => {
                            alert("Tautan video: " + url);
                        });
                    }
                    return;
                }

                /* TAMBAH */

                const addButton =
                    event.target.closest(
                        ".primary-action"
                    );


                if (addButton) {

                    const page =
                        addButton
                            .closest(
                                ".sibaper-page"
                            )
                            ?.dataset
                            .content;


                    if (
                        page &&
                        CONFIG[page]
                    ) {

                            if (!canManageData()) {
                                return;
                            }

                        event.preventDefault();


                        openDataModal(
                            page,
                            ""
                        );


                        return;

                    }

                }


                /* EDIT */

                const editButton =
                    event.target.closest(
                        "[data-sibaper-edit]"
                    );


                if (editButton) {

                    const page =
                        editButton
                            .closest(
                                ".sibaper-page"
                            )
                            ?.dataset
                            .content;


                    if (page) {

                            if (!canManageData()) {
                                return;
                            }

                        openDataModal(
                            page,
                            editButton
                                .dataset
                                .sibaperEdit
                        );

                    }


                    return;

                }


                /* HAPUS */

                const deleteButton =
                    event.target.closest(
                        "[data-sibaper-delete]"
                    );


                if (deleteButton) {

                    const page =
                        deleteButton
                            .closest(
                                ".sibaper-page"
                            )
                            ?.dataset
                            .content;


                    if (!page) {
                        return;
                    }

                        if (!canManageData()) {
                            return;
                        }


                    const data =
                        read(page);


                    const item =
                        data.find(
                            function(record) {

                                return (
                                    String(record.id) ===
                                    String(
                                        deleteButton
                                            .dataset
                                            .sibaperDelete
                                    )
                                );

                            }
                        );


                    if (!item) {
                        return;
                    }


                    if (
                        !confirm(
                            `Hapus "${recordTitle(
                                page,
                                item
                            )}"?`
                        )
                    ) {

                        return;

                    }


                    write(
                        page,
                        data.filter(
                            function(record) {

                                return (
                                    record.id !==
                                    item.id
                                );

                            }
                        )
                    );


                    renderDataPage(
                        page
                    );


                    alert(
                        "Data berhasil dihapus."
                    );

                }

            }
        );

        /* SEARCH FILTER REGULASI */
        document.addEventListener("input", function(e) {
            if (e.target && e.target.id === "regulasiSearchInput") {
                const query = e.target.value.toLowerCase().trim();
                const container = document.getElementById("galeri-regulasi-grid-container");
                if (!container) return;
                const cards = container.querySelectorAll(".sibaper-regulasi-card");
                cards.forEach(card => {
                    const searchData = card.getAttribute("data-search-text") || "";
                    if (!query || searchData.includes(query)) {
                        card.style.display = "";
                    } else {
                        card.style.display = "none";
                    }
                });
            }
        });

    }


    /* =====================================================
       INITIALIZE DATA
    ===================================================== */

    function initializeDataModule() {

        buildModal();

        bindDataButtons();

        renderAllData();


        document.addEventListener(
            "sibaperPageChanged",
            function(event) {

                const page =
                    event.detail?.page;


                if (
                    CONFIG[page]
                ) {

                    renderDataPage(
                        page
                    );

                }

            }
        );


        console.log(
            "SIBAPER Data Module berhasil dijalankan."
        );

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDataModule
        );

    }

    else {

        initializeDataModule();

    }

})();


/* =========================================================
   START APPLICATION
========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSibaperApp
    );

}

else {

    initializeSibaperApp();

}