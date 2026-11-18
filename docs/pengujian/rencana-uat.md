# Rencana User Acceptance Test (UAT) — RPL Konter Sampit

> Jobsheet 13. UAT **belum dilaksanakan**; dokumen ini adalah rencana. Hasil aktual diisi di `docs/uat/hasil-uat.md` setelah sesi dengan klien. Jangan mengarang hasil.

## 1. Tujuan

Memastikan pemilik dan kasir dapat menyelesaikan tugas harian konter dengan aplikasi, tanpa bantuan teknis, dan mencatat umpan balik yang dapat ditindaklanjuti.

## 2. Peserta dan peran

| Peran | Peserta | Tugas yang diuji |
|---|---|---|
| Pemilik konter | Klien (Bpk. H) | Stok voucher, voucher masuk, laporan, akun kasir |
| Kasir | Klien (Sdr. R) atau pemeran | Transaksi pulsa/data/token, jual voucher, kasbon, riwayat hari ini |
| Fasilitator | Hendra | Menyiapkan data, mengamati, mencatat |
| Pencatat | Hendra | Mengisi lembar UAT dan menghitung skor |

## 3. Lingkungan dan data

- Komputer/laptop dengan Bun, aplikasi berjalan di `http://localhost:3000` atau alamat LAN.
- Akun demo: `pemilik` dan `kasir` (kata sandi karangan, dibuat lewat `bun run buat:pengguna`).
- Data karangan: 3 voucher, 2 pelanggan kasbon, 5 transaksi.
- Tidak memakai data pelanggan nyata. Screenshot disensor bila perlu.

## 4. Skenario UAT

| ID | Peran | Skenario | Langkah singkat | Kriteria lulus |
|---|---|---|---|---|
| UAT-01 | Pemilik | Login/logout | Masuk dengan akun pemilik, keluar | Berhasil masuk; menu lengkap; logout mengakhiri sesi |
| UAT-02 | Kasir | Login dan batas peran | Masuk sebagai kasir, buka `/laporan` | Dashboard tanpa laba/modal; halaman laporan 403 |
| UAT-03 | Kasir | Catat transaksi pulsa | Isi nomor, pilih jenis, modal, jual, simpan | Tersimpan; muncul di riwayat; pesan sukses |
| UAT-04 | Kasir | Jual voucher dan stok habis | Jual voucher stok 1; coba jual saat stok 0 | Stok berkurang; stok habis ditolak dengan pesan jelas |
| UAT-05 | Pemilik | Tambah stok voucher | Buka Voucher Masuk, pilih voucher, jumlah 10 | Stok bertambah 10; baris ledger muncul |
| UAT-06 | Kasir | Catat dan lunasi kasbon | Transaksi kasbon, buka buku kasbon, tandai lunas | Piutang tercatat; status berubah menjadi lunas |
| UAT-07 | Pemilik | Filter riwayat | Pilih tanggal dan operator, cari | Hasil sesuai filter; keadaan kosong jelas |
| UAT-08 | Pemilik | Laporan | Pilih rentang tanggal | Omzet/modal/laba sesuai transaksi |
| UAT-09 | Keduanya | Tampilan ponsel | Buka di lebar 360 px | Tidak ada guliran horizontal; tombol dapat ditekan |
| UAT-10 | Keduanya | Pesan galat | Kirim nomor pendek/harga jual < modal | Pesan spesifik; isian tidak hilang |

## 5. Instrumen

### 5.1 Lembar skenario

`docs/uat/lembar-uat.md`: ID, langkah, hasil yang diharapkan, hasil aktual, status (Lulus/Gagal), catatan.

### 5.2 Skor kegunaan (SUS, 10 pertanyaan)

Gunakan skala 1 (sangat tidak setuju) sampai 5 (sangat setuju). Kalimat disesuaikan konteks konter:

1. Saya ingin sering memakai aplikasi ini untuk pekerjaan konter.
2. Aplikasi ini terasa terlalu rumit.
3. Aplikasi ini mudah digunakan.
4. Saya membutuhkan bantuan teknis untuk memakai aplikasi ini.
5. Fitur-fitur aplikasi berjalan sesuai harapan.
6. Terlalu banyak ketidakkonsistenan di aplikasi ini.
7. Saya percaya orang lain dapat belajar memakai aplikasi ini dengan cepat.
8. Aplikasi ini terasa merepotkan saat dipakai.
9. Saya merasa percaya diri saat memakai aplikasi ini.
10. Saya perlu belajar banyak hal sebelum bisa memakai aplikasi ini.

Hitung skor SUS dengan rumus standar; tulis keterbatasan (jumlah peserta kecil, bukan laboratorium). Jangan mengklaim skor sebelum sesi.

## 6. Kriteria lulus

- Semua skenario Must (UAT-01…UAT-08) berstatus Lulus atau memiliki catatan perbaikan yang disepakati.
- Tidak ada kehilangan data atau kebocoran data pribadi selama sesi.
- Peserta dapat menyelesaikan tugas tanpa pendampingan teknis lebih dari 1 kali intervensi.
- Umpan balik penting dicatat dan ditriase.

## 7. Triase umpan balik

| Keputusan | Arti | Tindakan |
|---|---|---|
| Perbaiki | Menghalangi tugas atau risiko data | Masuk Sprint 4, uji regresi |
| Tunda | Berguna tetapi tidak menghalangi | Catat di backlog |
| Tolak | Di luar SRS/anggaran | Catat alasan |

## 8. Etika dan privasi

- Gunakan data karangan; jangan memotret data pelanggan nyata.
- Minta izin sebelum merekam suara/gambar.
- Simpan hasil UAT di repositori tanpa kata sandi atau data pribadi.
- Sesi UAT dijadwalkan bersama klien; jangan menulis tanggal yang belum disepakati.
