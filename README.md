# RPL Konter Sampit v1.0.0

> Sistem Informasi & Manajemen Operasional Warung Konter Pulsa, Paket Data, & PPOB di Sampit.  
> Proyek Praktikum Rekayasa Perangkat Lunak — Politeknik Sampit.  
> Dikerjakan oleh **Hendra Gunawan** (24554010026).

## Ringkasan

Aplikasi web lokal untuk mencatat transaksi pulsa/data/token, menjual voucher fisik, mengelola stok voucher, mencatat kasbon, dan melihat rekap laba. Autentikasi dua peran: **Pemilik** (akses penuh) dan **Kasir** (transaksi, voucher lihat, kasbon, riwayat hari ini).

Stack: **Bun + Hono + `bun:sqlite` + Hono JSX + `bun:test`**. Tidak memakai Flask/Python; keputusan stack didokumentasikan di `aturan-proyek.md` §1.

## Prasyarat

- Windows/Linux/macOS dengan **Bun 1.4+** (`bun --version`).
- Git (untuk alur branch/PR).
- Peramban modern.

## Mulai Cepat

```bash
bun install
copy .env.example .env        # Windows
# cp .env.example .env        # Linux/macOS
# Isi SECRET_KEY di .env (minimal 32 karakter acak).
bun run buat:pengguna         # buat akun pemilik dan kasir
bun dev
```

Buka `http://localhost:3000`.

### Data demo (opsional)

```bash
set DEMO_PEMILIK_PASSWORD=<pilih-sandi-demo>
set DEMO_KASIR_PASSWORD=<pilih-sandi-demo-lain>
set KONTER_DB=demo.sqlite
bun run demo:siapkan
bun dev
```

Tentukan kata sandi demo sendiri (minimal 8 karakter). Jangan memakai kata sandi contoh atau kata sandi nyata; `demo.sqlite` diabaikan Git.

## Peran dan Menu

| Menu/aksi | Kasir | Pemilik |
|---|:---:|:---:|
| Beranda | ✓ (tanpa modal/laba) | ✓ |
| Catat transaksi pulsa/data/token | ✓ | ✓ |
| Jual voucher | ✓ | ✓ |
| Daftar voucher | ✓ (lihat) | ✓ |
| Tambah/ubah/hapus/stok voucher | 403 | ✓ |
| Voucher masuk | 403 | ✓ |
| Kasbon & pelunasan | ✓ | ✓ |
| Riwayat | hari ini | semua + filter |
| Laporan | 403 | ✓ |

## Perintah

| Perintah | Kegunaan |
|---|---|
| `bun dev` | Server pengembangan dengan watch |
| `bun start` | Server tanpa watch |
| `bun test` | Uji otomatis (DB in-memory) |
| `bun run cek:skema` | Uji DDL dan batasan skema |
| `bun run buat:pengguna` | Buat akun baru dari terminal (kata sandi tidak ditampilkan) |
| `bun run demo:siapkan` | Isi akun/transaksi demo (butuh env kata sandi) |
| `bun run cadangkan` | Buat cadangan SQLite di `backup/` |
| `bunx tsc --noEmit` | Pemeriksaan tipe (memerlukan TypeScript) |

## Konfigurasi

Salin `.env.example` ke `.env`.

| Variabel | Wajib | Keterangan |
|---|:---:|---|
| `SECRET_KEY` | Produksi | Minimal 32 karakter acak; dipakai untuk cookie sesi/CSRF. Di dev boleh kosong (secret acak sementara). |
| `APP_ENV` | Tidak | `development` (default) atau `production`. |
| `KONTER_DB` | Tidak | Lokasi SQLite; default `konter.sqlite`. |
| `PORT` | Tidak | Default 3000. |
| `HOST` | Tidak | Default `127.0.0.1`; gunakan `0.0.0.0` untuk LAN. |
| `COOKIE_SECURE` | Tidak | `1` hanya HTTPS; `0` untuk LAN HTTP. Default produksi `1`. |
| `TRUST_PROXY` | Tidak | `1` hanya jika di belakang reverse proxy tepercaya; default `0` (header X-Forwarded-For diabaikan). |
| `DEMO_PEMILIK_PASSWORD` / `DEMO_KASIR_PASSWORD` | Demo | Hanya untuk `demo:siapkan`, jangan dipakai produksi. |

## Struktur

```
src/
├── index.ts          # inisialisasi DB + server
├── app.ts            # perakitan Hono, middleware, rute
├── config.ts         # validasi konfigurasi/lingkungan
├── middleware/       # sesi, peran, CSRF
├── routes/           # controller HTTP
├── services/         # aturan bisnis
├── models/           # satu-satunya lapisan SQL
├── views/            # Hono JSX
├── db/               # koneksi, schema.sql, seed
├── lib/              # waktu, sesi, CSRF, backup, format
└── versi.ts
public/               # style.css, app.js
docs/                 # SRS, desain, pengujian, manual, UAT, Bab 4
tests/                # bun:test + cek_skema.ts
scripts/              # buat-pengguna, demo, cadangkan
```

`docs/desain/schema.sql` adalah satu-satunya sumber DDL. Jangan membuat `CREATE TABLE` di kode aplikasi.

## Pengujian

```bash
bun test
bun run cek:skema
bunx tsc --noEmit
```

Seluruh uji memakai `:memory:` dan tidak menyentuh `konter.sqlite`. Rincian hasil ada di `docs/pengujian/test-case.md`.

## Cadangan dan Pemulihan

Membuat cadangan (aplikasi boleh berjalan):

```bash
bun run cadangkan
# hasil: backup/konter-YYYY-MM-DD-HH-MM-SS.sqlite
```

Memulihkan:

1. Hentikan aplikasi.
2. Salin berkas cadangan ke lokasi `KONTER_DB`.
3. Hapus `konter.sqlite-wal` dan `konter.sqlite-shm` bila ada.
4. Jalankan aplikasi, lalu periksa `/kesehatan` dan data.

## Deployment (LAN/Komputer Toko)

1. Di komputer toko, buat `.env`:
   ```env
   APP_ENV=production
   SECRET_KEY=<64 karakter acak>
   KONTER_DB=D:\data\konter.sqlite
   PORT=3000
   HOST=0.0.0.0
   COOKIE_SECURE=0   # LAN HTTP; gunakan 1 bila HTTPS
   ```
2. Jalankan `bun start`.
3. Izinkan port 3000 di firewall Windows.
4. Buka `http://<IP-komputer>:3000` dari perangkat lain.
5. Jadwalkan `bun run cadangkan` harian dan simpan cadangan di lokasi terpisah.
6. Untuk internet, gunakan HTTPS/reverse proxy dan `COOKIE_SECURE=1`.

Detail ada di `docs/deployment.md`. Aplikasi tidak memakai server pengembangan Flask/Waitress; server produksi adalah Bun. Verifikasi dari komputer lain dan UAT tetap merupakan langkah manual.

## Keamanan

- Kata sandi Argon2id (`Bun.password`), bukan teks asli.
- Sesi cookie bertanda tangan, `HttpOnly`, `SameSite=Lax`.
- CSRF token pada semua POST; rate limit login 5 gagal/15 menit.
- CSP `'self'`, tanpa `unsafe-inline`; CSS/JS eksternal.
- Peran diperiksa di server pada GET dan POST, bukan hanya menu.
- Jangan commit `.env`, `konter.sqlite`, atau `backup/`.

## Dokumentasi

- `PRD.md`, `docs/srs.md`, `docs/uml/`
- `docs/desain/` (ERD, kamus data, normalisasi, schema, arsitektur, wireframe)
- `docs/pengujian/` (rencana uji, test case, laporan cacat, rencana UAT)
- `docs/manual-pengguna.md`
- `docs/temuan-keamanan.md`, `docs/laporan-temuan.md`
- `CHANGELOG.md`
- `jurnal-vibe-coding.md`

## Keterbatasan v1.0

- KF-12 salin struk WhatsApp belum dikerjakan (Could).
- UAT dengan klien belum dilaksanakan; rencana tersedia, hasil harus diisi jujur.
- Rate limit in-memory (hilang saat restart) dan aplikasi ditujukan untuk satu instance.
- Peer review/PR review oleh pihak lain bergantung pada sesi kelas; proyek dikerjakan individu.
