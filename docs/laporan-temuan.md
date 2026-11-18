# Laporan Temuan — Code Review dan Keamanan Dasar

> Jobsheet 12. Temuan diambil dari kode lama sebelum refactor dan dari kode saat ini. Setiap temuan menyebut bukti, dampak, perbaikan, dan uji regresi. Tidak ada data klien nyata di dokumen ini.

## 1. Ringkasan temuan

| ID | Temuan | Kategori OWASP | Risiko | Status |
|---|---|---|---|---|
| T-01 | HTML lama disusun dari template string sehingga data pengguna dapat menjadi HTML | A03 Injection (XSS) | Tinggi | **Diperbaiki** |
| T-02 | Uji otomatis memakai `konter.sqlite` kerja | A02 Security Misconfiguration (data) | Sedang | **Diperbaiki** |
| T-03 | Rekap harian memakai tanggal UTC | A04 Insecure Design | Sedang | **Diperbaiki** |
| T-04 | Peringatan kedaluwarsa ditulis hardcoded | A04 Insecure Design | Rendah | **Diperbaiki** |
| T-05 | Operator transaksi dipercaya dari isian klien | A01 Broken Access Control (data integrity) | Sedang | **Diperbaiki** |
| T-06 | Belum ada autentikasi/otorisasi peran | A01 Broken Access Control | Tinggi | **Diperbaiki (JS11)** |
| T-07 | Belum ada token CSRF pada form POST | A01 Broken Access Control | Tinggi | **Diperbaiki (JS12)** |
| T-08 | Belum ada pembatasan percobaan login | A07 Identification/Auth Failures | Sedang | **Diperbaiki (JS12)** |
| T-09 | Belum ada security header/CSP | A02 Security Misconfiguration | Sedang | **Diperbaiki (JS12)** |
| T-10 | CSS/JS sebaris menghalangi CSP ketat | A02 Security Misconfiguration | Rendah | **Diperbaiki (JS11/12)** |

## 2. Rincian temuan

### T-01 — XSS lewat penyusunan HTML

- **Lokasi:** `src/index.ts` lama; diganti `src/views/*.tsx`.
- **Bukti:** halaman lama memakai `c.html(\`...${nama}...\`)`; nama pelanggan dapat berisi `<script>`.
- **Dampak:** skrip penyerang berjalan di peramban kasir/pemilik.
- **Perbaikan:** semua tampilan memakai Hono JSX; data dirender sebagai teks dan otomatis di-escape. `dangerouslySetInnerHTML` tidak dipakai untuk data.
- **Uji regresi:** `tests/transaksi.test.ts` (“meng-escape nama pelanggan yang berisi HTML”), `tests/voucher-crud.test.ts` (“meng-escape nama paket…”).

### T-02 — Uji menulis ke basis data kerja

- **Lokasi:** `src/db.ts` lama, `src/index.test.ts` lama.
- **Bukti:** setelah `bun test`, baris `transactions` di `konter.sqlite` bertambah.
- **Dampak:** data kerja rusak; hasil uji tidak dapat diulang.
- **Perbaikan:** `tests/bantuan.ts` memakai `:memory:`; koneksi ditutup pada `afterEach`; `tests/cek_skema.ts` juga in-memory.
- **Uji regresi:** seluruh suite; `konter.sqlite` tidak tersentuh.

### T-03 — Tanggal UTC pada rekap harian

- **Lokasi:** perhitungan “hari ini” lama.
- **Bukti:** `new Date().toISOString()` menghasilkan tanggal kemarin antara 00.00–06.59 WIB.
- **Dampak:** omzet/laba harian salah pada shift pagi.
- **Perbaikan:** `src/lib/waktu.ts` memakai `Intl.DateTimeFormat` zona Asia/Jakarta.
- **Uji regresi:** `tests/waktu.test.ts` (00.30 WIB tetap 18 November).

### T-04 — Kedaluwarsa hardcoded

- **Lokasi:** halaman beranda lama (`isNearExp` dengan tanggal tetap).
- **Bukti:** semua voucher dianggap mendekati expired setelah tanggal tertentu.
- **Dampak:** peringatan salah; voucher terlewat.
- **Perbaikan:** `statusKedaluwarsa()` menghitung selisih hari per baris (≤7, hari ini, sudah lewat).
- **Uji regresi:** `tests/transaksi.test.ts` dan `TC-EXP-01…04`.

### T-05 — Operator dari klien

- **Lokasi:** `POST /api/transaksi` lama.
- **Bukti:** `body.operator || detectOperator(...)` menerima operator kiriman klien.
- **Dampak:** data operator tidak akurat; laporan filter salah.
- **Perbaikan:** operator selalu dihitung server dari prefix (PLN untuk token); harga voucher diambil dari master.
- **Uji regresi:** `tests/operator.test.ts`, `tests/transaksi.test.ts`.

### T-06 — Tidak ada autentikasi/otorisasi

- **Lokasi:** seluruh rute lama.
- **Bukti:** halaman stok dan laporan dapat dibuka tanpa login; tidak ada peran.
- **Dampak:** siapa pun dapat mengubah stok/melihat modal.
- **Perbaikan:** login/logout, hash Argon2id, sesi bertanda tangan, middleware `wajibMasuk`/`wajibPeran`, 403, UI menurut peran.
- **Uji regresi:** `tests/auth.test.ts` (login, pesan seragam, 403 GET/POST, open redirect, logout).

### T-07 — Tidak ada CSRF

- **Lokasi:** semua form POST.
- **Bukti:** permintaan lintas situs dapat mengirim POST memakai cookie sesi.
- **Dampak:** perubahan data atas nama pengguna yang sedang login.
- **Perbaikan:** token di cookie bertanda tangan + hidden input; diverifikasi di setiap POST (login, transaksi, voucher, voucher masuk, kasbon, logout).
- **Uji regresi:** `tests/keamanan.test.ts` (tanpa token, token salah, token benar, logout).

### T-08 — Tidak ada batas percobaan login

- **Lokasi:** `POST /login`.
- **Bukti:** percobaan kata sandi tanpa batas.
- **Dampak:** brute force.
- **Perbaikan:** 5 kegagalan/15 menit per username+IP, pesan generik, reset saat sukses; batas in-memory didokumentasikan.
- **Uji regresi:** `tests/keamanan.test.ts` (blokir setelah 5, jendela waktu).

### T-09 — Tidak ada security header/CSP

- **Lokasi:** respons aplikasi.
- **Bukti:** tidak ada `Content-Security-Policy`, `X-Frame-Options`, `nosniff`.
- **Dampak:** risiko XSS/clickjacking lebih besar.
- **Perbaikan:** `secureHeaders` Hono; CSP `'self'`, tanpa `unsafe-inline`; CSS/JS dipindah ke `public/`.
- **Uji regresi:** `tests/keamanan.test.ts` (header dan tidak ada gaya/event sebaris).

### T-10 — CSS/JS sebaris

- **Lokasi:** `src/views/layout.tsx` lama.
- **Perbaikan:** `public/style.css` dan `public/app.js`; layout memakai `<link>` dan `<script defer>`.

## 3. Temuan yang diterima/ditunda

| ID | Temuan | Keputusan | Alasan |
|---|---|---|---|
| T-11 | Pesan sukses/galat lewat query string dapat dipalsukan | Diterima (rendah) | Teks di-escape JSX; bukan data sensitif; dapat diganti flash cookie nanti |
| T-12 | Rate limit in-memory hilang saat restart | Diterima | Aplikasi satu instance, restart jarang; cukup untuk lingkup praktikum |
| T-13 | `transactions.pengguna_id` masih nullable | Diterima (transisi) | Aplikasi selalu mengisi dari sesi; migrasi NOT NULL saat data lama bersih |
| T-14 | Belum ada pemulihan kata sandi | Diterima | Akun dibuat pemilik lewat skrip; di luar lingkup SRS |

## 4. Tinjauan silang antarkelompok

Lembar tinjauan untuk kelompok lain **belum diisi** karena sesi review silang belum dilaksanakan. Templat tersedia di `docs/review/lembar-tinjauan-silang.md`. Jangan mengisi temuan atau nama yang tidak benar-benar diperiksa.
