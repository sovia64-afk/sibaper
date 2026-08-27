# SIBAPER — Vercel + Supabase

## Penting
Paket ini mempertahankan tampilan dan struktur `website_instansi` yang kamu kirim. CSS dan halaman tidak didesain ulang.

Supabase dipakai untuk:
- Authentication login/registrasi.
- Tabel `profiles` untuk identitas dan role `admin` / `user`.
- Tabel `sibaper_app_storage` sebagai penyimpanan remote untuk dataset lama yang sebelumnya memakai localStorage.
- Storage bucket `dokumen-sibaper` untuk memindahkan Data URL file lama menjadi URL file.

## 1. Buat project Supabase
Buat project baru di akun Supabase milikmu.

## 2. Jalankan SQL
Buka **SQL Editor** → buat query baru → paste seluruh isi `SUPABASE_SCHEMA.sql` → Run.

## 3. Masukkan URL dan key
Buka `website_instansi/js/supabase.js`.

Ganti:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-ID.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";
```

Gunakan **Publishable key / anon key**, bukan `service_role`.

## 4. Buat akun admin pertama
Di Supabase → Authentication → Users → Add user, buat akun admin.

Kemudian masukkan UUID user tersebut ke SQL yang ada di bagian komentar `SUPABASE_SCHEMA.sql` untuk membuat row `profiles` dengan `role='admin'`.

## 5. Registrasi user
Halaman `register.html` membuat akun dengan role `user`.

## 6. Deploy ke Vercel
Project ini tetap berupa website statis sehingga Vercel cukup melakukan deployment dari repository.

Tidak perlu memindahkan `website_instansi` ke `docs` untuk Vercel.

## Catatan migrasi data
Modul SIBAPER lama masih memakai API `localStorage` internal. `supabase.js` menyediakan bridge agar dataset tersebut tersinkron ke Supabase dan Data URL file dipindahkan ke Storage. Ini menjaga UI lama tetap bekerja tanpa harus menempel potongan kode satu per satu.

Untuk produksi penuh, RLS dan struktur tabel per modul sebaiknya diperketat setelah seluruh menu diuji.
