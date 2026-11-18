# Changelog — RPL Konter Sampit

Semua perubahan penting dicatat di sini. Format mengikuti Keep a Changelog dan Semantic Versioning.

## [1.0.0] — 2026-11-18

### Ditambahkan
- Formulir transaksi pulsa, paket data, dan token listrik dengan validasi nomor 10–13 digit.
- Deteksi operator otomatis dari prefix nomor (Telkomsel, Indosat, XL Axiata, Tri, Smartfren) di server.
- Penjualan voucher fisik dengan pengurangan stok otomatis dan penolakan stok habis.
- CRUD master voucher: daftar, tambah, ubah, hapus, serta penjagaan relasi.
- Ledger voucher masuk dan penambahan stok atomik.
- Pencatatan kasbon, buku kasbon, penanda lewat tempo, dan pelunasan.
- Rekap omzet, modal, dan laba harian; halaman laporan periode untuk Pemilik.
- Pencarian dan filter riwayat berdasarkan tanggal, operator, jenis, status, dan kata kunci.
- Autentikasi login/logout, hash Argon2id, sesi bertanda tangan, dan otorisasi Pemilik/Kasir.
- Token CSRF pada semua form POST, rate limit login, security header, dan CSP tanpa `unsafe-inline`.
- Skrip pembuatan akun (`buat:pengguna`), penyiapan demo (`demo:siapkan`), dan pencadangan (`cadangkan`).
- Dokumentasi: PRD, SRS, UML, desain/ERD, wireframe, rencana uji, test case, laporan cacat, UAT, manual, dan Bab 4.

### Diubah
- Struktur `src/` menjadi `routes/`, `services/`, `models/`, `views/`, `db/`, `lib/`, dan `middleware/`.
- CSS dan JavaScript dipindahkan dari view ke `public/`.
- Dashboard menyesuaikan statistik menurut peran; kasir tidak melihat modal/laba.
- Waktu transaksi dan rekap memakai zona Asia/Jakarta.

### Diperbaiki
- Rekap dini hari yang sebelumnya memakai tanggal UTC.
- Isian form yang hilang saat validasi gagal.
- Penanda kedaluwarsa voucher yang sebelumnya hardcoded.
- Form ubah voucher yang berpotensi mengubah stok langsung.
- Middleware peran yang sempat mencocokkan rute lain.

### Keamanan
- XSS pada tampilan lama ditutup dengan Hono JSX dan auto-escape.
- Uji otomatis tidak lagi menulis ke `konter.sqlite`.
- Stok dan ledger ditulis dalam satu transaksi basis data.
- Pesan login seragam; akun nonaktif ditolak setelah kredensial benar.
- `next` hanya menerima path internal; cookie `HttpOnly`, `SameSite=Lax`, dan `Secure` sesuai lingkungan.

### Tidak termasuk
- KF-12 salin struk WhatsApp (Could) — belum diimplementasikan.
- Ekspor CSV/Excel — tidak ada di SRS.
- Rate limit lintas proses/persisten — batas in-memory.
- Pemulihan kata sandi mandiri — akun dibuat pemilik lewat skrip.
