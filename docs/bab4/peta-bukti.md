# Peta Bukti Bab 4 — RPL Konter Sampit

| Subbab | Isi | Bukti utama | Status |
|---|---|---|---|
| 4.1 Lingkungan Implementasi | Perangkat, stack, konfigurasi, alat AI | `README.md`, `package.json`, `.env.example`, `src/config.ts`, jurnal | Selesai |
| 4.2 Implementasi Sistem | Struktur proyek, fitur, cuplikan kode, tampilan | `src/`, `public/`, `docs/gambar/`, kode di bawah | Selesai |
| 4.3 Tinjauan Kode dan Keamanan | Temuan, perbaikan, risiko tersisa | `docs/laporan-temuan.md`, `docs/temuan-keamanan.md`, `tests/keamanan.test.ts` | Selesai |
| 4.4 Pengujian | Uji otomatis, skema, cacat, mutasi, UAT | `docs/pengujian/`, `tests/`, keluaran `bun test` | Selesai (UAT manual belum) |
| 4.5 Rilis dan Dokumentasi | Versi, changelog, README, manual, backup | `CHANGELOG.md`, `docs/rilis/v1.0.0.md`, `docs/manual-pengguna.md` | Selesai (tag manual) |
| 4.6 Pembahasan | Pemenuhan KF, analisis jurnal, keterbatasan | Matriks SRS, `jurnal-vibe-coding.md`, rekap jurnal | Selesai |

## Angka sumber

- Uji otomatis: **119 lulus, 0 gagal** (`bun test`, 12 berkas).
- Skema: **23 kasus pelanggaran ditolak** (`bun run cek:skema`).
- Cacat: **8** (DEF-01…DEF-08).
- Jurnal: **33 entri**, 25 Terima / 7 Ubah / 1 Tolak; 2 `[Debug]`, 2 `[Galat: ...]`.
- Screenshot: 8 berkas di `docs/gambar/`.

## Batas yang harus diisi pengguna

- Hash commit/tautan PR setelah commit.
- Tanggal/lingkungan deployment nyata.
- Hasil UAT setelah sesi klien.
- Konversi laporan ke `.docx`/PDF.
