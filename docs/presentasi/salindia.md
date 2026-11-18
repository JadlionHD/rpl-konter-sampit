# Salindia Presentasi — RPL Konter Sampit v1.0.0

> 12 slide, target 20 menit. Setiap slide satu pesan. Angka diambil dari dokumen; perbarui bila data berubah.

---

## Slide 1 — RPL Konter Sampit

Sistem pencatatan transaksi dan stok untuk warung konter pulsa/data di Sampit.

Hendra Gunawan · 24554010026 · Politeknik Sampit  
Rekayasa Perangkat Lunak — v1.0.0

---

## Slide 2 — Masalah klien

- Transaksi pulsa/voucher dicatat manual; rawan selisih.
- Stok voucher fisik dan tanggal expired mudah terlewat.
- Kasbon pelanggan sering lupa ditagih.
- Pemilik menghitung laba dengan kalkulator setiap tutup toko.

---

## Slide 3 — Tujuan dan ruang lingkup

11 KF Must/Should: transaksi, operator, stok voucher, rekap, kasbon, login/peran, expired, CRUD/stok voucher, filter.

KF-12 salin struk (Could) tidak termasuk v1.0.

---

## Slide 4 — Stack dan arsitektur

- Bun + Hono + `bun:sqlite` + Hono JSX + `bun:test`.
- Route → service → model → SQLite; view JSX terpisah.
- SQL hanya di `models/`; `schema.sql` satu-satunya DDL.
- CSS/JS di `public/`; CSP tanpa `unsafe-inline`.

---

## Slide 5 — Model data

Enam tabel: `pengguna`, `vouchers`, `voucher_masuk`, `pelanggan`, `transactions`, `debts`.

- `laba`/`status_bayar` dihitung, tidak disimpan.
- Stok berubah lewat penjualan (kurang) dan voucher masuk (tambah), atomik.
- `voucher_masuk` memberi jejak audit.

---

## Slide 6 — Alur kasir

Login → catat pulsa/data/token → jual voucher → catat kasbon → riwayat hari ini.

Demo singkat: transaksi valid, stok habis ditolak, kasbon tampil di buku kasbon.

---

## Slide 7 — Alur pemilik

Dashboard omzet/modal/laba → CRUD voucher → voucher masuk → laporan periode → filter riwayat.

Kasir tidak melihat laba/modal dan mendapat 403 pada halaman pemilik.

---

## Slide 8 — Keamanan

- Argon2id (`Bun.password`), pesan login seragam, hash dummy.
- Sesi cookie bertanda tangan, `HttpOnly`, `SameSite=Lax`.
- CSRF token pada semua POST; rate limit 5 gagal/15 menit.
- CSP `'self'`, `X-Frame-Options: DENY`, `nosniff`.
- Peran diperiksa di server untuk GET dan POST.

---

## Slide 9 — Pengujian

- **119 uji otomatis lulus, 0 gagal** (12 berkas).
- **23 kasus pelanggaran skema** ditolak.
- 50+ test case; 8 cacat diperbaiki (UTC, XSS, atomisitas, peran, dll.).
- Mutasi cek stok → 2 uji gagal, lalu kode dipulihkan.
- UAT dengan klien: **belum dilaksanakan**; rencana tersedia.

---

## Slide 10 — Rilis dan dokumentasi

- v1.0.0, `/kesehatan`, footer versi, `CHANGELOG.md`.
- README, manual 8 screenshot, deployment LAN, backup `VACUUM INTO`.
- Tag `v1.0.0` dan GitHub Release: langkah pengguna.

---

## Slide 11 — Analisis Jurnal Vibe Coding

33 entri: **25 Terima (76%) · 7 Ubah (21%) · 1 Tolak (3%)**.

2 `[Debug]`, 2 `[Galat: ...]`. Pelajaran: tinjauan manusia + uji lebih menentukan daripada proporsi “Terima”.

Keterbatasan: satu penulis, sampel kecil, kategori galat subjektif.

---

## Slide 12 — Keterbatasan dan langkah berikutnya

- UAT/deployment/review pihak lain belum.
- KF-12 dan ekspor laporan belum.
- Rate limit in-memory; satu instance.
- Rekomendasi: UAT, migrasi `pengguna_id` NOT NULL, uji aksesibilitas/kinerja.

Terima kasih — siap demo dan tanya jawab.
