# Skrip Presentasi ±20 Menit — RPL Konter Sampit

> Sesuaikan dengan waktu dosen. Siapkan aplikasi dan akun demo sebelum mulai. Jangan menampilkan kata sandi atau data pelanggan nyata.

| Waktu | Bagian | Poin yang diucapkan |
|---:|---|---|
| 0:00–1:30 | Pembuka | Perkenalan, proyek konter Sampit, tujuan presentasi. |
| 1:30–3:30 | Masalah | Pencatatan manual, selisih stok/expired, kasbon lupa, laba dihitung manual. Sebut klien dan batasan tanpa data pribadi. |
| 3:30–5:00 | Ruang lingkup | 11 KF Must/Should; KF-12 Could tidak termasuk. Sebut stack Bun/Hono/SQLite sebagai keputusan sadar. |
| 5:00–7:00 | Arsitektur & data | Route → service → model → SQLite; SQL hanya di model; enam tabel; `laba` dihitung; `voucher_masuk` sebagai ledger. |
| 7:00–9:00 | Demo pemilik | Login pemilik → dashboard → catat transaksi → jual voucher → voucher masuk → kasbon → laporan. Tunjukkan pesan sukses. |
| 9:00–10:30 | Demo kasir & 403 | Logout → login kasir → dashboard tanpa laba → buka `/laporan` → 403. Tekankan penjagaan server. |
| 10:30–12:30 | Keamanan | Argon2id, pesan login seragam, sesi cookie, CSRF, rate limit, CSP, peran GET/POST. |
| 12:30–14:30 | Pengujian | 119 uji lulus; 23 pelanggaran skema ditolak; 8 cacat; mutasi stok 2 uji gagal lalu pulih; UAT belum. |
| 14:30–16:00 | Rilis & dokumentasi | v1.0.0, health, CHANGELOG, README, manual 8 screenshot, backup; tag manual. |
| 16:00–18:00 | Jurnal & pembelajaran | 33 entri: 25/7/1; 2 Debug; pelajaran tinjauan manusia; keterbatasan analisis. |
| 18:00–19:30 | Keterbatasan & rencana | UAT/deployment/review belum; KF-12; rate limit in-memory; rekomendasi. |
| 19:30–20:00 | Penutup | Terima kasih; ajak tanya jawab; sebut repo/dokumentasi. |

## Persiapan teknis

1. `bun test` dan `bun run cek:skema` sebelum tampil.
2. `bun dev`, login pemilik, buka tab beranda dan laporan.
3. Siapkan tab kedua untuk kasir/403.
4. Siapkan cadangan screenshot (`docs/gambar/`) bila demo gagal.
5. Jangan menampilkan `.env`, `konter.sqlite`, atau kata sandi.

## Kalimat transisi

- “Dari masalah pencatatan manual, kami menetapkan 11 kebutuhan yang harus diselesaikan.”
- “Arsitektur memisahkan aturan bisnis dari SQL agar perubahan satu fitur tidak merusak fitur lain.”
- “Demo berikut menunjukkan alur kasir, lalu alur pemilik.”
- “Keamanan bukan hanya menyembunyikan tombol; server memeriksa peran pada GET dan POST.”
- “Pengujian menunjukkan aplikasi berfungsi, tetapi UAT dengan klien tetap harus dilakukan.”
