# Software Requirements Specification (SRS) Ringkas — RPL Konter Sampit

> **Sistem Informasi & Manajemen Operasional Warung Konter Pulsa, Kuota, & PPOB di Sampit**  
> Mengacu pada Standar IEEE 830 Disederhanakan untuk Proyek Praktikum RPL D3 TI Politeknik Sampit

---

## 1. Pendahuluan

### 1.1 Tujuan dan Ruang Lingkup
Dokumen SRS ringkas ini mendefinisikan spesifikasi kebutuhan perangkat lunak untuk sistem manajemen operasional warung konter pulsa di Sampit. Sistem ini dibangun untuk mencatat transaksi penjualan pulsa elektrik, paket data, voucher fisik, dan token PLN secara cepat, mengelola inventaris voucher dan peringatan kedaluwarsanya, mencatat piutang/kasbon pelanggan, serta menghitung estimasi laba harian secara otomatis. Sistem berjalan sebagai aplikasi web lokal (*localhost/LAN*) menggunakan arsitektur Bun + Hono + SQLite.

Sistem ini **tidak mencakup** integrasi gateway pengisian pulsa otomatis ke server multi-chip distributor dan tidak memproses transaksi kartu perbankan.

### 1.2 Definisi dan Istilah
- **Pulsa Elektrik:** Pulsa digital yang diisikan langsung ke nomor pelanggan melalui chip/aplikasi distributor.
- **Voucher Fisik:** Kartu berhologram/barcode berisi paket data internet dengan batas tanggal kedaluwarsa fisik.
- **Kasbon:** Transaksi pembelian pelanggan yang pembayarannya ditunda/dihutang dengan janji bayar kemudian.
- **DoD (*Definition of Done*):** Standar kesepakatan tim bahwa suatu fitur telah selesai dibangun, diuji, dan ditinjau.

---

## 2. Gambaran Umum Sistem

### 2.1 Pengguna dan Peran
1. **Pemilik Konter (Admin):** Pengambil keputusan operasional. Mengelola stok barang, melihat ringkasan omzet dan laba harian/bulanan, mengelola daftar kasbon dan pelunasannya, serta mengatur akun kasir. Kemampuan teknis: Terbiasa dengan smartphone dan laptop sederhana.
2. **Penjaga Konter (Kasir):** Bertugas melayani pembeli di jam shift. Mencatat transaksi penjualan pulsa dan voucher, mencatat kasbon baru, serta melihat riwayat penjualan shift aktif. Kemampuan teknis: Terbiasa dengan smartphone Android sehari-hari.

### 2.2 Lingkungan Operasi
- **Perangkat Keras Klien:** Smartphone Android (Chrome/Firefox mobile) dan laptop lama berbasis Windows 10 (RAM 4GB).
- **Lingkungan Eksekusi Server:** Bun 1.4+ pada komputer/laptop konter (berjalan di port lokal `3000`).
- **Jaringan:** Jaringan Wi-Fi/Hotspot lokal toko (*offline-first readiness* tanpa ketergantungan internet luar untuk pembukuan lokal).

### 2.3 Batasan Sistem (Constraints)
1. **Waktu Pengerjaan:** Proyek diselesaikan hingga Minggu 16 (4 siklus Sprint Scrum).
2. **Teknologi Wajib:** Berjalan di atas runtime Bun dengan framework Hono, database bawaan `bun:sqlite`, dan test runner `bun:test`.
3. **Anggaran Klien:** Nol rupiah untuk biaya langganan bulanan software (*zero subscription cost*).

### 2.4 Asumsi dan Ketergantungan
1. **Asumsi 1:** Kasir selalu memasukkan uang fisik ke laci kas segera setelah mencatat transaksi di sistem.  
   *Rencana Konfirmasi:* Mengamati kepatuhan kasir pada sesi demonstrasi pertama (Sprint 1 Review).
2. **Asumsi 2:** Perubahan harga modal voucher dari distributor tidak terjadi lebih dari sekali seminggu.  
   *Rencana Konfirmasi:* Mengonfirmasi ke pemilik toko terkait frekuensi perubahan harga beli distributor.

---

## 3. Kebutuhan Fungsional (KF)

Setiap butir kebutuhan fungsional bernomor unik, terukur, berawalan *"Sistem harus..."*, dan dapat ditelusuri ke sumber User Story:

| ID | Pernyataan Kebutuhan | Sumber | Prioritas | Asumsi? |
|:---:|:---|:---:|:---:|:---:|
| `KF-01` | Sistem harus menyediakan formulir pencatatan transaksi pulsa dan paket data dengan atribut nomor HP, jenis operator, nominal, harga beli (modal), harga jual, dan metode bayar. | US-01 | **Must** | Tidak |
| `KF-02` | Sistem harus mendeteksi nama operator seluler secara otomatis dari prefix 4 digit nomor HP Indonesia (Telkomsel, Indosat, XL, Tri, Smartfren). | US-02 | **Must** | Tidak |
| `KF-03` | Sistem harus mengurangi stok voucher fisik secara otomatis sebesar jumlah yang terjual saat transaksi voucher berhasil disimpan. | US-03 | **Must** | Tidak |
| `KF-04` | Sistem harus menolak transaksi voucher fisik jika stok barang tersebut bernilai 0 dengan menampilkan pesan error *"Stok voucher habis!"*. | US-04 | **Must** | Tidak |
| `KF-05` | Sistem harus menghitung dan menampilkan total omzet penjualan, total modal beli, dan estimasi laba kotor hari ini pada halaman dashboard. | US-05 | **Must** | Tidak |
| `KF-06` | Sistem harus menyimpan transaksi dengan status *"Kasbon"* beserta data nama pelanggan, nomor kontak, tanggal pinjam, dan tanggal jatuh tempo. | US-06 | **Must** | Tidak |
| `KF-07` | Sistem harus menyediakan fungsi pelunasan kasbon yang mengubah status piutang menjadi *"Lunas"* dan mencatat tanggal pelunasan. | US-07 | **Must** | Tidak |
| `KF-08` | Sistem harus memvalidasi autentikasi login pengguna dan membedakan otorisasi menu antara peran Pemilik dan Kasir. | US-10 | **Must** | Tidak |
| `KF-09` | Sistem harus menampilkan tanda peringatan visual pada inventaris untuk voucher fisik yang tanggal kedaluwarsanya tersisa ≤ 7 hari. | US-08 | **Should** | Tidak |
| `KF-10` | Sistem harus menyediakan formulir penambahan dan pembaruan data stok voucher fisik (nama paket, jumlah, harga modal, harga jual, tanggal expired). | US-09 | **Should** | Tidak |
| `KF-11` | Sistem harus memfilter riwayat transaksi berdasarkan rentang tanggal dan nama operator seluler. | US-11 | **Should** | Tidak |
| `KF-12` | Sistem harus menyediakan fungsi salin teks struk transaksi belanja yang siap dikirimkan kepada pelanggan via aplikasi pesan WhatsApp. | US-01 | **Could** | Ya |

*Catatan Prioritas MoSCoW:* Jumlah butir **Must** adalah 8 dari 12 butir (66.7%), memenuhi kriteria pengerjaan Sprint 1 dan 2.

---

## 4. Kebutuhan Non-Fungsional (KNF)

| ID | Kategori | Pernyataan Kebutuhan Terukur | Sumber |
|:---:|:---|:---|:---|
| `KNF-01` | **Kinerja (*Performance*)** | Halaman formulir transaksi dan dashboard harus termuat dalam waktu **≤ 1.5 detik** pada browser laptop maupun ponsel lokal. | Catatan Wawancara No. 7 |
| `KNF-02` | **Keandalan (*Reliability*)** | Sistem harus dapat beroperasi secara penuh tanpa koneksi internet luar (*offline-first*) untuk seluruh pencatatan transaksi lokal. | Catatan Wawancara No. 8 |
| `KNF-03` | **Kegunaan (*Usability*)** | Kasir baru yang belum pernah memakai sistem harus dapat menyelesaikan 1 pencatatan transaksi pulsa dalam waktu **≤ 10 detik** setelah demonstrasi singkat 2 menit. | Catatan Wawancara No. 1 |
| `KNF-04` | **Kegunaan & Desain** | Seluruh tombol aksi utama pada tampilan ponsel harus memiliki area sentuh minimal **44 × 44 piksel** untuk mencegah kesalahan sentuh. | US-12 |
| `KNF-05` | **Keamanan (*Security*)** | Kata sandi pengguna harus disimpan dalam bentuk hash yang aman dan data sensitif modal hanya dapat diakses setelah otentikasi peran Pemilik. | Catatan Wawancara No. 6 |

---

## 5. Di Luar Lingkup (*Won't Have Kali Ini*)
1. **Integrasi Gateway Multi-Chip Otomatis:** Sistem tidak melakukan eksekusi perintah USSD/SMS gateway otomatis ke server distributor pulsa untuk menghindari kompleksitas perizinan API pihak ketiga dan biaya server.
2. **Aplikasi Native Mobile:** Sistem tidak dibuat sebagai aplikasi APK Android khusus, melainkan sebagai web aplikasi responsif yang dapat dibuka dari browser Chrome/Edge.

---

## 6. Matriks Keterlacakan (Traceability Matrix)

| ID User Story | Kebutuhan Fungsional (KF) | Kebutuhan Non-Fungsional (KNF) | Use Case Terkait (Jobsheet 5) | Rencana Uji (Minggu 13) |
|:---:|:---|:---|:---:|:---|
| `US-01` | `KF-01`, `KF-12` | `KNF-01`, `KNF-03` | `UC-01` (Catat Transaksi Pulsa) | `TC-TRX-01` |
| `US-02` | `KF-02` | `KNF-03` | `UC-01` (Catat Transaksi Pulsa) | `TC-OPR-01` |
| `US-03` | `KF-03` | `KNF-01` | `UC-02` (Kelola Stok Voucher) | `TC-STK-01` |
| `US-04` | `KF-04` | `KNF-03` | `UC-02` (Kelola Stok Voucher) | `TC-STK-02` |
| `US-05` | `KF-05` | `KNF-01` | `UC-04` (Lihat Rekapitulasi Laba) | `TC-RPT-01` |
| `US-06` | `KF-06` | `KNF-01` | `UC-03` (Kelola Kasbon Pelanggan) | `TC-KSB-01` |
| `US-07` | `KF-07` | `KNF-01` | `UC-03` (Kelola Kasbon Pelanggan) | `TC-KSB-02` |
| `US-08` | `KF-09` | `KNF-01` | `UC-02` (Kelola Stok Voucher) | `TC-EXP-01` |
| `US-09` | `KF-10` | `KNF-01` | `UC-02` (Kelola Stok Voucher) | `TC-STK-03` |
| `US-10` | `KF-08` | `KNF-05` | `UC-05` (Autentikasi Login) | `TC-SEC-01` |
| `US-11` | `KF-11` | `KNF-01` | `UC-01`, `UC-04` | `TC-FLT-01` |
| `US-12` | — | `KNF-04` | Seluruh Halaman | `TC-UI-01` |

---

## 7. Riwayat Konfirmasi Klien

| Tanggal | Narasumber | Ringkasan Tanggapan Klien | Perubahan yang Dilakukan |
|:---:|:---|:---|:---|
| 10 Nov 2026 | Bpk. H (Pemilik) | Menginginkan pencatatan kasbon memiliki batas tanggal tempo agar kasir ingat menagih jika pelanggan mampir lagi. | Menambahkan atribut `jatuh_tempo` pada `KF-06` dan `US-06`. |
| 10 Nov 2026 | Sdr. R (Kasir) | Meminta deteksi operator otomatis agar tidak repot memilih menu operator berulang-ulang saat melayani pembeli pulsa. | Menetapkan `KF-02` sebagai prioritas tinggi (**Must**) untuk Sprint 1. |
