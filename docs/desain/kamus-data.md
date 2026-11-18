# Kamus Data — RPL Konter Sampit

> Jobsheet 6, Langkah 6. Kamus data ini menjadi acuan `docs/desain/schema.sql`, kode aplikasi, dan pengujian. Nama tabel mengikuti PRD “Data Awal” agar mudah ditelusuri; nilai uang dalam rupiah bulat (`INTEGER`), tanggal dalam format ISO.

## 1. `pengguna` — akun dan peran (KF-08, UC-05)

| Kolom | Tipe | Wajib | Kunci | Aturan nilai | Sumber |
|---|---|:---:|---|---|---|
| `id` | INTEGER | Ya | PK | Auto increment, > 0 | — |
| `username` | TEXT | Ya | UK | 3–30 karakter; hanya huruf, angka, garis bawah; unik | KF-08 |
| `password_hash` | TEXT | Ya | — | Hash kata sandi (Argon2id/PBKDF2 via `Bun.password`); **bukan** teks asli | KF-08, KNF-05 |
| `peran` | TEXT | Ya | — | `pemilik` atau `kasir` | KF-08 |
| `aktif` | INTEGER | Ya | — | `1` aktif, `0` dinonaktifkan; bawaan `1` | UC-05 pengecualian 3b |

## 2. `vouchers` — inventaris voucher fisik (KF-03, KF-04, KF-09, KF-10)

| Kolom | Tipe | Wajib | Kunci | Aturan nilai | Sumber |
|---|---|:---:|---|---|---|
| `id` | INTEGER | Ya | PK | Auto increment | — |
| `nama_paket` | TEXT | Ya | UK* | Tidak kosong; unik bersama `operator` | KF-10 |
| `operator` | TEXT | Ya | UK* | Tidak kosong (Telkomsel, Indosat, XL Axiata, Tri (3), Smartfren) | KF-10 |
| `stok` | INTEGER | Ya | — | ≥ 0; bawaan 0; berkurang lewat transaksi voucher | KF-03, KF-04 |
| `harga_modal` | INTEGER | Ya | — | ≥ 0; rupiah tanpa desimal | KF-10 |
| `harga_jual` | INTEGER | Ya | — | ≥ `harga_modal` | KF-10 |
| `tanggal_expired` | TEXT | Ya | — | `YYYY-MM-DD` dan tanggal kalender valid | KF-09, KF-10 |

\* Kunci unik gabungan `(operator, nama_paket)`.

## 3. `voucher_masuk` — ledger penambahan stok (KF-10)

| Kolom | Tipe | Wajib | Kunci | Aturan nilai | Sumber |
|---|---|:---:|---|---|---|
| `id` | INTEGER | Ya | PK | Auto increment | — |
| `voucher_id` | INTEGER | Ya | FK → `vouchers.id` | Voucher induk harus ada | KF-10 |
| `jumlah` | INTEGER | Ya | — | Bilangan bulat > 0 | KF-10 |
| `tanggal` | TEXT | Ya | — | `YYYY-MM-DD` dan tanggal kalender valid | KF-10 |
| `pengguna_id` | INTEGER | Tidak* | FK → `pengguna.id` | Petugas yang mencatat | KF-08 (turunan) |

\* Opsional sampai autentikasi tersedia; setelah Jobsheet 11 diisi dari sesi. Penambahan stok dan baris ledger disimpan dalam **satu transaksi basis data**, lalu `vouchers.stok` bertambah sebesar `jumlah`.

## 4. `pelanggan` — pemilik kasbon (KF-06)

| Kolom | Tipe | Wajib | Kunci | Aturan nilai | Sumber |
|---|---|:---:|---|---|---|
| `id` | INTEGER | Ya | PK | Auto increment | — |
| `nama` | TEXT | Ya | UK* | Tidak kosong; nama panggilan pelanggan (boleh inisial) | KF-06 |
| `kontak` | TEXT | Tidak | UK* | Bila diisi: 10–13 digit angka; unik bersama `nama` | KF-06 |

\* Kunci unik gabungan `(nama, kontak)`; `NULL` kontak diperbolehkan.

## 5. `transactions` — satu baris = satu item terjual (KF-01, KF-02, KF-03, KF-06)

| Kolom | Tipe | Wajib | Kunci | Aturan nilai | Sumber |
|---|---|:---:|---|---|---|
| `id` | INTEGER | Ya | PK | Auto increment | — |
| `waktu` | TEXT | Ya | — | `YYYY-MM-DD HH:MM:SS` waktu lokal (Asia/Jakarta) | KF-01 |
| `jenis` | TEXT | Ya | — | `pulsa`, `data`, `token`, atau `voucher` | KF-01 |
| `nomor_tujuan` | TEXT | Kondisional | — | Wajib untuk non-voucher; 10–13 digit angka; `NULL` untuk voucher | KF-01, KF-02 |
| `operator` | TEXT | Kondisional | — | Wajib untuk non-voucher; hasil deteksi prefix; `PLN` untuk token; `NULL` untuk voucher | KF-02 |
| `voucher_id` | INTEGER | Kondisional | FK → `vouchers.id` | Wajib untuk `jenis='voucher'`; `NULL` untuk lainnya | KF-03, KF-04 |
| `jumlah` | INTEGER | Ya | — | > 0; tepat `1` untuk non-voucher; jumlah pcs untuk voucher | KF-03 |
| `harga_modal` | INTEGER | Ya | — | ≥ 0; untuk voucher diambil dari master saat transaksi | KF-01, KF-05 |
| `harga_jual` | INTEGER | Ya | — | ≥ `harga_modal` | KF-01, KF-05 |
| `metode_bayar` | TEXT | Ya | — | `tunai`, `qris`, atau `kasbon` | KF-01, KF-06 |
| `pengguna_id` | INTEGER | Tidak* | FK → `pengguna.id` | Jejak audit; wajib setelah login JS11 | KF-08 (turunan) |

\* Opsional sementara sampai autentikasi dibangun pada Jobsheet 11; lihat `normalisasi.md` bagian 6.

## 6. `debts` — buku kasbon (KF-06, KF-07)

| Kolom | Tipe | Wajib | Kunci | Aturan nilai | Sumber |
|---|---|:---:|---|---|---|
| `id` | INTEGER | Ya | PK | Auto increment | — |
| `transaction_id` | INTEGER | Ya | UK, FK → `transactions.id` | Unik: satu transaksi hanya menimbulkan satu kasbon; transaksi induk harus `metode_bayar='kasbon'` (dijaga layanan) | KF-06 |
| `pelanggan_id` | INTEGER | Ya | FK → `pelanggan.id` | Pelanggan pemilik kasbon | KF-06 |
| `tanggal_tempo` | TEXT | Ya | — | `YYYY-MM-DD` dan tanggal kalender valid | KF-06 |
| `status` | TEXT | Ya | — | `belum_lunas` (bawaan) atau `lunas` | KF-06, KF-07 |
| `tanggal_lunas` | TEXT | Kondisional | — | Wajib bila `status='lunas'`; `NULL` bila `belum_lunas`; format `YYYY-MM-DD` | KF-07 |

## 7. Nilai turunan (tidak disimpan sebagai kolom)

| Nilai | Cara memperoleh | Dipakai pada |
|---|---|---|
| Laba per transaksi | `harga_jual - harga_modal` | Riwayat dan rekap |
| Omzet harian | `SUM(harga_jual)` untuk tanggal berjalan | KF-05, dashboard |
| Modal harian | `SUM(harga_modal)` untuk tanggal berjalan | KF-05, dashboard |
| Laba kotor harian | `SUM(harga_jual - harga_modal)` | KF-05, dashboard |
| Total piutang | `SUM(transactions.harga_jual)` dari kasbon `belum_lunas` | KF-06 |
| Status bayar tampilan | `lunas` bila tidak ada baris `debts`, selain itu `debts.status` | Riwayat transaksi |
| Sisa hari expired | `tanggal_expired - hari ini` | KF-09 |
| Status stok voucher | `stok = 0` → habis; selain itu jumlah pcs | KF-04 |

## 8. Aturan lintas tabel yang dijaga aplikasi

1. Baris `debts` hanya dibuat untuk transaksi dengan `metode_bayar='kasbon'` (tidak dapat dinyatakan sebagai `CHECK` lintas tabel, sehingga divalidasi di `src/services/transaksi.ts`).
2. Stok voucher hanya boleh berubah melalui transaksi penjualan (berkurang) dan `voucher_masuk` (bertambah), bukan melalui form ubah biasa. Saldo `vouchers.stok` dan ledger harus konsisten; pengurangan/penambahan dilakukan atomik.
3. Transaksi voucher yang stoknya 0 atau kurang dari jumlah yang diminta ditolak sebelum `INSERT`.
4. Pelunasan kasbon mengisi `status='lunas'` **dan** `tanggal_lunas` dalam satu pernyataan.
5. Penghapusan transaksi yang sudah memiliki kasbon ditolak oleh kunci asing (transaksi tidak dihapus; koreksi dilakukan lewat mekanisme terpisah pada versi berikutnya).
