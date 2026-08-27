/* ============================================================
   SIBAPER - SUPABASE CONNECTION + REMOTE STORAGE BRIDGE
   ============================================================
   Fungsi:
   1. Menghubungkan SIBAPER ke Supabase
   2. Menyimpan data aplikasi ke sibaper_app_storage
   3. Mengupload file ke bucket dokumen-sibaper
   4. TIDAK menyimpan token Supabase Auth ke database
   5. Tidak mengubah tampilan / struktur halaman SIBAPER
============================================================ */

(function () {
    "use strict";

    /* ========================================================
       SUPABASE CONFIGURATION
    ======================================================== */

    const SUPABASE_URL =
        "https://kfviebevcsoqsjccpxgp.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_ZjOyoARG-C4fCnwag5CqEg_l5zsOrDe";

    const STORAGE_BUCKET = "dokumen-sibaper";


    /* ========================================================
       CEK SUPABASE JS
    ======================================================== */

    if (!window.supabase) {
        console.error("SIBAPER: Supabase JS belum dimuat.");
        return;
    }


    /* ========================================================
       BUAT SUPABASE CLIENT
    ======================================================== */

    window.sibaperSupabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    const client = window.sibaperSupabase;

    console.log("SIBAPER: Supabase client aktif.");


    /* ========================================================
       STORAGE ORIGINAL FUNCTIONS
    ======================================================== */

    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;

    let syncing = false;
    let hydrated = false;

    const pending = new Map();


    /* ========================================================
       TOKEN / AUTH KEY DETECTION
       ======================================================== */

    function isSupabaseAuthKey(key) {
        const value = String(key || "");

        /*
         * Supabase Auth biasanya menggunakan key:
         *
         * sb-<project>-auth-token
         *
         * Jangan pernah mengirim key ini
         * ke sibaper_app_storage.
         */

        return (
            value.startsWith("sb-") &&
            value.includes("-auth-token")
        );
    }

    function isLocalOnlyKey(key) {
        return String(key || "") === "sibaperSession";
    }


    /* ========================================================
       HYDRATE DATA DARI SUPABASE
    ======================================================== */

    window.sibaperReady = hydrate();

    async function hydrate() {

        try {

            const {
                data: authData,
                error: authError
            } = await client.auth.getSession();

            if (authError) {
                throw authError;
            }

            if (!authData?.session) {
                hydrated = true;
                window.sibaperSupabaseConfigured = true;
                return true;
            }

            const { data: rows, error } = await client
                .from("sibaper_app_storage")
                .select("storage_key, storage_value");

            if (error) {
                throw error;
            }


            syncing = true;

            for (const row of rows || []) {

                /*
                 * PENTING:
                 * Jangan mengambil token Auth dari database.
                 */

                if (
                    isSupabaseAuthKey(row.storage_key) ||
                    isLocalOnlyKey(row.storage_key)
                ) {
                    continue;
                }

                try {

                    originalSetItem.call(
                        localStorage,
                        row.storage_key,
                        JSON.stringify(row.storage_value)
                    );

                } catch (_) {}
            }

            syncing = false;

            hydrated = true;

            window.sibaperSupabaseConfigured = true;

            console.log("SIBAPER: koneksi Supabase berhasil.");

            return true;

        } catch (error) {

            syncing = false;

            hydrated = true;

            window.sibaperSupabaseConfigured = true;

            console.error(
                "SIBAPER: gagal mengambil data Supabase:",
                error
            );

            return false;
        }
    }


    /* ========================================================
       SET ITEM
    ======================================================== */

    Storage.prototype.setItem = function (key, value) {

        /*
         * HANYA intercept localStorage milik aplikasi.
         */

        if (
            this !== localStorage ||
            syncing ||
            !window.sibaperSupabaseConfigured
        ) {

            return originalSetItem.call(
                this,
                key,
                value
            );
        }


        /*
         * JANGAN INTERCEPT TOKEN SUPABASE AUTH
         */

        if (
            isSupabaseAuthKey(key) ||
            isLocalOnlyKey(key)
        ) {

            return originalSetItem.call(
                this,
                key,
                value
            );
        }


        /*
         * Simpan cache lokal terlebih dahulu.
         */

        originalSetItem.call(
            this,
            key,
            value
        );


        let parsed;

        try {

            parsed = JSON.parse(value);

        } catch (_) {

            parsed = value;
        }


        const operation = persistValue(
            key,
            parsed
        );

        pending.set(
            key,
            operation
        );

        return true;
    };


    /* ========================================================
       REMOVE ITEM
    ======================================================== */

    Storage.prototype.removeItem = function (key) {

        /*
         * Token Supabase harus tetap dikelola
         * oleh Supabase Auth.
         */

        if (
            isSupabaseAuthKey(key) ||
            isLocalOnlyKey(key)
        ) {

            return originalRemoveItem.call(
                this,
                key
            );
        }


        if (
            this !== localStorage ||
            syncing ||
            !window.sibaperSupabaseConfigured
        ) {

            return originalRemoveItem.call(
                this,
                key
            );
        }


        syncing = true;

        try {

            originalRemoveItem.call(
                this,
                key
            );

        } finally {

            syncing = false;
        }


        void client
            .from("sibaper_app_storage")
            .delete()
            .eq("storage_key", key)
            .then(({ error }) => {

                if (error) {

                    console.error(
                        "SIBAPER delete:",
                        error
                    );
                }
            });
    };


    /* ========================================================
       CLEAR
    ======================================================== */

    Storage.prototype.clear = function () {

        /*
         * Jangan menghapus session Auth secara paksa
         * dari bridge aplikasi.
         */

        if (
            this !== localStorage ||
            syncing ||
            !window.sibaperSupabaseConfigured
        ) {

            return originalClear.call(this);
        }


        /*
         * Ambil semua key aplikasi.
         */

        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (
                key &&
                !isSupabaseAuthKey(key)
            ) {

                keys.push(key);
            }
        }


        syncing = true;

        try {

            for (const key of keys) {

                originalRemoveItem.call(
                    localStorage,
                    key
                );
            }

        } finally {

            syncing = false;
        }


        /*
         * Hapus data aplikasi dari database.
         *
         * Token Auth tidak disentuh.
         */

        for (const key of keys) {

            void client
                .from("sibaper_app_storage")
                .delete()
                .eq("storage_key", key)
                .then(({ error }) => {

                    if (error) {

                        console.error(
                            "SIBAPER clear:",
                            error
                        );
                    }
                });
        }
    };


    /* ========================================================
       SIMPAN DATA KE SUPABASE
    ======================================================== */

    async function persistValue(
        key,
        parsed
    ) {

        /*
         * Keamanan tambahan:
         * jangan pernah menyimpan auth token.
         */

        if (
            isSupabaseAuthKey(key) ||
            isLocalOnlyKey(key)
        ) {

            return;
        }


        const cleaned =
            await extractAndUploadFiles(
                parsed,
                key
            );


        const json =
            JSON.stringify(cleaned);


        /*
         * Simpan cache lokal.
         */

        syncing = true;

        try {

            originalSetItem.call(
                localStorage,
                key,
                json
            );

        } finally {

            syncing = false;
        }


        /*
         * Simpan data ke Supabase.
         */

        const { error } = await client
            .from("sibaper_app_storage")
            .upsert(
                {
                    storage_key: key,
                    storage_value: cleaned,
                    updated_at:
                        new Date().toISOString()
                },
                {
                    onConflict: "storage_key"
                }
            );


        if (error) {

            console.error(
                "SIBAPER: gagal menyimpan",
                key,
                error
            );

        } else {

            console.log(
                "SIBAPER: data tersimpan:",
                key
            );
        }
    }


    /* ========================================================
       CARI DATA FILE
    ======================================================== */

    async function extractAndUploadFiles(
        value,
        key,
        seen = new WeakSet()
    ) {

        /*
         * String biasa
         */

        if (typeof value === "string") {

            if (!value.startsWith("data:")) {

                return value;
            }

            return await uploadDataUrl(
                value,
                key
            );
        }


        /*
         * Nilai kosong / primitive
         */

        if (
            !value ||
            typeof value !== "object"
        ) {

            return value;
        }


        /*
         * Hindari circular reference
         */

        if (seen.has(value)) {

            return null;
        }

        seen.add(value);


        /*
         * Array
         */

        if (Array.isArray(value)) {

            const result = [];

            for (const item of value) {

                result.push(
                    await extractAndUploadFiles(
                        item,
                        key,
                        seen
                    )
                );
            }

            return result;
        }


        /*
         * Object
         */

        const result = {};

        for (
            const [k, v]
            of Object.entries(value)
        ) {

            result[k] =
                await extractAndUploadFiles(
                    v,
                    key,
                    seen
                );
        }

        return result;
    }


    /* ========================================================
       UPLOAD DATA URL KE SUPABASE STORAGE
    ======================================================== */

    async function uploadDataUrl(
        dataUrl,
        storageKey
    ) {

        const {
            data: authData,
            error: authError
        } = await client.auth.getSession();

        if (authError) {
            throw authError;
        }

        if (!authData?.session) {
            throw new Error("Sesi Supabase tidak tersedia untuk upload file.");
        }

        const match =
            dataUrl.match(
                /^data:([^;,]+)?(?:;base64)?,(.*)$/s
            );


        if (!match) {

            return dataUrl;
        }


        const mime =
            match[1] ||
            "application/octet-stream";


        const raw =
            match[2] || "";


        const base64 =
            dataUrl.includes(";base64,");


        let bytes;


        try {

            if (base64) {

                const binary =
                    atob(raw);

                bytes =
                    new Uint8Array(
                        binary.length
                    );


                for (
                    let i = 0;
                    i < binary.length;
                    i++
                ) {

                    bytes[i] =
                        binary.charCodeAt(i);
                }

            } else {

                bytes =
                    new TextEncoder().encode(
                        decodeURIComponent(raw)
                    );
            }

        } catch (_) {

            return dataUrl;
        }


        /* ====================================================
           TENTUKAN EXTENSION
        ==================================================== */

        const ext =
            mime.includes("pdf")
                ? "pdf"
                : mime.includes("png")
                ? "png"
                : mime.includes("jpeg") ||
                  mime.includes("jpg")
                ? "jpg"
                : mime.includes("webp")
                ? "webp"
                : "bin";


        const path =
            `legacy/${sanitize(storageKey)}/${crypto.randomUUID()}.${ext}`;


        /* ====================================================
           UPLOAD KE BUCKET
        ==================================================== */

        const { error } =
            await client.storage
                .from(STORAGE_BUCKET)
                .upload(
                    path,
                    new Blob(
                        [bytes],
                        {
                            type: mime
                        }
                    ),
                    {
                        upsert: false
                    }
                );


        if (error) {

            console.error(
                "SIBAPER: upload file gagal:",
                error
            );

            throw error;
        }


        /* ====================================================
           PUBLIC URL
        ==================================================== */

        const { data } =
            client.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(path);


        if (!data?.publicUrl) {
            throw new Error("URL file Supabase Storage tidak tersedia.");
        }

        return data.publicUrl;
    }


    /* ========================================================
       SANITIZE PATH
    ======================================================== */

    function sanitize(value) {

        return String(value)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                "_"
            )
            .slice(0, 80);
    }


    /* ========================================================
       WAIT UNTIL READY
    ======================================================== */

    window.sibaperWaitForReady =
        function () {

            return (
                window.sibaperReady ||
                Promise.resolve(true)
            );
        };


    /* ========================================================
       DEBUG
    ======================================================== */

    window.sibaperSupabaseConfigured = true;

})();