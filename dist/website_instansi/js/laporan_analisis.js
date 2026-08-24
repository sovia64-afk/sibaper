/* ============================================================
   SIBAPER - MODUL LAPORAN ANALISIS & GRAFIK VISUALISASI
   Renderer grafik interaktif dan visualisasi data multi-modul
   (Selalu tampil visual diagram dengan pembacaan real-time)
============================================================ */

(function () {
    "use strict";

    // 12 Bulan Standar untuk visualisasi tren tahunan
    const STANDARD_MONTHS = [
        { key: "Jan", label: "Januari", aliases: ["januari", "jan", "1", "01", "january"] },
        { key: "Feb", label: "Februari", aliases: ["februari", "feb", "2", "02", "february"] },
        { key: "Mar", label: "Maret", aliases: ["maret", "mar", "3", "03", "march"] },
        { key: "Apr", label: "April", aliases: ["april", "apr", "4", "04"] },
        { key: "Mei", label: "Mei", aliases: ["mei", "may", "5", "05"] },
        { key: "Jun", label: "Juni", aliases: ["juni", "jun", "6", "06", "june"] },
        { key: "Jul", label: "Juli", aliases: ["juli", "jul", "7", "07", "july"] },
        { key: "Ags", label: "Agustus", aliases: ["agustus", "ags", "agu", "aug", "8", "08", "august"] },
        { key: "Sep", label: "September", aliases: ["september", "sep", "9", "09"] },
        { key: "Okt", label: "Oktober", aliases: ["oktober", "okt", "oct", "10", "october"] },
        { key: "Nov", label: "November", aliases: ["november", "nov", "11"] },
        { key: "Des", label: "Desember", aliases: ["desember", "des", "dec", "12", "december"] }
    ];

    function normalizeMonth(rawMonth) {
        if (!rawMonth) return null;
        const cleaned = String(rawMonth).trim().toLowerCase();
        for (const m of STANDARD_MONTHS) {
            if (m.aliases.some(alias => cleaned === alias || cleaned.includes(alias))) {
                return m.key;
            }
        }
        return null;
    }

    // Helper pembacaan data universal
    function getStoredData(key) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    // Mengumpulkan seluruh dataset SIBAPER
    function collectAllSibaperMetrics() {
        // 1. Profil Pegawai
        let profiles = getStoredData("sibaper_profil_data");
        if (profiles.length === 0) {
            [
                "sibaper_data_profil-kepala-bidang",
                "sibaper_data_profil-bujang",
                "sibaper_data_profil-pelra",
                "sibaper_data_profil-ketua-tim",
                "sibaper_data_profil-staf"
            ].forEach(k => {
                profiles = profiles.concat(getStoredData(k));
            });
        }

        // 2. Perencanaan (SAKIP & SIMBANGDA)
        const plan2025Keys = [
            "sibaper_data_perencanaan-2025",
            "sibaper_data_perencanaan-2025-program",
            "sibaper_data_perencanaan-2025-pk",
            "sibaper_data_perencanaan-2025-rencana-aksi",
            "sibaper_data_perencanaan-2025-realisasi-pk",
            "sibaper_data_perencanaan-2025-realisasi-rencana-aksi"
        ];
        let countPlan2025 = 0;
        plan2025Keys.forEach(k => { countPlan2025 += getStoredData(k).length; });

        const plan2026Keys = [
            "sibaper_data_perencanaan-2026",
            "sibaper_data_perencanaan-2026-sk",
            "sibaper_data_perencanaan-2026-notulen",
            "sibaper_data_perencanaan-2026-kwitansi"
        ];
        let countPlan2026 = 0;
        plan2026Keys.forEach(k => { countPlan2026 += getStoredData(k).length; });

        const countPlan2027 = getStoredData("sibaper_data_perencanaan-2027").length;
        const totalPerencanaan = countPlan2025 + countPlan2026 + countPlan2027;

        // 3. Realisasi
        const realisasiAnggaran = getStoredData("sibaper_data_realisasi-anggaran");
        const realisasiPelra = getStoredData("sibaper_data_realisasi-pelra");
        const rekTeknis = getStoredData("sibaper_data_realisasi-rekomendasi-teknis");
        const rekSmu = getStoredData("sibaper_data_realisasi-rekomendasi-smu");
        const pengawasanUsaha = getStoredData("sibaper_data_realisasi-pengawasan-usaha");
        const totalRealisasi = realisasiAnggaran.length + realisasiPelra.length + rekTeknis.length + rekSmu.length + pengawasanUsaha.length;

        // 4. Laporan
        const laporanTahunan = getStoredData("sibaper_data_laporan-tahunan");
        const laporanBadanUsaha = getStoredData("sibaper_data_laporan-badan-usaha");
        const totalLaporan = laporanTahunan.length + laporanBadanUsaha.length;

        // 5. Database (BUJANG & PELRA)
        let dbBujang = getStoredData("sibaper_database_bujang_data");
        if (dbBujang.length === 0) dbBujang = getStoredData("sibaper_data_database-bujang");
        
        let dbPelra = getStoredData("sibaper_database_pelra_data");
        if (dbPelra.length === 0) dbPelra = getStoredData("sibaper_data_database-pelra");
        const totalDatabase = dbBujang.length + dbPelra.length;

        // 6. Kinerja
        let evaluasi = getStoredData("sibaper_evaluasi_data");
        if (evaluasi.length === 0) evaluasi = getStoredData("sibaper_data_kinerja-evaluasi");
        
        let penilaian = getStoredData("sibaper_penilaian_data");
        if (penilaian.length === 0) penilaian = getStoredData("sibaper_data_kinerja-penilaian");
        const totalKinerja = evaluasi.length + penilaian.length;

        // 7. Galeri & Regulasi
        const galeriFoto = getStoredData("sibaper_data_galeri-foto");
        const galeriVideo = getStoredData("sibaper_data_galeri-video");
        const regulasi = getStoredData("sibaper_data_galeri-regulasi");
        const totalGaleri = galeriFoto.length + galeriVideo.length + regulasi.length;

        // Total akumulasi dokumen
        const grandTotalDokumen = totalPerencanaan + totalRealisasi + totalLaporan + totalDatabase + totalKinerja + totalGaleri;

        // Perhitungan Perusahaan Unik
        const perusahaanSet = new Set();
        laporanBadanUsaha.forEach(item => {
            if (item.namaPerusahaan) perusahaanSet.add(item.namaPerusahaan.trim());
        });
        dbBujang.forEach(item => {
            if (item.namaPerusahaan) perusahaanSet.add(item.namaPerusahaan.trim());
        });
        dbPelra.forEach(item => {
            if (item.namaPerusahaan) perusahaanSet.add(item.namaPerusahaan.trim());
        });
        rekTeknis.forEach(item => {
            if (item.namaPerusahaan) perusahaanSet.add(item.namaPerusahaan.trim());
        });

        // Inisialisasi 12 bulan dengan nilai 0
        const monthlyMuatan = {};
        STANDARD_MONTHS.forEach(m => {
            monthlyMuatan[m.key] = 0;
        });

        let totalMuatan = 0;
        let validMuatanEntriesCount = 0;

        laporanBadanUsaha.forEach(item => {
            const rawVal = parseFloat(item.muatan);
            const val = Number.isFinite(rawVal) ? rawVal : 0;
            if (val > 0) validMuatanEntriesCount++;
            totalMuatan += val;

            const normalizedMonth = normalizeMonth(item.bulan);
            if (normalizedMonth && monthlyMuatan.hasOwnProperty(normalizedMonth)) {
                monthlyMuatan[normalizedMonth] += val;
            } else if (item.bulan) {
                // Jika format nama bulan berbeda, simpan dengan label aslinya
                monthlyMuatan[item.bulan] = (monthlyMuatan[item.bulan] || 0) + val;
            }
        });

        // Kepatuhan Kinerja Pegawai
        let pegawaiWithKinerja = 0;
        profiles.forEach(p => {
            const hasEv = evaluasi.some(e => String(e.profileId) === String(p.id) || (e.namaPegawai && e.namaPegawai === p.nama));
            const hasPen = penilaian.some(pn => String(pn.profileId) === String(p.id) || (pn.namaPegawai && pn.namaPegawai === p.nama));
            if (hasEv || hasPen) pegawaiWithKinerja++;
        });

        return {
            profilesCount: profiles.length,
            pegawaiWithKinerja,
            grandTotalDokumen,
            totalPerusahaan: perusahaanSet.size,
            totalMuatan,
            validMuatanEntriesCount,
            monthlyMuatan,
            modules: {
                "Perencanaan (SAKIP & SIMBANGDA)": totalPerencanaan,
                "Realisasi Bidang & Seksi": totalRealisasi,
                "Laporan (Tahunan & Badan Usaha)": totalLaporan,
                "Kinerja Pegawai (SKP)": totalKinerja,
                "Database PELRA & BUJANG": totalDatabase,
                "Galeri & Regulasi": totalGaleri
            },
            raw: {
                totalPerencanaan,
                totalRealisasi,
                totalLaporan,
                totalKinerja,
                totalDatabase,
                totalGaleri,
                laporanBadanUsaha,
                laporanTahunan,
                realisasiAnggaran,
                profiles,
                evaluasi,
                penilaian
            }
        };
    }

    // Render Halaman Analisis & Visual Diagram Batang
    function renderLaporanAnalisisPage() {
        const page = document.querySelector('[data-content="laporan-analisis"]');
        if (!page) return;

        const metrics = collectAllSibaperMetrics();

        // Update 4 kartu metrik atas jika elemen tersedia
        const elTotalData = document.getElementById("analysisTotalData");
        const elTotalPerusahaan = document.getElementById("analysisTotalPerusahaan");
        const elTotalMuatan = document.getElementById("analysisTotalMuatan");
        const elDokumen = document.getElementById("analysisDokumen");

        if (elTotalData) elTotalData.textContent = metrics.grandTotalDokumen;
        if (elTotalPerusahaan) elTotalPerusahaan.textContent = metrics.totalPerusahaan;
        if (elTotalMuatan) elTotalMuatan.textContent = metrics.totalMuatan.toLocaleString("id-ID");
        if (elDokumen) elDokumen.textContent = metrics.grandTotalDokumen;

        // Container utama visualisasi grafik
        let chartContainer = page.querySelector(".sibaper-analytics-charts-wrapper");
        if (!chartContainer) {
            // Hapus placeholder teks lama jika ada
            const oldPlaceholder = page.querySelector(".chart-placeholder");
            if (oldPlaceholder) oldPlaceholder.remove();

            chartContainer = document.createElement("div");
            chartContainer.className = "sibaper-analytics-charts-wrapper";
            page.appendChild(chartContainer);
        }

        // Hitung nilai maksimum modul untuk proporsi bar
        const moduleEntries = Object.entries(metrics.modules);
        const maxModuleCount = Math.max(...moduleEntries.map(e => e[1]), 1);

        // Palet warna untuk diagram horizontal
        const colors = [
            { bg: "#2563eb", text: "#1d4ed8", light: "#eff6ff" }, // Biru Perencanaan
            { bg: "#0d9488", text: "#0f766e", light: "#f0fdfa" }, // Tosca Realisasi
            { bg: "#d97706", text: "#b45309", light: "#fffbeb" }, // Amber Laporan
            { bg: "#7c3aed", text: "#6d28d9", light: "#f5f3ff" }, // Ungu Kinerja
            { bg: "#0284c7", text: "#0369a1", light: "#f0f9ff" }, // Sky Database
            { bg: "#e11d48", text: "#be123c", light: "#fff1f2" }  // Rose Galeri
        ];

        // 1. Markup Diagram Batang Horizontal: Distribusi Modul
        const moduleBarsHTML = moduleEntries.map(([name, count], index) => {
            const pct = metrics.grandTotalDokumen > 0 ? ((count / metrics.grandTotalDokumen) * 100).toFixed(1) : "0.0";
            // Jika ada dokumen terdata, gunakan skala proporsional; jika belum ada data, tampilkan garis baseline 0%
            const barWidth = metrics.grandTotalDokumen > 0 ? Math.max(((count / maxModuleCount) * 100), count > 0 ? 4 : 0).toFixed(1) : "0";
            const col = colors[index % colors.length];

            return `
                <div class="sibaper-chart-row">
                    <div class="chart-row-header">
                        <div class="chart-row-label">
                            <span class="chart-dot" style="background:${col.bg};"></span>
                            <strong>${name}</strong>
                        </div>
                        <div class="chart-row-value">
                            <span class="chart-count-badge" style="background:${count > 0 ? col.light : '#f1f5f9'};color:${count > 0 ? col.text : '#64748b'};">
                                ${count} Dokumen
                            </span>
                            <span class="chart-pct">${pct}%</span>
                        </div>
                    </div>
                    <div class="chart-progress-track">
                        <div class="chart-progress-fill" style="width:${barWidth}%;background:${count > 0 ? col.bg : '#cbd5e1'};"></div>
                    </div>
                </div>
            `;
        }).join("");

        // 2. Markup Diagram Batang Vertikal: Tren Arus Muatan Bulanan (12 Bulan)
        const monthKeys = Object.keys(metrics.monthlyMuatan);
        const maxMuatan = Math.max(...Object.values(metrics.monthlyMuatan), 1);
        const hasMuatanData = metrics.totalMuatan > 0;

        const monthlyBarsHTML = monthKeys.map(mKey => {
            const val = metrics.monthlyMuatan[mKey] || 0;
            // Hitung tinggi diagram batang
            const isZero = val === 0;
            // Jika nol, bar minimal 6px (garis dasar visual), jika ada nilai, skala 10% - 100%
            const heightPct = isZero ? 6 : Math.max(((val / maxMuatan) * 100), 14).toFixed(1);

            return `
                <div class="chart-col-item ${isZero ? 'is-zero' : 'has-data'}">
                    <div class="chart-col-bar-wrap">
                        <span class="chart-col-value-tag ${isZero ? 'zero-tag' : 'active-tag'}">
                            ${isZero ? '0' : val.toLocaleString("id-ID")}
                        </span>
                        <div class="chart-col-bar" style="height:${heightPct}%;">
                            ${!isZero ? '<div class="chart-bar-glow"></div>' : ''}
                        </div>
                    </div>
                    <span class="chart-col-label">${mKey}</span>
                </div>
            `;
        }).join("");

        // 3. Markup Status Kinerja SKP Pegawai
        const pctKinerja = metrics.profilesCount > 0 
            ? Math.round((metrics.pegawaiWithKinerja / metrics.profilesCount) * 100) 
            : 0;

        // Render Seluruh Layout Visual Diagram
        chartContainer.innerHTML = `
            <!-- Indikator Status Sistem Real-Time -->
            <div class="sibaper-live-sync-banner">
                <div class="sync-status-indicator">
                    <span class="sync-pulse-dot"></span>
                    <strong>Sistem Visualisasi Diagram Real-Time Aktif</strong>
                </div>
                <div class="sync-status-desc">
                    Diagram otomatis membaca dan memperbarui grafik saat Anda menginput data di menu manapun.
                </div>
            </div>

            <div class="sibaper-analytics-grid">
                <!-- Diagram 1: Distribusi Dokumen (Batang Horizontal) -->
                <div class="sibaper-chart-card">
                    <div class="chart-card-header">
                        <div>
                            <h4>📊 Distribusi Berkas Menurut Kategori Modul</h4>
                            <p>Proporsi volume seluruh arsip yang tercatat di dalam sistem</p>
                        </div>
                        <div class="chart-card-badge ${metrics.grandTotalDokumen > 0 ? 'success' : ''}">
                            ${metrics.grandTotalDokumen} Total Berkas
                        </div>
                    </div>
                    <div class="chart-bars-list">
                        ${moduleBarsHTML}
                    </div>
                    <div class="chart-card-footer-tip">
                        <span>💡 <em>Input data di menu Perencanaan, Realisasi, Laporan, atau Database untuk menaikkan diagram batang.</em></span>
                    </div>
                </div>

                <!-- Diagram 2: Tren Arus Muatan Bulanan (Batang Vertikal 12 Bulan) -->
                <div class="sibaper-chart-card">
                    <div class="chart-card-header">
                        <div>
                            <h4>🚢 Tren Arus Muatan Pelayaran per Bulan (Ton / M³)</h4>
                            <p>Visualisasi grafik 12 bulan (Laporan Badan Usaha JPT &amp; PBM)</p>
                        </div>
                        <div class="chart-card-badge ${hasMuatanData ? 'success' : ''}">
                            Total: ${metrics.totalMuatan.toLocaleString("id-ID")} Ton
                        </div>
                    </div>

                    <div class="chart-columns-container">
                        ${monthlyBarsHTML}
                    </div>

                    <div class="chart-card-footer-tip">
                        <span>${hasMuatanData 
                            ? '✓ <strong>' + metrics.validMuatanEntriesCount + '</strong> laporan muatan telah diplot ke diagram bulan di atas.' 
                            : '💡 <em>Belum ada angka muatan. Tambahkan data di menu <strong>Laporan &gt; Laporan Badan Usaha</strong> untuk menaikkan batang bulan terkait.</em>'
                        }</span>
                    </div>
                </div>

                <!-- Diagram 3: Rasio Capaian Kinerja Pegawai -->
                <div class="sibaper-chart-card">
                    <div class="chart-card-header">
                        <div>
                            <h4>📈 Rasio Kelengkapan Kinerja Pegawai (SKP)</h4>
                            <p>Persentase kepatuhan pengunggahan Evaluasi &amp; Penilaian SKP</p>
                        </div>
                        <div class="chart-card-badge ${pctKinerja >= 80 ? 'success' : 'primary'}">
                            ${pctKinerja}% Lengkap
                        </div>
                    </div>

                    <div class="chart-kinerja-summary-grid">
                        <div class="kinerja-stat-box">
                            <span>TOTAL PEGAWAI</span>
                            <strong>${metrics.profilesCount}</strong>
                            <small>Data Profil Terdaftar</small>
                        </div>
                        <div class="kinerja-stat-box success">
                            <span>SUDAH MENGUNGGAH SKP</span>
                            <strong>${metrics.pegawaiWithKinerja}</strong>
                            <small>${pctKinerja}% Selesai</small>
                        </div>
                        <div class="kinerja-stat-box ${metrics.profilesCount - metrics.pegawaiWithKinerja > 0 ? 'warning' : 'success'}">
                            <span>BELUM MENGUNGGAH</span>
                            <strong>${Math.max(metrics.profilesCount - metrics.pegawaiWithKinerja, 0)}</strong>
                            <small>Perlu Melengkapi</small>
                        </div>
                    </div>

                    <div class="chart-progress-track large" style="margin-top:16px;">
                        <div class="chart-progress-fill" style="width:${pctKinerja}%;background:linear-gradient(90deg,#10b981,#059669);"></div>
                    </div>

                    <div class="chart-card-footer-tip">
                        <span>💡 <em>Kelola data pegawai di menu <strong>Profil</strong> dan unggah berkas SKP di menu <strong>Kinerja</strong>.</em></span>
                    </div>
                </div>
            </div>

            <!-- Tabel Rekapitulasi Rinci -->
            <div class="sibaper-rekap-table-card">
                <div class="chart-card-header">
                    <div>
                        <h4>📑 Rekapitulasi &amp; Status Integrasi Modul SIBAPER</h4>
                        <p>Ringkasan pembacaan berkas secara langsung pada setiap modul kegiatan</p>
                    </div>
                    <button type="button" class="btn-refresh-analytics" id="btnRefreshAnalytics" title="Perbarui Analisis">
                        🔄 Segarkan Data
                    </button>
                </div>
                <div class="rekap-table-responsive">
                    <table class="sibaper-rekap-table">
                        <thead>
                            <tr>
                                <th>Kategori Modul</th>
                                <th>Cakupan Sub-Kegiatan</th>
                                <th>Jumlah Terdata</th>
                                <th>Status Pembacaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>📋 Perencanaan</strong></td>
                                <td>SAKIP (Program, PK, Rencana Aksi), SIMBANGDA (SK, Notulen, Kwitansi), Perencanaan 2027</td>
                                <td><span class="table-count-badge">${metrics.raw.totalPerencanaan} Berkas</span></td>
                                <td><span class="table-status-pill ${metrics.raw.totalPerencanaan > 0 ? 'active' : 'ready'}">${metrics.raw.totalPerencanaan > 0 ? '✓ Aktif (' + metrics.raw.totalPerencanaan + ')' : 'Siap Membaca'}</span></td>
                            </tr>
                            <tr>
                                <td><strong>📊 Realisasi</strong></td>
                                <td>Realisasi Anggaran, Seksi PELRA &amp; ASDP, Seksi BUJANG (Rekomendasi Teknis, SMU, Pengawasan)</td>
                                <td><span class="table-count-badge">${metrics.raw.totalRealisasi} Berkas</span></td>
                                <td><span class="table-status-pill ${metrics.raw.totalRealisasi > 0 ? 'active' : 'ready'}">${metrics.raw.totalRealisasi > 0 ? '✓ Aktif (' + metrics.raw.totalRealisasi + ')' : 'Siap Membaca'}</span></td>
                            </tr>
                            <tr>
                                <td><strong>📑 Laporan</strong></td>
                                <td>Laporan Tahunan &amp; Laporan Bulanan Badan Usaha (JPT &amp; PBM)</td>
                                <td><span class="table-count-badge">${metrics.raw.totalLaporan} Berkas</span></td>
                                <td><span class="table-status-pill ${metrics.raw.totalLaporan > 0 ? 'active' : 'ready'}">${metrics.raw.totalLaporan > 0 ? '✓ Aktif (' + metrics.raw.totalLaporan + ')' : 'Siap Membaca'}</span></td>
                            </tr>
                            <tr>
                                <td><strong>📈 Kinerja Pegawai</strong></td>
                                <td>Dokumen Evaluasi SKP &amp; Penilaian Kinerja Seluruh Pegawai Bidang Pelayaran</td>
                                <td><span class="table-count-badge">${metrics.raw.totalKinerja} Berkas</span></td>
                                <td><span class="table-status-pill ${metrics.raw.totalKinerja > 0 ? 'active' : 'ready'}">${metrics.raw.totalKinerja > 0 ? '✓ Aktif (' + metrics.raw.totalKinerja + ')' : 'Siap Membaca'}</span></td>
                            </tr>
                            <tr>
                                <td><strong>🗄️ Database Pelayaran</strong></td>
                                <td>Database Perusahaan Angkutan Pelayaran BUJANG &amp; Hasil Survei SPM PELRA</td>
                                <td><span class="table-count-badge">${metrics.raw.totalDatabase} Berkas</span></td>
                                <td><span class="table-status-pill ${metrics.raw.totalDatabase > 0 ? 'active' : 'ready'}">${metrics.raw.totalDatabase > 0 ? '✓ Aktif (' + metrics.raw.totalDatabase + ')' : 'Siap Membaca'}</span></td>
                            </tr>
                            <tr>
                                <td><strong>🖼️ Galeri &amp; Regulasi</strong></td>
                                <td>Dokumentasi Foto, Video Kegiatan &amp; Bank Peraturan/Regulasi Pelayaran</td>
                                <td><span class="table-count-badge">${metrics.raw.totalGaleri} Berkas</span></td>
                                <td><span class="table-status-pill ${metrics.raw.totalGaleri > 0 ? 'active' : 'ready'}">${metrics.raw.totalGaleri > 0 ? '✓ Aktif (' + metrics.raw.totalGaleri + ')' : 'Siap Membaca'}</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Bind tombol refresh
        const btnRefresh = chartContainer.querySelector("#btnRefreshAnalytics");
        if (btnRefresh) {
            btnRefresh.addEventListener("click", () => {
                renderLaporanAnalisisPage();
            });
        }
    }

    // Expose ke global window
    window.renderSibaperAnalytics = renderLaporanAnalisisPage;

    // Listeners agar grafik otomatis ter-update seketika saat halaman dibuka atau data berubah
    document.addEventListener("sibaperPageChanged", function (e) {
        if (e.detail && e.detail.page === "laporan-analisis") {
            renderLaporanAnalisisPage();
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        renderLaporanAnalisisPage();
    });

    // Auto sync saat ada perubahan data di localStorage
    window.addEventListener("storage", function () {
        renderLaporanAnalisisPage();
    });

})();

