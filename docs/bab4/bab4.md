# Bab 4 — Implementasi dan Pengujian

> **Draf Markdown untuk Laporan Tugas Akhir.** Konversi ke `.docx`/PDF, penomoran resmi, daftar pustaka, dan tanda tangan dilakukan pengguna. Bagian yang belum dapat diisi (UAT klien, deployment nyata, hash commit) ditandai eksplisit. Jangan mengarang hasil.

## 4.1 Lingkungan Implementasi

### 4.1.1 Perangkat dan sistem operasi

- Sistem operasi pengembangan: Windows 11 (64-bit).
- Peramban: Chrome/Edge; pengujian otomatis tidak memerlukan peramban.
- Perangkat: laptop pengembangan; aplikasi juga dirancang untuk komputer toko/LAN.

### 4.1.2 Stack dan dependensi

| Komponen | Pilihan | Alasan |
|---|---|---|
| Runtime | Bun 1.4.4 | Runtime, package manager, dan test runner dalam satu alat |
| Web framework | Hono 4.13 | Ringan, TypeScript, JSX server, middleware cookie/security |
| Basis data | `bun:sqlite` | SQLite bawaan Bun; tidak perlu server DB |
| Tampilan | Hono JSX + satu `public/style.css` | Auto-escape, komponen dapat dipakai ulang |
| Uji | `bun:test` | Terintegrasi, cepat, DB in-memory |
| Hash kata sandi | `Bun.password` (Argon2id) | Bawaan runtime, bukan algoritma buatan sendiri |
| AI | Command Code | Digunakan dengan jurnal dan tinjauan manusia |

Dependensi runtime hanya **hono**; `@types/bun` adalah devDependency. Tidak ada paket CSS/UI tambahan. Stack Bun/Hono/SQLite merupakan keputusan sadar penulis, bukan kekeliruan terhadap contoh Flask pada jobsheet (lihat `aturan-proyek.md` §1 dan `docs/srs.md` §2.3).

### 4.1.3 Konfigurasi

Konfigurasi dibaca dari `.env` melalui `src/config.ts`: `APP_ENV`, `SECRET_KEY`, `KONTER_DB`, `PORT`, `HOST`, `COOKIE_SECURE`. Produksi menolak start bila `SECRET_KEY` hilang atau <32 karakter; mode pengembangan memakai secret acak sementara (tidak ditulis ke kode). Contoh aman ada di `.env.example`.

## 4.2 Implementasi Sistem

### 4.2.1 Struktur proyek

```
src/
├── index.ts          # inisialisasi DB, skema, seed, server
├── app.ts            # perakitan Hono, middleware, rute
├── config.ts         # konfigurasi/validasi lingkungan
├── middleware/       # sesi, peran, CSRF
├── routes/           # controller HTTP tipis
├── services/         # aturan bisnis dan validasi
├── models/           # satu-satunya SQL
├── views/            # Hono JSX
├── db/               # koneksi, schema.sql, seed
└── lib/              # waktu, sesi, CSRF, backup, format
public/               # style.css, app.js
tests/                # 12 berkas bun:test + cek_skema.ts
scripts/              # akun, demo, cadangan, rekap jurnal
```

Aturan lapisan: route tidak menulis SQL; service tidak menulis HTML; model hanya SQL berparameter; view tidak mengakses DB. `docs/desain/schema.sql` adalah satu-satunya DDL.

### 4.2.2 Fitur yang diimplementasikan

| KF | Fitur | Bukti utama |
|---|---|---|
| KF-01 | Form transaksi pulsa/data/token, validasi, rekap | `src/routes/transaksi.ts`, `tests/transaksi.test.ts` |
| KF-02 | Deteksi operator dari prefix + normalisasi 62 | `src/services/operator.ts`, `tests/operator.test.ts` |
| KF-03 | Pengurangan stok voucher otomatis | `src/models/transaksi.ts` |
| KF-04 | Penolakan stok habis/kurang | `src/services/transaksi.ts` |
| KF-05 | Omzet/modal/laba harian dan laporan periode | `src/models/transaksi.ts`, `src/routes/laporan.ts` |
| KF-06 | Kasbon: pelanggan, kontak, tempo | `src/models/kasbon.ts`, `tests/transaksi.test.ts` |
| KF-07 | Pelunasan + tanggal lunas | `src/models/kasbon.ts` |
| KF-08 | Login/logout, Argon2id, sesi, peran | `src/services/autentikasi.ts`, `src/middleware/` |
| KF-09 | Peringatan ≤7 hari/hari ini/kedaluwarsa | `src/services/voucher.ts`, `tests/voucher-status.test.ts` |
| KF-10 | CRUD voucher + ledger voucher masuk | `src/routes/voucher.ts`, `src/routes/voucher-masuk.ts` |
| KF-11 | Filter tanggal/operator/jenis/status/kata kunci | `src/models/transaksi.ts`, `tests/pencarian.test.ts` |
| KF-12 | Salin struk WhatsApp | **Belum** (Could) |

### 4.2.3 Cuplikan kode penting

**a. Transaksi atomik untuk stok dan kasbon** (`src/models/transaksi.ts`):

```ts
const jalankan = db.transaction(() => {
  const hasil = db.query(`INSERT INTO transactions (...) VALUES (...)`).run(...);
  const id = Number(hasil.lastInsertRowid);
  if (data.voucherId !== null && !kurangiStokVoucher(data.voucherId, data.jumlah)) {
    throw new Error("Stok voucher tidak mencukupi saat menyimpan.");
  }
  if (kasbon) {
    const pelangganId = cariAtauBuatPelanggan(kasbon.namaPelanggan, kasbon.kontak);
    db.query(`INSERT INTO debts (...) VALUES (?, ?, ?)`).run(id, pelangganId, kasbon.tanggalTempo);
  }
  return id;
});
```

Bila salah satu langkah gagal, seluruh perubahan dibatalkan. Uji atomisitas ada di `tests/transaksi.test.ts` dan `tests/voucher-masuk.test.ts`.

**b. Pesan login seragam + hash dummy** (`src/services/autentikasi.ts`):

```ts
const pengguna = cariPengguna(username);
const hash = pengguna?.password_hash ?? (await dapatkanHashPalsu());
let cocok = false;
try { cocok = await Bun.password.verify(password ?? "", hash); } catch { cocok = false; }
if (!pengguna || !cocok) return { ok: false, galat: [PESAN_LOGIN] };
```

Pemeriksaan tetap dilakukan saat username tidak ada agar waktu respons tidak membocorkan keberadaan akun.

**c. CSRF** (`src/lib/csrf.ts`):

```ts
const cookie = await getSignedCookie(c, konfigurasi().secretKey, NAMA_CSRF);
const dikirim = String(form.csrf_token ?? "");
return Boolean(cookie) && cookie === dikirim;
```

Token ditanam di cookie bertanda tangan dan hidden input; semua POST (login, transaksi, voucher, voucher masuk, kasbon, logout) memverifikasinya.

**d. Filter LIKE aman** (`src/models/transaksi.ts`):

```ts
const pola = `%${escapeLike(filter.q)}%`;
potongan.push("(t.nomor_tujuan LIKE ? ESCAPE '\\' OR v.nama_paket LIKE ? ESCAPE '\\')");
parameter.push(pola, pola);
```

`escapeLike` menetralkan `%`, `_`, dan `\`; potongan SQL yang dirakit hanya fragmen tetap.

### 4.2.4 Tampilan

Screenshot aplikasi berjalan (data karangan) tersedia di `docs/gambar/`:

- `01-login.png` — login.
- `02-dashboard-pemilik.png` — dashboard pemilik, form transaksi, voucher, kasbon, riwayat.
- `03-inventaris-voucher.png` — daftar stok.
- `04-voucher-masuk.png` — ledger penambahan stok.
- `05-riwayat-filter.png` — filter riwayat.
- `06-laporan.png` — laporan pemilik.
- `07-dashboard-kasir.png` — dashboard kasir tanpa laba/modal.
- `08-akses-ditolak.png` — 403.

## 4.3 Tinjauan Kode dan Keamanan

Tinjauan dilakukan dengan membandingkan kode lama (monolit `src/index.ts`) dan kode berlapis saat ini. Sepuluh temuan utama dan perbaikannya:

| ID | Temuan | Risiko | Perbaikan | Uji |
|---|---|---|---|---|
| T-01 | XSS dari template string | Tinggi | Hono JSX auto-escape | uji escape |
| T-02 | Uji menulis DB kerja | Sedang | `:memory:` | seluruh suite |
| T-03 | Tanggal UTC | Sedang | zona Asia/Jakarta | `waktu.test.ts` |
| T-04 | Expired hardcoded | Rendah | hitung selisih hari | `voucher-status.test.ts` |
| T-05 | Operator dari klien | Sedang | deteksi server | `operator.test.ts` |
| T-06 | Tanpa auth/peran | Tinggi | login + middleware peran | `auth.test.ts` |
| T-07 | Tanpa CSRF | Tinggi | token + verifikasi | `keamanan.test.ts` |
| T-08 | Tanpa rate limit | Sedang | 5 gagal/15 menit | `keamanan.test.ts` |
| T-09 | Tanpa header/CSP | Sedang | `secureHeaders` + CSP | `keamanan.test.ts` |
| T-10 | CSS/JS sebaris | Rendah | `public/` | uji CSP |

Temuan yang diterima/ditunda (pesan query string, rate limit in-memory, `pengguna_id` transisi, belum ada reset kata sandi) dicatat di `docs/temuan-keamanan.md`. Tidak ada temuan kritis terbuka pada lingkup v1.0.

## 4.4 Pengujian

### 4.4.1 Hasil otomatis

```text
bun test → 119 lulus, 0 gagal, 12 berkas
bun run cek:skema → 23 kasus pelanggaran ditolak, semua batasan bekerja
bunx tsc --noEmit → bersih
```

Cakupan: transaksi, operator, stok, voucher CRUD, voucher masuk, kasbon, laporan, filter, auth, peran, CSRF, rate limit, header, backup, health, dan versi. Rincian 50+ test case ada di `docs/pengujian/test-case.md`.

### 4.4.2 Cacat yang diperbaiki

Delapan cacat nyata (DEF-01…DEF-08) didokumentasikan di `docs/pengujian/laporan-cacat.md`, termasuk UTC, XSS, uji mengotori DB, atomisitas stok, operator spoofing, expired hardcoded, cakupan middleware peran, dan isian form hilang. Setiap cacat memiliki uji regresi.

### 4.4.3 Uji mutasi

Cek stok di `src/services/transaksi.ts` dilepas sementara, lalu `bun test tests/transaksi.test.ts` dijalankan. Hasil: **2 uji gagal** (“stok habis” dan “jumlah melebihi stok”), membuktikan asersi menangkap regresi. Kode dikembalikan dan subset uji kembali 20 lulus.

### 4.4.4 UAT

Rencana dan instrumen ada di `docs/pengujian/rencana-uat.md`, `docs/uat/lembar-uat.md`, `docs/uat/hasil-uat.md`. **UAT dengan klien belum dilaksanakan**; hasil tidak dikarang. Skenario mencakup login, dua peran, transaksi, voucher, voucher masuk, kasbon, filter, laporan, tampilan 360 px, dan pesan galat.

## 4.5 Rilis dan Dokumentasi

- Versi **1.0.0** di `package.json`, `src/versi.ts`, dan footer.
- Health check publik `GET /kesehatan` → `{"status":"ok","versi":"1.0.0"}`.
- `CHANGELOG.md` dan `docs/rilis/v1.0.0.md`.
- README memuat instalasi, konfigurasi, peran, perintah, struktur, backup, deployment, dan batasan.
- `docs/manual-pengguna.md` dengan 8 screenshot dan panduan tugas.
- `scripts/buat-pengguna.ts`, `scripts/siapkan-demo.ts`, `scripts/cadangkan.ts`, `scripts/rekap-jurnal.ts`.
- Cadangan memakai `VACUUM INTO`; uji membuka kembali berkas cadangan.
- Tag `v1.0.0`, PR, dan GitHub Release **belum dibuat**; perintah disiapkan untuk pengguna.

## 4.6 Pembahasan

### 4.6.1 Pemenuhan kebutuhan

| Kebutuhan | Status | Bukti |
|---|---|---|
| KF-01–KF-11 | Terpenuhi | Uji otomatis + dokumen |
| KF-12 (Could) | Tidak dikerjakan | Batasan rilis |
| KNF-01 (keandalan/validasi) | Terpenuhi | Validasi server, transaksi atomik, 119 uji |
| KNF-02 (kinerja) | Terpenuhi secara wajar | SQLite lokal; tidak ada benchmark formal |
| KNF-03 (kegunaan) | Sebagian | Alur ≤10 detik belum diukur formal; UAT manual |
| KNF-04 (responsif) | Sebagian | CSS responsif; uji 360 px manual belum |
| KNF-05 (keamanan) | Terpenuhi dasar | Argon2id, sesi, CSRF, rate limit, CSP |

### 4.6.2 Analisis Jurnal Vibe Coding

Jurnal berisi **33 entri** (lihat `jurnal-vibe-coding.md`; rekap dihasilkan `bun run rekap:jurnal`):

| Keputusan | Jumlah | Proporsi |
|---|---:|---:|
| Terima | 25 | 76% |
| Ubah | 7 | 21% |
| Tolak | 1 | 3% |
| Belum diisi | 0 | 0% |

Tag: **2 `[Debug]`** (tanggal UTC, cakupan middleware peran) dan **2 `[Galat: ...]`** (keamanan operator, uji-lemah). Jenis koreksi yang terlihat: acuan/desain (kolom turunan, ID KF), keamanan (operator klien), cakupan middleware, akurasi angka uji, dan disiplin dependensi. Proporsi “Terima” yang tinggi **bukan** bukti AI selalu benar; tinjauan dan uji tetap menentukan. Tidak ada pengukuran waktu dengan stopwatch, sehingga klaim penghematan waktu tidak dibuat.

Keterbatasan analisis: satu penulis, 33 entri, kategori galat ditentukan sendiri, dan jurnal disusun dengan bantuan AI lalu ditinjau penulis. Sampel kecil; hasil tidak dapat digeneralisasi.

### 4.6.3 Keterbatasan dan rekomendasi

1. UAT nyata, deployment, dan review pihak lain belum dilakukan; jadwalkan dan isi lembar yang tersedia.
2. KF-12 salin struk dan ekspor laporan tidak termasuk v1.0; tambahkan bila klien meminta.
3. Rate limit in-memory; untuk produksi multi-instance gunakan penyimpanan bersama.
4. `transactions.pengguna_id` masih nullable; migrasi NOT NULL setelah data lama bersih.
5. Tambahkan uji beban/kinerja dan uji aksesibilitas formal pada versi berikutnya.
6. Peer review sebaiknya dilakukan minimal satu kali sebelum presentasi; dokumen ini menyediakan templatnya.

## 4.7 Integrasi dengan Bab 3

Revisi Bab 3 (istilah, ID, tim, dan perubahan desain) diringkas di `docs/laporan/bab3-revisi.md`. Bab 3 final dikonversi ke `.docx`/PDF oleh pengguna; tidak ada klaim bahwa dokumen tersebut sudah dikumpulkan.
