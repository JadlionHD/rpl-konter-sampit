# Kartu Progress Check — RTM-2

**Nama:** Hendra Gunawan · **NIM:** 24554010026  
**Proyek:** RPL Konter Sampit  
**Versi:** 1.0.0  
**Tanggal:** 18 November 2026

## Status aplikasi

| Aspek | Status | Bukti |
|---|---|---|
| KF Must/Should (KF-01–KF-11) | Selesai | 119 uji; `docs/pengujian/test-case.md` |
| KF-12 (Could) | Tidak dikerjakan | `CHANGELOG.md` |
| Autentikasi ≥2 peran | Selesai | `tests/auth.test.ts` |
| Validasi masukan | Selesai | uji transaksi/voucher |
| ERD + skema | Selesai | `docs/desain/` |
| Uji otomatis ≥8 | Selesai (119) | `bun test` |
| UAT klien | **Belum** | `docs/uat/hasil-uat.md` |
| Rilis/tag v1.0.0 | Persiapan selesai | `docs/rilis/v1.0.0.md` |
| README + manual | Selesai | `README.md`, `docs/manual-pengguna.md` |
| Jurnal ≥30 | Selesai (33) | `jurnal-vibe-coding.md` |

## Demo 5 menit

1. Login pemilik.
2. Catat transaksi pulsa.
3. Jual voucher; coba stok habis.
4. Voucher masuk 10 pcs.
5. Catat kasbon; tandai lunas.
6. Filter riwayat; buka laporan.
7. Logout; login kasir; buka `/laporan` → 403.

## Item manual yang harus diselesaikan

- [ ] UAT dengan pemilik/kasir, isi `docs/uat/hasil-uat.md`.
- [ ] Review silang/PR review; isi `docs/review/lembar-tinjauan-silang.md`.
- [ ] Deployment di komputer klien/LAN; verifikasi dari perangkat lain.
- [ ] Konversi laporan ke `.docx`/PDF; kumpulkan LMS.
- [ ] Commit/PR; tag `v1.0.0`; GitHub Release.
- [ ] Perbarui hash commit/tautan PR di laporan.

## Catatan dosen

____________________________________________________________
