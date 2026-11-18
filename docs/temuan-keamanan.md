# Temuan Keamanan — Jobsheet 11

> Catatan temuan yang belum diselesaikan pada JS11 dan menjadi agenda Jobsheet 12. Status diperbarui saat perbaikan.

| ID | Temuan | Kategori OWASP | Dampak | Status | Rencana |
|---|---|---|---|---|---|
| T-01 | Form POST belum memiliki token CSRF | A01 Broken Access Control | Permintaan lintas situs dapat memakai sesi pengguna yang sedang login | **Diperbaiki (JS12)** | Token di cookie bertanda tangan + hidden input; diverifikasi di semua POST |
| T-02 | Belum ada batas percobaan login | A07 Identification/Auth Failures | Penyerang dapat menebak kata sandi tanpa hambatan | **Diperbaiki (JS12)** | 5 gagal/15 menit per username+IP, pesan generik, reset saat sukses |
| T-03 | Belum ada security header/CSP | A02 Security Misconfiguration | Risiko XSS/clickjacking lebih besar bila ada celah | **Diperbaiki (JS12)** | `secureHeaders` + CSP `'self'`; CSS/JS dipisah, tanpa `unsafe-inline` |
| T-04 | Cookie `Secure` hanya aktif saat HTTPS/`COOKIE_SECURE=1` | A02 Security Misconfiguration | Cookie dapat terkirim lewat HTTP di jaringan terbuka | **Diterima (terdokumentasi)** | Default produksi `1`; LAN HTTP memakai `0` secara sadar dan didokumentasikan |
| T-05 | Pesan sukses/galat lewat query string dapat dipalsukan pengguna | A03 Injection (rendah) | Teks pesan dapat dikarang, tetapi di-escape JSX dan bukan data sensitif | **Diterima (rendah)** | Bila perlu, ganti dengan flash cookie bertanda tangan pada JS12/13 |
| T-06 | Belum ada rotasi ID sesi server-side | A07 Identification/Auth Failures | Cookie lama tetap valid sampai kedaluwarsa | **Diterima (sebagian)** | Sesi berupa cookie bertanda tangan berisi `pengguna_id`; login menulis ulang cookie; role dibaca dari DB setiap request |
| T-07 | `transactions.pengguna_id` masih nullable | — | Baris lama/sebelum login dapat tanpa pencatat | **Diterima (transisi)** | Aplikasi selalu mengisi dari sesi; kolom dibuat NOT NULL saat migrasi rilis jika data lama sudah bersih |

## Yang sudah diterapkan

- Kata sandi disimpan dengan `Bun.password` (Argon2id), bukan teks asli/MD5/SHA.
- Pesan login sama untuk username tidak ada dan kata sandi salah; hash dummy diverifikasi saat username tidak ada.
- Sesi hanya berisi `pengguna_id`; cookie `HttpOnly` dan `SameSite=Lax`.
- Peran dibaca dari basis data pada setiap permintaan; akun nonaktif langsung kehilangan sesi.
- Semua rute POST pengelolaan voucher, voucher masuk, dan laporan dijaga `wajibPeran("pemilik")`, bukan hanya tautannya.
- `next` hanya menerima path internal; `//` dan `\` ditolak.
- CSS dan JavaScript dipindahkan ke `public/` agar siap CSP tanpa `unsafe-inline`.
