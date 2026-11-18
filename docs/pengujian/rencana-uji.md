# Rencana Pengujian — RPL Konter Sampit

> Jobsheet 7, Sesi 2. Dokumen ini menjadi acuan pengujian Jobsheet 13. Setiap test case mengacu ke satu kebutuhan di `docs/srs.md`; matriks pada bagian 6 memastikan tidak ada KF Must/Should tanpa uji. Data uji seluruhnya karangan.

## 1. Tujuan dan ruang lingkup

Menguji kebutuhan fungsional **Must** (`KF-01`–`KF-08`) dan **Should** (`KF-09`–`KF-11`), serta kebutuhan **Could** `KF-12` bila waktu memungkinkan. Kebutuhan non-fungsional yang diperiksa: kegunaan (KNF-03/KNF-04) dan keamanan dasar (KNF-05).

Di luar lingkup: integrasi gateway pulsa, aplikasi native, ekspor CSV (tidak ada di SRS), dan multi-item per nota (asumsi satu item per transaksi).

## 2. Strategi

| Lapis | Cara | Alat | Penanggung jawab |
|---|---|---|---|
| Black-box manual | Jalankan skenario dari kriteria penerimaan PRD | Peramban + data karangan | Hendra |
| Otomatis | Uji unit logika dan uji alur HTTP pada DB in-memory | `bun test`, `app.request()` | Hendra |
| Skema | Periksa DDL dan pelanggaran batasan | `bun run cek:skema` | Hendra |
| UAT | Pemilik/kasir menjalankan tugas nyata | Lembar UAT | Hendra + klien (manual) |

## 3. Lingkungan dan data uji

- **Perangkat:** Windows, Bun 1.4+, peramban Edge/Chrome; lebar uji 1440 px dan 360 px.
- **Basis data:** `:memory:` untuk uji otomatis; `konter.sqlite` hanya untuk demo.
- **Data karangan:** voucher “Telkomsel Uji 1GB”, pelanggan “Pak Andi”, nomor `081234567890`, `081399887766`, token `14012345678`.
- **Larangan:** tidak memakai nama/nomor pelanggan nyata, kata sandi nyata, atau data klien pada screenshot.

## 4. Kriteria lulus

1. Semua test case berprioritas **Must** berstatus Lulus.
2. Tidak ada cacat berat (aplikasi tidak bisa dipakai / data hilang) yang terbuka.
3. Uji otomatis `bun test` lulus 100%; `bun run cek:skema` lulus.
4. Setiap KF Must/Should memiliki minimal satu TC yang terlacak.
5. UAT minimal 80% skenario utama berhasil tanpa bantuan teknis.

## 5. Daftar test case

Kolom **Hasil** diisi pada Jobsheet 13 setelah eksekusi. Teknik: **EP** = partisi ekuivalen, **BVA** = nilai batas, **Inv** = kasus tidak valid/pelanggaran.

### 5.1 Transaksi dan operator

| ID | KF | Prasyarat / data | Langkah | Hasil diharapkan | Teknik |
|---|---|---|---|---|---|
| TC-TRX-01 | KF-01 | Nomor `081234567890`, modal 10500, jual 12000, tunai | Isi form transaksi → Simpan | Transaksi tersimpan; rekap omzet +12000, laba +1500; redirect PRG | EP valid |
| TC-TRX-02 | KF-01 | Nomor `0812` | Kirim form | Ditolak; pesan “Nomor HP tidak valid”; tidak ada baris | Inv / BVA bawah |
| TC-TRX-03 | KF-01 | Nomor 14 digit | Kirim form | Ditolak; pesan validasi | BVA atas |
| TC-TRX-04 | KF-01 | Modal 10000, jual 9000 | Kirim form | Ditolak; “Harga jual minimal sama dengan harga modal” | Inv |
| TC-TRX-05 | KF-01 | Jual `abc` | Kirim form | Ditolak; pesan angka; isian tidak hilang | Inv |
| TC-TRX-06 | KF-01 | Jenis token, ID `14012345678` | Kirim form | Operator `PLN`; transaksi tersimpan | EP valid |
| TC-OPR-01 | KF-02 | `081234567890` | Isi nomor | Operator terdeteksi Telkomsel | EP valid |
| TC-OPR-02 | KF-02 | `6285211223344` | Isi nomor | Dinormalisasi ke `0852…`; Telkomsel | EP valid |
| TC-OPR-03 | KF-02 | `080012345678` | Isi nomor | Operator “Lainnya” atau pilihan manual | Inv/EP |
| TC-OPR-04 | KF-02 | Nomor tepat 10 digit | Kirim | Diterima | BVA tepat |
| TC-OPR-05 | KF-02 | Nomor tepat 13 digit | Kirim | Diterima | BVA tepat |

### 5.2 Stok dan voucher

| ID | KF | Prasyarat / data | Langkah | Hasil diharapkan | Teknik |
|---|---|---|---|---|---|
| TC-STK-01 | KF-03 | Voucher stok 2; jual 1 | Transaksi voucher | Stok menjadi 1; transaksi tersimpan | EP valid |
| TC-STK-02 | KF-04 | Voucher stok 0 | Transaksi voucher | Ditolak “Stok voucher habis!”; stok tetap 0 | BVA bawah |
| TC-STK-03 | KF-03 | Voucher stok 2; jual 2 | Transaksi voucher | Tersimpan; stok menjadi 0 | BVA tepat |
| TC-STK-04 | KF-04 | Voucher stok 2; jual 3 | Transaksi voucher | Ditolak “Stok tidak cukup: tersedia 2 pcs.”; stok tetap 2 | BVA atas |
| TC-STK-05 | KF-04 | Voucher stok 2; jumlah 0 / -1 | Transaksi voucher | Ditolak; pesan jumlah > 0 | Inv/BVA |
| TC-VCR-01 | KF-10 | Form voucher valid | Tambah voucher | Tersimpan; tampil di daftar | EP valid |
| TC-VCR-02 | KF-10 | Operator+nama paket sudah ada | Tambah voucher | Ditolak “sudah ada”; tidak ada duplikat | Inv |
| TC-VCR-03 | KF-10 | Voucher ada | Ubah harga/expired | Berubah; stok tidak berubah | EP valid |
| TC-VCR-04 | KF-10 | Voucher tidak dipakai transaksi | Hapus (POST) | Terhapus; pesan sukses | EP valid |
| TC-VCR-05 | KF-10 | Voucher dipakai transaksi | Hapus (POST) | Ditolak dengan pesan; data tetap | Inv FK |
| TC-VCR-06 | KF-10 | Harga jual < modal | Simpan | Ditolak; pesan validasi | Inv |
| TC-VCR-07 | KF-10 | Nama paket kosong | Simpan | Ditolak; isian tetap | Inv |
| TC-VCR-08 | KF-10 | ID `999` | Buka `/voucher/999/ubah` | Halaman 404 | Inv |
| TC-VCR-09 | KF-10 | Voucher stok 5 | Voucher masuk 20 | Stok menjadi 25; baris ledger muncul | EP valid |
| TC-VMS-01 | KF-10 | Voucher id 1 | Tambah voucher masuk 20 | Stok +20; daftar JOIN menampilkan nama | EP valid |
| TC-VMS-02 | KF-10 | Voucher id 999 | Tambah voucher masuk | Ditolak; tidak ada baris ledger | Inv FK |
| TC-VMS-03 | KF-10 | Jumlah 0 / negatif / `abc` | Tambah voucher masuk | Ditolak; stok tetap | Inv/BVA |
| TC-VMS-04 | KF-10 | Tanggal `18-11-2026` | Tambah voucher masuk | Ditolak; format ISO | Inv |
| TC-VMS-05 | KF-10 | Voucher valid, tanggal tidak valid | Simpan | Rollback total: tidak ada ledger, stok tetap | Atomisitas |

### 5.3 Kasbon dan rekap

| ID | KF | Prasyarat / data | Langkah | Hasil diharapkan | Teknik |
|---|---|---|---|---|---|
| TC-KSB-01 | KF-06 | Metode kasbon, nama “Pak Andi”, tempo +7 hari | Simpan transaksi | Kasbon aktif muncul; piutang bertambah | EP valid |
| TC-KSB-02 | KF-07 | Kasbon belum lunas | Tandai lunas | Status `lunas`, tanggal lunas terisi | EP valid |
| TC-KSB-03 | KF-07 | Kasbon sudah lunas | Tandai lunas lagi | Ditolak “Kasbon sudah lunas.” | Inv |
| TC-KSB-04 | KF-06 | Tempo kemarin | Buka buku kasbon | Ditandai lewat tempo | BVA |
| TC-KSB-05 | KF-06 | Metode kasbon, nama kosong | Simpan | Ditolak; tidak ada kasbon | Inv |
| TC-RPT-01 | KF-05 | Dua transaksi (jual 12000/25000; modal 10500/22000) | Buka dashboard | Omzet 37000, modal 32500, laba 4500 | EP valid |
| TC-RPT-02 | KF-05 | Belum ada transaksi | Buka dashboard | Omzet/modal/laba 0; keadaan kosong | BVA |
| TC-RPT-03 | KF-05/KNF-05 | Login kasir | Buka dashboard | Modal/laba tidak tampil | Otorisasi |

### 5.4 Autentikasi, otorisasi, dan keamanan

| ID | KF | Prasyarat / data | Langkah | Hasil diharapkan | Teknik |
|---|---|---|---|---|---|
| TC-SEC-01 | KF-08 | Akun pemilik valid | Login | Masuk; sesi dibuat; dashboard tampil | EP valid |
| TC-SEC-02 | KF-08 | Kata sandi salah | Login | “Nama pengguna atau kata sandi salah.”; tidak masuk | Inv |
| TC-SEC-03 | KF-08 | Username tidak ada | Login | Pesan sama persis dengan TC-SEC-02 | Inv/keamanan |
| TC-SEC-04 | KF-08 | Akun `aktif=0`, kredensial benar | Login | Ditolak; pesan akun dinonaktifkan | Inv |
| TC-SEC-05 | KF-08 | Tamu | Buka `/voucher` | Dialihkan ke login dengan `next` internal | Otorisasi |
| TC-SEC-06 | KF-08 | Login kasir | Buka `/voucher/tambah` langsung | 403; halaman akses ditolak | Otorisasi |
| TC-SEC-07 | KF-08 | Login kasir | POST hapus voucher via alat pengembang | 403; data tidak berubah | Otorisasi POST |
| TC-SEC-08 | KF-08 | Tamu | `/login?next=https://jahat.example` | Tidak dialihkan ke luar situs | Keamanan |
| TC-SEC-09 | KF-08 | Sudah login | POST `/logout`, lalu buka halaman terlindungi | Sesi kosong; dialihkan ke login | EP valid |
| TC-SEC-10 | KNF-05 | Buat akun | Periksa kolom `password_hash` | Bukan teks asli; Argon2id | Keamanan |
| TC-SEC-11 | KNF-05 | Form POST tanpa token CSRF | Kirim | 403; data tidak berubah | Inv |
| TC-SEC-12 | KNF-05 | 5 percobaan login gagal | Percobaan ke-6 | Diblokir sementara; pesan generik | BVA/keamanan |

### 5.5 Kedaluwarsa, filter, dan antarmuka

| ID | KF | Prasyarat / data | Langkah | Hasil diharapkan | Teknik |
|---|---|---|---|---|---|
| TC-EXP-01 | KF-09 | Expired hari ini + 7 | Buka inventaris | Label “Perhatian: Expired Dalam 7 Hari” | BVA tepat |
| TC-EXP-02 | KF-09 | Expired hari ini + 8 | Buka inventaris | Label “Aman” | BVA atas |
| TC-EXP-03 | KF-09 | Expired kemarin | Buka inventaris | Label “Kedaluwarsa” | BVA bawah |
| TC-EXP-04 | KF-09 | Expired hari ini | Buka inventaris | Label “Expired Hari Ini” | BVA tepat |
| TC-FLT-01 | KF-11 | Transaksi dengan tujuan `081234567890` | Cari `0812` | Baris cocok; kata kunci tetap tampil | EP valid |
| TC-FLT-02 | KF-11 | Transaksi Telkomsel & Indosat | Filter operator Telkomsel | Hanya Telkomsel | EP valid |
| TC-FLT-03 | KF-11 | Transaksi tanggal 18 dan 19 | Filter 18–18 | Hanya tanggal 18 (batas inklusif) | BVA |
| TC-FLT-04 | KF-11 | Voucher bernama “Diskon 100%” | Cari `%` | Hanya yang memuat `%` literal | Inv/LIKE escape |
| TC-FLT-05 | KF-11 | Ada data | Cari `' OR 1=1 --` | Tidak ada hasil; tidak error | Inv/injeksi |
| TC-FLT-06 | KF-11 | Data campuran | Gabung `q` + operator + tanggal | Hasil sesuai semua filter | EP kombinasi |
| TC-UI-01 | KNF-04 | Lebar 360 px | Buka login, daftar, form | Tidak ada guliran horizontal; label terbaca | KNF |
| TC-RCP-01 | KF-12 | Transaksi tersimpan | Klik “Salin struk” | Teks struk tersalin; berisi tanggal, item, harga, metode | Could |

## 6. Matriks keterlacakan

| KF | Use case | Halaman | Prioritas | Test case |
|---|---|---|---|---|
| KF-01 | UC-01 | wf-04 | Must | TC-TRX-01…06 |
| KF-02 | UC-01 | wf-04 | Must | TC-OPR-01…05 |
| KF-03 | UC-02 | wf-05 | Must | TC-STK-01, TC-STK-03 |
| KF-04 | UC-02 | wf-05 | Must | TC-STK-02, TC-STK-04, TC-STK-05 |
| KF-05 | UC-04 | wf-02, wf-11 | Must | TC-RPT-01…03 |
| KF-06 | UC-03 | wf-04, wf-09 | Must | TC-KSB-01, TC-KSB-04, TC-KSB-05, TC-TRX-01 |
| KF-07 | UC-03 | wf-09 | Must | TC-KSB-02, TC-KSB-03 |
| KF-08 | UC-05 | wf-01, wf-12 | Must | TC-SEC-01…09 |
| KF-09 | UC-02 | wf-06 | Should | TC-EXP-01…04 |
| KF-10 | UC-02 | wf-06, wf-07, wf-08 | Should | TC-VCR-01…09, TC-VMS-01…05 |
| KF-11 | UC-01, UC-04 | wf-10 | Should | TC-FLT-01…06 |
| KF-12 | UC-01 | wf-04 | Could | TC-RCP-01 |
| KNF-04 | Seluruh halaman | wf-* | Should | TC-UI-01 |
| KNF-05 | UC-05 | wf-01, wf-02, wf-12 | Must | TC-SEC-06, TC-SEC-07, TC-SEC-10, TC-RPT-03 |

## 7. Catatan pelaksanaan

- Uji otomatis dijalankan dengan `bun test`; skrip skema dengan `bun run cek:skema`.
- Uji manual memakai data karangan; hasil aktual dicatat di `docs/pengujian/test-case.md` pada Jobsheet 13.
- UAT dijadwalkan pada Jobsheet 14 dan tidak boleh mengarang hasil.
