# Rencana Sprint RTM-2

> Disusun dari `docs/product-backlog.md` dan jobsheet 9–15. Proyek dikerjakan satu orang; status diperbarui setiap akhir jobsheet.

## Sprint 1 — Kerangka, transaksi, voucher (Selesai)

| Butir | KF | Status | Bukti |
|---|---|---|---|
| Skema, koneksi, seed | — | Selesai | `docs/desain/schema.sql`, `src/db/` |
| Deteksi operator + validasi nomor | KF-02 | Selesai | `src/services/operator.ts`, `tests/operator.test.ts` |
| Transaksi pulsa/data/token | KF-01 | Selesai | `src/routes/transaksi.ts`, `tests/transaksi.test.ts` |
| Penjualan voucher + stok | KF-03/04 | Selesai | `src/services/transaksi.ts`, uji stok |
| CRUD master voucher | KF-10 | Selesai (JS9) | `src/routes/voucher.ts`, `tests/voucher-crud.test.ts` |
| Ledger voucher masuk | KF-10 | Selesai (JS10) | `src/models/voucher-masuk.ts`, uji atomisitas |
| Pencarian/filter riwayat | KF-11 | Selesai (JS10) | `src/models/transaksi.ts`, `tests/pencarian.test.ts` |

## Sprint 2 — Antarmuka, autentikasi, validasi, review (Sedang berjalan)

| Butir | KF | Target | Status |
|---|---|---|---|
| Login/logout, hash, sesi | KF-08 | JS11 | Selesai |
| Otorisasi peran Pemilik/Kasir | KF-08 | JS11 | Selesai |
| UI sesuai wireframe, CSS/JS terpisah | KNF-03/04 | JS11 | Selesai |
| Validasi dua lapis, isian dipertahankan | KNF-01 | JS11 | Selesai |
| CSRF, rate limit, security header | KNF-05 | JS12 | Selesai |
| Code review dan temuan keamanan | — | JS12 | Selesai (review silang manual) |

## Sprint 3 — Pengujian, UAT, rilis (Rencana)

| Butir | KF | Target |
|---|---|---|
| ≥20 test case dan uji otomatis | Semua | JS13 |
| Laporan cacat dan perbaikan | — | JS13 |
| Rencana UAT | — | JS13 |
| Rilis v1.0.0, README, manual, backup | — | JS14 |
| UAT dengan klien | — | JS14 (manual) |

## Sprint 4 — Perbaikan, Bab 4, demo (Rencana)

| Butir | Target |
|---|---|
| Perbaikan hasil UAT | JS15 |
| Draf Bab 4 dan analisis jurnal | JS15 |
| Salindia dan latihan demo | JS15 |
| Progress check | JS15 (manual) |

## Checkpoint Minggu 12 (target)

Demo 5 menit: login Pemilik → catat transaksi → jual voucher → catat kasbon → filter riwayat → buka laporan → logout → login Kasir → tunjukkan 403 pada halaman Pemilik.

Fitur yang belum selesai bila checkpoint tiba: KF-12 (salin struk, Could) dan ekspor laporan; keduanya bukan penghalang rilis v1.0.
