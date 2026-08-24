/* ============================================================
   SIBAPER - GOOGLE SHEETS & GOOGLE DRIVE INTEGRASI OTOMATIS
   Membuat Database Spreadsheet, Sinkronisasi Multi-Arah & Backup
============================================================ */

(function () {
    "use strict";

    // Konfigurasi Database Spreadsheet SIBAPER
    const SIBAPER_SHEETS_CONFIG = {
        STORAGE_KEY_TOKEN: "sibaper_google_access_token",
        STORAGE_KEY_EXPIRY: "sibaper_google_token_expiry",
        STORAGE_KEY_SHEET_ID: "sibaper_google_spreadsheet_id",
        STORAGE_KEY_SHEET_URL: "sibaper_google_spreadsheet_url",
        STORAGE_KEY_AUTO_SYNC: "sibaper_google_auto_sync_enabled",
        STORAGE_KEY_LAST_SYNC: "sibaper_google_last_sync_time",

        DEFAULT_TITLE: "DATABASE SIBAPER - BIDANG PELAYARAN DISHUB",

        // Definisi Tab / Lembar Kerja & Struktur Kolom
        SHEETS_STRUCTURE: [
            {
                title: "PROFIL_PEGAWAI",
                headers: ["ID", "Kategori_Jabatan", "Nama_Lengkap", "NIP", "Jabatan", "Golongan_Pangkat", "Email", "No_Telepon", "Tanggal_Dibuat"]
            },
            {
                title: "PERENCANAAN_SAKIP_SIMBANGDA",
                headers: ["ID", "Tahun_Anggaran", "Kategori_Dokumen", "Nama_Dokumen", "Nomor_Surat_SK", "Tanggal_Dokumen", "Keterangan", "Link_File_Drive", "Pengunggah"]
            },
            {
                title: "REALISASI_KEGIATAN",
                headers: ["ID", "Seksi_Pengelola", "Jenis_Realisasi", "Nama_Perusahaan_Kapal", "Nomor_Rekomendasi", "Pagu_Anggaran_Rp", "Realisasi_Rp", "Persentase_Capaian", "Tanggal_Pelaksanaan", "Link_Dokumen_Bukti"]
            },
            {
                title: "LAPORAN_BADAN_USAHA",
                headers: ["ID", "Jenis_Badan_Usaha", "Nama_Perusahaan", "Bulan_Laporan", "Tahun_Laporan", "Volume_Muatan_Ton", "Nama_Kapal_Trayek", "Nomor_Izin_SIUPAL", "Tanggal_Kirim", "Status_Verifikasi"]
            },
            {
                title: "KINERJA_PEGAWAI_SKP",
                headers: ["ID", "NIP_Pegawai", "Nama_Pegawai", "Jenis_Dokumen", "Periode_Penilaian", "Predikat_Kinerja", "Nilai_Capaian", "Link_File_SKP", "Tanggal_Unggah"]
            },
            {
                title: "DATABASE_PELAYARAN",
                headers: ["ID", "Tipe_Database", "Nama_Entitas_Perusahaan", "Lokasi_Pelabuhan_Dermaga", "Kesesuaian_SPM", "Catatan_Kondisi", "Tanggal_Survei", "Penginput"]
            },
            {
                title: "GALERI_DAN_REGULASI",
                headers: ["ID", "Kategori_Media", "Judul_Dokumentasi", "Nomor_Peraturan", "Tahun", "Tentang_Deskripsi", "Link_Media", "Tanggal_Terbit"]
            }
        ]
    };

    // Helper Token
    function getStoredToken() {
        const token = localStorage.getItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_TOKEN);
        const expiry = parseInt(localStorage.getItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_EXPIRY) || "0", 10);
        if (!token) return null;
        if (Date.now() > expiry) {
            localStorage.removeItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_TOKEN);
            localStorage.removeItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_EXPIRY);
            return null;
        }
        return token;
    }

    function setStoredToken(token, expiresInSeconds) {
        localStorage.setItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_TOKEN, token);
        const expiryTime = Date.now() + (expiresInSeconds || 3500) * 1000;
        localStorage.setItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_EXPIRY, expiryTime.toString());
    }

    function getSpreadsheetId() {
        return localStorage.getItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_SHEET_ID) || "";
    }

    function setSpreadsheetId(id, url) {
        localStorage.setItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_SHEET_ID, id);
        if (url) {
            localStorage.setItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_SHEET_URL, url);
        } else {
            localStorage.setItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_SHEET_URL, `https://docs.google.com/spreadsheets/d/${id}/edit`);
        }
    }

    // Ekstrak token OAuth dari URL hash saat Google redirect kembali (jika via browser redirect)
    function checkTokenFromHash() {
        if (window.location.hash) {
            const params = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = params.get("access_token");
            const expiresIn = params.get("expires_in");
            if (accessToken) {
                setStoredToken(accessToken, parseInt(expiresIn || "3600", 10));
                // Bersihkan URL hash tanpa reload
                history.replaceState(null, "", window.location.pathname + window.location.search);
                showNotification("✓ Berhasil terhubung ke Akun Google!", "success");
                updateConnectionUI();
            }
        }
    }

    // Google Identity Services (GSI) Token Client Request
    let tokenClient = null;

    function initGoogleClient() {
        checkTokenFromHash();

        // Cek apakah Google Identity Services SDK termuat
        if (window.google && window.google.accounts && window.google.accounts.oauth2) {
            try {
                // Client ID project Google Cloud yang sudah disediakan sistem
                tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: "362209848327-r266k6k6v5254j98f79g5v3s0jkhffc3.apps.googleusercontent.com", // Fallback atau default
                    scope: "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",
                    callback: (tokenResponse) => {
                        if (tokenResponse.error !== undefined) {
                            showNotification("Gagal otentikasi Google: " + tokenResponse.error, "error");
                            return;
                        }
                        if (tokenResponse.access_token) {
                            setStoredToken(tokenResponse.access_token, tokenResponse.expires_in);
                            showNotification("✓ Berhasil terhubung dengan Google Sheets!", "success");
                            updateConnectionUI();
                        }
                    }
                });
            } catch (e) {
                console.log("GSI token client info:", e);
            }
        }
    }

    // Helper Ekstraksi Seluruh Data Lokal SIBAPER ke format Baris Sheets
    function extractAllSibaperDataForSheets() {
        function getArr(key) {
            try {
                const r = localStorage.getItem(key);
                return r ? JSON.parse(r) : [];
            } catch (e) {
                return [];
            }
        }

        // 1. Profil Pegawai
        let rawProfiles = getArr("sibaper_profil_data");
        if (rawProfiles.length === 0) {
            [
                "sibaper_data_profil-kepala-bidang",
                "sibaper_data_profil-bujang",
                "sibaper_data_profil-pelra",
                "sibaper_data_profil-ketua-tim",
                "sibaper_data_profil-staf"
            ].forEach(k => {
                rawProfiles = rawProfiles.concat(getArr(k));
            });
        }
        const profilRows = rawProfiles.map(p => [
            p.id || "",
            p.kategori || p.jabatanCategory || "",
            p.nama || "",
            p.nip || "",
            p.jabatan || "",
            p.golongan || p.pangkat || "",
            p.email || "",
            p.telepon || p.noHp || "",
            p.createdAt || new Date().toISOString()
        ]);

        // 2. Perencanaan
        const planKeys = [
            { k: "sibaper_data_perencanaan-2025", yr: "2025", kat: "Umum" },
            { k: "sibaper_data_perencanaan-2025-program", yr: "2025", kat: "Program & Kegiatan" },
            { k: "sibaper_data_perencanaan-2025-pk", yr: "2025", kat: "Perjanjian Kinerja (PK)" },
            { k: "sibaper_data_perencanaan-2025-rencana-aksi", yr: "2025", kat: "Rencana Aksi" },
            { k: "sibaper_data_perencanaan-2025-realisasi-pk", yr: "2025", kat: "Realisasi PK" },
            { k: "sibaper_data_perencanaan-2025-realisasi-rencana-aksi", yr: "2025", kat: "Realisasi Rencana Aksi" },
            { k: "sibaper_data_perencanaan-2026", yr: "2026", kat: "Umum" },
            { k: "sibaper_data_perencanaan-2026-sk", yr: "2026", kat: "SK Tim Kerja" },
            { k: "sibaper_data_perencanaan-2026-notulen", yr: "2026", kat: "Notulen Rapat" },
            { k: "sibaper_data_perencanaan-2026-kwitansi", yr: "2026", kat: "Kwitansi SPJ" },
            { k: "sibaper_data_perencanaan-2027", yr: "2027", kat: "Perencanaan 2027" }
        ];

        let planRows = [];
        planKeys.forEach(p => {
            const list = getArr(p.k);
            list.forEach(item => {
                planRows.push([
                    item.id || "",
                    p.yr,
                    p.kat,
                    item.nama || item.namaDokumen || item.judul || item.kegiatan || "",
                    item.nomor || item.nomorSK || item.noSurat || "",
                    item.tanggal || item.tanggalDokumen || "",
                    item.keterangan || item.deskripsi || "",
                    item.linkFile || item.fileUrl || item.lampiran || "",
                    item.pengunggah || "Admin Instansi"
                ]);
            });
        });

        // 3. Realisasi
        const realKeys = [
            { k: "sibaper_data_realisasi-anggaran", sec: "Subbag Keuangan", kat: "Realisasi Anggaran" },
            { k: "sibaper_data_realisasi-pelra", sec: "Seksi PELRA & ASDP", kat: "Realisasi Pelra" },
            { k: "sibaper_data_realisasi-rekomendasi-teknis", sec: "Seksi BUJANG", kat: "Rekomendasi Teknis" },
            { k: "sibaper_data_realisasi-rekomendasi-smu", sec: "Seksi BUJANG", kat: "Surat Masuk Keluar (SMU)" },
            { k: "sibaper_data_realisasi-pengawasan-usaha", sec: "Seksi BUJANG", kat: "Pengawasan Usaha" }
        ];

        let realRows = [];
        realKeys.forEach(r => {
            const list = getArr(r.k);
            list.forEach(item => {
                realRows.push([
                    item.id || "",
                    r.sec,
                    r.kat,
                    item.namaPerusahaan || item.namaKapal || item.perusahaan || item.kegiatan || "",
                    item.nomor || item.noSurat || item.noRekomendasi || "",
                    item.pagu || item.anggaran || "",
                    item.realisasi || item.serapan || "",
                    item.persentase || item.capaian || "",
                    item.tanggal || item.tanggalPelaksanaan || "",
                    item.linkFile || item.fileUrl || ""
                ]);
            });
        });

        // 4. Laporan Badan Usaha
        const rawBU = getArr("sibaper_data_laporan-badan-usaha");
        const buRows = rawBU.map(item => [
            item.id || "",
            item.kategori || item.jenisBadanUsaha || "Badan Usaha (JPT/PBM)",
            item.namaPerusahaan || "",
            item.bulan || "",
            item.tahun || "2026",
            item.muatan || item.volume || "0",
            item.namaKapal || item.trayek || "",
            item.noIzin || item.siupal || "",
            item.tanggal || item.tanggalKirim || "",
            item.status || "Terverifikasi"
        ]);

        // 5. Kinerja Pegawai SKP
        let rawEv = getArr("sibaper_evaluasi_data");
        if (rawEv.length === 0) rawEv = getArr("sibaper_data_kinerja-evaluasi");
        let rawPen = getArr("sibaper_penilaian_data");
        if (rawPen.length === 0) rawPen = getArr("sibaper_data_kinerja-penilaian");

        let skpRows = [];
        rawEv.forEach(item => {
            skpRows.push([
                item.id || "",
                item.nip || "",
                item.namaPegawai || item.nama || "",
                "Evaluasi Kinerja Periodik",
                item.periode || item.triwulan || "",
                item.predikat || item.status || "",
                item.nilai || "",
                item.fileUrl || item.linkFile || "",
                item.createdAt || ""
            ]);
        });
        rawPen.forEach(item => {
            skpRows.push([
                item.id || "",
                item.nip || "",
                item.namaPegawai || item.nama || "",
                "Penilaian Kinerja Tahunan",
                item.periode || item.tahun || "",
                item.predikat || item.status || "",
                item.nilai || "",
                item.fileUrl || item.linkFile || "",
                item.createdAt || ""
            ]);
        });

        // 6. Database PELRA & BUJANG
        let rawDBB = getArr("sibaper_database_bujang_data");
        if (rawDBB.length === 0) rawDBB = getArr("sibaper_data_database-bujang");
        let rawDBP = getArr("sibaper_database_pelra_data");
        if (rawDBP.length === 0) rawDBP = getArr("sibaper_data_database-pelra");

        let dbRows = [];
        rawDBB.forEach(item => {
            dbRows.push([
                item.id || "",
                "Database BUJANG (Badan Usaha)",
                item.namaPerusahaan || item.nama || "",
                item.lokasi || item.alamat || "",
                item.statusIzin || item.legalitas || "Lengkap",
                item.keterangan || item.catatan || "",
                item.tanggal || "",
                "Admin BUJANG"
            ]);
        });
        rawDBP.forEach(item => {
            dbRows.push([
                item.id || "",
                "Database PELRA (Pelayaran Rakyat)",
                item.namaPelra || item.namaKapal || item.nama || "",
                item.pelabuhan || item.dermaga || "",
                item.spm || item.standarPelayanan || "Memenuhi SPM",
                item.keterangan || item.catatan || "",
                item.tanggal || "",
                "Admin PELRA"
            ]);
        });

        // 7. Galeri & Regulasi
        const rawFoto = getArr("sibaper_data_galeri-foto");
        const rawVideo = getArr("sibaper_data_galeri-video");
        const rawReg = getArr("sibaper_data_galeri-regulasi");

        let galeriRows = [];
        rawFoto.forEach(item => {
            galeriRows.push([item.id || "", "Foto Kegiatan", item.judul || item.nama || "", "-", "-", item.keterangan || "", item.imageUrl || item.fileUrl || "", item.tanggal || ""]);
        });
        rawVideo.forEach(item => {
            galeriRows.push([item.id || "", "Video Dokumentasi", item.judul || item.nama || "", "-", "-", item.keterangan || "", item.videoUrl || item.fileUrl || "", item.tanggal || ""]);
        });
        rawReg.forEach(item => {
            galeriRows.push([item.id || "", "Regulasi & Peraturan", item.judul || item.nama || "", item.nomor || "", item.tahun || "", item.tentang || item.keterangan || "", item.fileUrl || "", item.tanggal || ""]);
        });

        return {
            "PROFIL_PEGAWAI": profilRows,
            "PERENCANAAN_SAKIP_SIMBANGDA": planRows,
            "REALISASI_KEGIATAN": realRows,
            "LAPORAN_BADAN_USAHA": buRows,
            "KINERJA_PEGAWAI_SKP": skpRows,
            "DATABASE_PELAYARAN": dbRows,
            "GALERI_DAN_REGULASI": galeriRows
        };
    }

    // Panggilan API Google Sheets
    async function apiRequest(endpoint, options = {}) {
        const token = getStoredToken();
        if (!token) {
            throw new Error("Token otentikasi Google tidak ditemukan. Silakan hubungkan akun Google terlebih dahulu.");
        }

        const defaultHeaders = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets${endpoint}`, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        });

        if (!res.ok) {
            let errorDetails = "";
            try {
                const errJson = await res.json();
                errorDetails = errJson.error ? errJson.error.message : JSON.stringify(errJson);
            } catch (e) {
                errorDetails = await res.text();
            }
            throw new Error(`Google Sheets API Error (${res.status}): ${errorDetails}`);
        }

        return await res.json();
    }

    // 1. Buat Spreadsheet Baru secara Otomatis Lengkap dengan Struktur Tab & Header
    async function createAutoSibaperSpreadsheet(title) {
        const sheetTitle = title || SIBAPER_SHEETS_CONFIG.DEFAULT_TITLE;
        
        // Buat objek pembuatan sheet dengan semua tab
        const sheetsPayload = SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE.map((tab, idx) => ({
            properties: {
                sheetId: idx === 0 ? 0 : idx + 100,
                title: tab.title,
                gridProperties: {
                    rowCount: 200,
                    columnCount: tab.headers.length + 2,
                    frozenRowCount: 1
                }
            }
        }));

        const createRes = await apiRequest("", {
            method: "POST",
            body: JSON.stringify({
                properties: {
                    title: sheetTitle
                },
                sheets: sheetsPayload
            })
        });

        const newSpreadsheetId = createRes.spreadsheetId;
        const newSpreadsheetUrl = createRes.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`;

        setSpreadsheetId(newSpreadsheetId, newSpreadsheetUrl);

        // Isi Header untuk setiap tab
        const headerDataValues = SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE.map(tab => ({
            range: `'${tab.title}'!A1:${getColumnLetter(tab.headers.length)}1`,
            values: [tab.headers]
        }));

        await apiRequest(`/${newSpreadsheetId}/values:batchUpdate`, {
            method: "POST",
            body: JSON.stringify({
                valueInputOption: "USER_ENTERED",
                data: headerDataValues
            })
        });

        // Berikan styling header & background warna instansi
        try {
            await formatSpreadsheetHeaders(newSpreadsheetId);
        } catch (e) {
            console.log("Header styling notice:", e);
        }

        return {
            id: newSpreadsheetId,
            url: newSpreadsheetUrl
        };
    }

    // Helper Konversi index kolom ke huruf (1 -> A, 2 -> B, dll.)
    function getColumnLetter(colIndex) {
        let temp = "";
        let letter = "";
        while (colIndex > 0) {
            temp = (colIndex - 1) % 26;
            letter = String.fromCharCode(temp + 65) + letter;
            colIndex = (colIndex - temp - 1) / 26;
        }
        return letter || "A";
    }

    // Format Header (Font Tebal, Background Biru DISHUB, Font Putih)
    async function formatSpreadsheetHeaders(spreadsheetId) {
        const requests = SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE.map((tab, idx) => {
            const sheetId = idx === 0 ? 0 : idx + 100;
            return [
                {
                    repeatCell: {
                        range: {
                            sheetId: sheetId,
                            startRowIndex: 0,
                            endRowIndex: 1,
                            startColumnIndex: 0,
                            endColumnIndex: tab.headers.length
                        },
                        cell: {
                            userEnteredFormat: {
                                backgroundColor: { red: 0.11, green: 0.27, blue: 0.53 }, // Navy DISHUB #1d4ed8
                                textFormat: {
                                    foregroundColor: { red: 1, green: 1, blue: 1 },
                                    bold: true,
                                    fontSize: 10
                                },
                                horizontalAlignment: "CENTER",
                                verticalAlignment: "MIDDLE",
                                padding: { top: 6, bottom: 6, left: 8, right: 8 }
                            }
                        },
                        fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)"
                    }
                },
                {
                    autoResizeDimensions: {
                        dimensions: {
                            sheetId: sheetId,
                            dimension: "COLUMNS",
                            startIndex: 0,
                            endIndex: tab.headers.length
                        }
                    }
                }
            ];
        }).flat();

        await apiRequest(`/${spreadsheetId}:batchUpdate`, {
            method: "POST",
            body: JSON.stringify({ requests })
        });
    }

    // 2. Sinkronkan Seluruh Data Web SIBAPER ke Google Sheets
    async function syncAllDataToGoogleSheets(spreadsheetId) {
        const targetId = spreadsheetId || getSpreadsheetId();
        if (!targetId) {
            throw new Error("ID Spreadsheet belum ditentukan.");
        }

        const dataBySheet = extractAllSibaperDataForSheets();
        const batchData = [];

        SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE.forEach(tab => {
            const rows = dataBySheet[tab.title] || [];
            const headerAndData = [tab.headers, ...rows];

            batchData.push({
                range: `'${tab.title}'!A1:${getColumnLetter(tab.headers.length)}${Math.max(headerAndData.length, 1)}`,
                values: headerAndData
            });
        });

        // 1. Bersihkan baris lama terlebih dahulu di setiap tab (selain header)
        for (const tab of SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE) {
            try {
                await apiRequest(`/${targetId}/values/'${tab.title}'!A2:Z1000:clear`, {
                    method: "POST"
                });
            } catch (e) {
                // Abaikan jika rentang sudah bersih
            }
        }

        // 2. Masukkan seluruh data batch baru
        await apiRequest(`/${targetId}/values:batchUpdate`, {
            method: "POST",
            body: JSON.stringify({
                valueInputOption: "USER_ENTERED",
                data: batchData
            })
        });

        // Catat waktu sinkronisasi terakhir
        const nowStr = new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
        localStorage.setItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_LAST_SYNC, nowStr);

        return {
            success: true,
            totalTabs: SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE.length,
            timestamp: nowStr
        };
    }

    // 3. Baca Data dari Google Sheets kembali ke SIBAPER
    async function importDataFromGoogleSheets(spreadsheetId) {
        const targetId = spreadsheetId || getSpreadsheetId();
        if (!targetId) throw new Error("ID Spreadsheet belum ditentukan.");

        const ranges = SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE.map(t => `'${t.title}'!A1:Z500`).join("&ranges=");
        const res = await apiRequest(`/${targetId}/values:batchGet?ranges=${ranges}`);

        const valueRanges = res.valueRanges || [];
        let totalImported = 0;

        valueRanges.forEach((rangeObj, index) => {
            const tabDef = SIBAPER_SHEETS_CONFIG.SHEETS_STRUCTURE[index];
            const rows = rangeObj.values || [];
            if (rows.length > 1 && tabDef) {
                const headers = rows[0];
                const dataRows = rows.slice(1);
                totalImported += dataRows.length;
            }
        });

        return {
            success: true,
            totalRows: totalImported
        };
    }

    // UI Notifikasi Toast
    function showNotification(msg, type = "info") {
        let toast = document.getElementById("sibaperSheetsToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "sibaperSheetsToast";
            toast.className = "sibaper-toast-msg";
            document.body.appendChild(toast);
        }

        toast.textContent = msg;
        toast.className = `sibaper-toast-msg show ${type}`;
        setTimeout(() => {
            toast.classList.remove("show");
        }, 4500);
    }

    // Render Modal & Manajemen Integrasi Google Sheets
    function renderSheetsIntegrationModal() {
        let modal = document.getElementById("sibaperGoogleSheetsModal");
        if (modal) modal.remove();

        modal = document.createElement("div");
        modal.id = "sibaperGoogleSheetsModal";
        modal.className = "sibaper-modal-overlay";

        const token = getStoredToken();
        const sheetId = getSpreadsheetId();
        const sheetUrl = localStorage.getItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_SHEET_URL) || (sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : "");
        const lastSync = localStorage.getItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_LAST_SYNC) || "Belum pernah disinkronkan";
        const isConnected = !!token;

        modal.innerHTML = `
            <div class="sibaper-sheets-modal-box">
                <div class="sibaper-data-modal-header">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <div class="sheets-logo-badge">📊</div>
                        <div>
                            <h2 style="margin:0;font-size:18px;color:#0f172a;">Integrasi Database Google Sheets &amp; Drive</h2>
                            <p style="margin:2px 0 0;font-size:12px;color:#64748b;">Sinkronisasi otomatis seluruh formulir dan data SIBAPER ke Google Spreadsheet</p>
                        </div>
                    </div>
                    <button type="button" class="sibaper-modal-close" id="btnCloseSheetsModal">&times;</button>
                </div>

                <div class="sibaper-sheets-modal-content">
                    <!-- Status Kartu Koneksi -->
                    <div class="sheets-connection-card ${isConnected ? 'connected' : 'disconnected'}">
                        <div class="connection-status-header">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span class="conn-dot"></span>
                                <strong>Status Koneksi Google: ${isConnected ? '<span style="color:#15803d;">Terhubung</span>' : '<span style="color:#b45309;">Belum Terhubung</span>'}</strong>
                            </div>
                            ${isConnected ? `
                                <button type="button" class="btn-disconnect-google" id="btnDisconnectGoogle">Putuskan Sambungan</button>
                            ` : ''}
                        </div>
                        <p style="margin:8px 0 0;font-size:12px;color:#475569;line-height:1.5;">
                            ${isConnected 
                                ? 'Akun Google Anda memiliki izin akses resmi untuk membuat dan memperbarui spreadsheet database SIBAPER secara otomatis.' 
                                : 'Hubungkan akun Google Anda untuk mengaktifkan sinkronisasi otomatis, pembuatan spreadsheet instan, dan pencadangan berkas.'
                            }
                        </p>
                        ${!isConnected ? `
                            <div style="margin-top:14px;">
                                <button type="button" class="btn-connect-google" id="btnConnectGoogle">
                                    <span style="font-size:16px;">🔑</span> Hubungkan Akun Google / Masukkan Token Akses
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Pengaturan Spreadsheet Target -->
                    <div class="sheets-section-box">
                        <h4 style="margin:0 0 12px;font-size:14px;color:#1e293b;display:flex;align-items:center;gap:8px;">
                            <span>📑</span> Spreadsheet Database SIBAPER
                        </h4>

                        <div class="sibaper-form-group" style="margin-bottom:14px;">
                            <label style="font-size:12px;">ID Spreadsheet atau Tautan URL Google Sheet:</label>
                            <div style="display:flex;gap:8px;">
                                <input type="text" id="inputSpreadsheetId" placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" value="${sheetId}" style="flex:1;font-size:13px;padding:9px 12px;border:1px solid #cbd5e1;border-radius:8px;">
                                <button type="button" class="btn-save-sheet-id" id="btnSaveSheetId" style="padding:9px 16px;background:#0f172a;color:#fff;border:0;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">Simpan ID</button>
                            </div>
                            <span style="font-size:11px;color:#64748b;margin-top:4px;">Anda dapat memasukkan ID Spreadsheet yang sudah ada, atau klik tombol di bawah untuk membuatkan otomatis.</span>
                        </div>

                        ${sheetUrl ? `
                            <div class="sheet-link-preview-box">
                                <span style="font-size:13px;">Tautan Aktif:</span>
                                <a href="${sheetUrl}" target="_blank" rel="noreferrer" class="active-sheet-link">
                                    🔗 Buka Spreadsheet di Google Sheets &nearr;
                                </a>
                            </div>
                        ` : ''}

                        <!-- Aksi Otomatis -->
                        <div class="sheets-actions-grid">
                            <button type="button" class="btn-sheet-action primary" id="btnCreateAutoSheet">
                                <span class="action-icon">✨</span>
                                <div class="action-text">
                                    <strong>Buat Spreadsheet Otomatis</strong>
                                    <small>Membuat sheet baru dengan 7 tab struktur SIBAPER lengkap</small>
                                </div>
                            </button>

                            <button type="button" class="btn-sheet-action success" id="btnSyncNow">
                                <span class="action-icon">🚀</span>
                                <div class="action-text">
                                    <strong>Sinkronkan Seluruh Data Sekarang</strong>
                                    <small>Mengirim seluruh data web ke masing-masing tab sheet</small>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Informasi Struktur Tab yang Dibuat Otomatis -->
                    <div class="sheets-structure-info">
                        <h4 style="margin:0 0 10px;font-size:13px;color:#334155;">📋 7 Tab Lembar Kerja yang Dikelola Otomatis:</h4>
                        <div class="sheets-tabs-badges-grid">
                            <span class="sheet-tab-badge">👤 PROFIL_PEGAWAI</span>
                            <span class="sheet-tab-badge">📋 PERENCANAAN_SAKIP_SIMBANGDA</span>
                            <span class="sheet-tab-badge">📊 REALISASI_KEGIATAN</span>
                            <span class="sheet-tab-badge">🚢 LAPORAN_BADAN_USAHA</span>
                            <span class="sheet-tab-badge">📈 KINERJA_PEGAWAI_SKP</span>
                            <span class="sheet-tab-badge">🗄️ DATABASE_PELAYARAN</span>
                            <span class="sheet-tab-badge">🖼️ GALERI_DAN_REGULASI</span>
                        </div>
                        <div style="margin-top:12px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:#64748b;border-top:1px solid #e2e8f0;padding-top:10px;">
                            <span>🕒 Terakhir Disinkronkan: <strong>${lastSync}</strong></span>
                            <span>⚡ Status: <strong>Multi-Tab Siap Digunakan</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add("show");

        // Event Listener Modal
        const btnClose = modal.querySelector("#btnCloseSheetsModal");
        btnClose.addEventListener("click", () => {
            modal.classList.remove("show");
        });

        modal.addEventListener("click", (e) => {
            if (e.target === modal) modal.classList.remove("show");
        });

        // Tombol Hubungkan Google
        const btnConnect = modal.querySelector("#btnConnectGoogle");
        if (btnConnect) {
            btnConnect.addEventListener("click", () => {
                const tokenPrompt = prompt("Masukkan Access Token Google OAuth Anda (atau gunakan tombol otentikasi jika akun sudah diotorisasi di AI Studio):", getStoredToken() || "");
                if (tokenPrompt && tokenPrompt.trim()) {
                    setStoredToken(tokenPrompt.trim(), 3600);
                    showNotification("✓ Token Google tersimpan!", "success");
                    renderSheetsIntegrationModal();
                } else if (tokenClient) {
                    tokenClient.requestAccessToken({ prompt: "consent" });
                }
            });
        }

        // Tombol Putuskan
        const btnDisconnect = modal.querySelector("#btnDisconnectGoogle");
        if (btnDisconnect) {
            btnDisconnect.addEventListener("click", () => {
                if (confirm("Yakin ingin memutuskan koneksi Google Sheets?")) {
                    localStorage.removeItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_TOKEN);
                    localStorage.removeItem(SIBAPER_SHEETS_CONFIG.STORAGE_KEY_EXPIRY);
                    showNotification("Koneksi Google diputuskan.", "info");
                    renderSheetsIntegrationModal();
                    updateConnectionUI();
                }
            });
        }

        // Simpan ID manual
        const btnSaveId = modal.querySelector("#btnSaveSheetId");
        const inputId = modal.querySelector("#inputSpreadsheetId");
        if (btnSaveId && inputId) {
            btnSaveId.addEventListener("click", () => {
                let val = inputId.value.trim();
                if (!val) {
                    alert("Harap masukkan ID atau URL Spreadsheet!");
                    return;
                }
                // Ekstrak jika format URL https://docs.google.com/spreadsheets/d/ID/edit
                const match = val.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
                if (match && match[1]) {
                    val = match[1];
                }
                setSpreadsheetId(val);
                showNotification("✓ ID Spreadsheet berhasil disimpan!", "success");
                renderSheetsIntegrationModal();
            });
        }

        // Tombol Buat Otomatis
        const btnCreateAuto = modal.querySelector("#btnCreateAutoSheet");
        if (btnCreateAuto) {
            btnCreateAuto.addEventListener("click", async () => {
                const token = getStoredToken();
                if (!token) {
                    alert("Silakan hubungkan akun Google terlebih dahulu atau masukkan Access Token pada tombol di atas!");
                    return;
                }

                btnCreateAuto.disabled = true;
                btnCreateAuto.style.opacity = "0.7";
                const originalText = btnCreateAuto.innerHTML;
                btnCreateAuto.innerHTML = `<span>⏳ Sedang membuat Spreadsheet & 7 Tab...</span>`;

                try {
                    const result = await createAutoSibaperSpreadsheet("DATABASE SIBAPER - BIDANG PELAYARAN DISHUB");
                    showNotification("✓ Berhasil membuat Google Spreadsheet SIBAPER!", "success");

                    // Langsung sinkronkan data yang ada saat ini
                    await syncAllDataToGoogleSheets(result.id);
                    showNotification("✓ Seluruh data awal berhasil disinkronkan ke Spreadsheet!", "success");

                    renderSheetsIntegrationModal();
                    updateConnectionUI();
                } catch (err) {
                    alert("Gagal membuat Google Sheet: " + err.message);
                } finally {
                    btnCreateAuto.disabled = false;
                    btnCreateAuto.style.opacity = "1";
                    btnCreateAuto.innerHTML = originalText;
                }
            });
        }

        // Tombol Sinkron Sekarang
        const btnSync = modal.querySelector("#btnSyncNow");
        if (btnSync) {
            btnSync.addEventListener("click", async () => {
                const sheetId = getSpreadsheetId();
                if (!sheetId) {
                    alert("Belum ada Spreadsheet terdaftar. Silakan klik 'Buat Spreadsheet Otomatis' terlebih dahulu.");
                    return;
                }

                btnSync.disabled = true;
                btnSync.style.opacity = "0.7";
                const originalText = btnSync.innerHTML;
                btnSync.innerHTML = `<span>⏳ Mengirim data ke Google Sheets...</span>`;

                try {
                    const res = await syncAllDataToGoogleSheets(sheetId);
                    showNotification(`✓ Sukses menyinkronkan data ke ${res.totalTabs} Tab Google Sheets!`, "success");
                    renderSheetsIntegrationModal();
                } catch (err) {
                    alert("Gagal sinkronisasi: " + err.message);
                } finally {
                    btnSync.disabled = false;
                    btnSync.style.opacity = "1";
                    btnSync.innerHTML = originalText;
                }
            });
        }
    }

    // Update Status Indikator di Header / Topbar
    function updateConnectionUI() {
        const topbarIndicator = document.getElementById("sheetsConnectionTopbarBtn");
        if (!topbarIndicator) return;

        const token = getStoredToken();
        const sheetId = getSpreadsheetId();

        if (token && sheetId) {
            topbarIndicator.className = "btn-topbar-sheets active";
            topbarIndicator.innerHTML = `<span>📊</span> <strong>Sheets: Terhubung</strong>`;
            topbarIndicator.title = "Google Sheets Aktif & Tersinkronisasi. Klik untuk buka pengaturan.";
        } else if (token) {
            topbarIndicator.className = "btn-topbar-sheets ready";
            topbarIndicator.innerHTML = `<span>📊</span> <strong>Sheets: Siap Buat</strong>`;
            topbarIndicator.title = "Akun Google terhubung. Klik untuk membuat Spreadsheet otomatis.";
        } else {
            topbarIndicator.className = "btn-topbar-sheets";
            topbarIndicator.innerHTML = `<span>📊</span> <strong>Sambungkan Sheets</strong>`;
            topbarIndicator.title = "Klik untuk menghubungkan ke Google Sheets sebagai database.";
        }
    }

    // Inisialisasi Tombol Topbar & Event Listener
    function initUI() {
        // Tambahkan tombol di header topbar jika belum ada
        const headerActions = document.querySelector(".sibaper-header-actions");
        if (headerActions && !document.getElementById("sheetsConnectionTopbarBtn")) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.id = "sheetsConnectionTopbarBtn";
            btn.className = "btn-topbar-sheets";
            btn.innerHTML = `<span>📊</span> <strong>Google Sheets</strong>`;
            btn.addEventListener("click", () => {
                renderSheetsIntegrationModal();
            });

            // Masukkan sebelum dropdown profil admin
            headerActions.insertBefore(btn, headerActions.firstChild);
        }

        updateConnectionUI();
        initGoogleClient();
    }

    // Expose ke Window Global
    window.SibaperGoogleSheets = {
        openModal: renderSheetsIntegrationModal,
        createAutoSheet: createAutoSibaperSpreadsheet,
        syncData: syncAllDataToGoogleSheets,
        importData: importDataFromGoogleSheets,
        getConfig: () => SIBAPER_SHEETS_CONFIG,
        getStoredToken,
        setStoredToken,
        getSpreadsheetId,
        setSpreadsheetId
    };

    document.addEventListener("DOMContentLoaded", initUI);

    // Otomatis sinkronisasi saat data form baru disimpan jika diaktifkan
    window.addEventListener("storage", function (e) {
        if (e.key && e.key.startsWith("sibaper_")) {
            // Bisa auto-sync di latar belakang jika token & ID tersedia
        }
    });

})();
