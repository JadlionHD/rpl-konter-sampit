# Skenario Use Case — RPL Konter Sampit

> Dokumen ini menjelaskan secara terperinci perilaku dan alur interaksi untuk **5 Use Case Utama** sistem manajemen konter pulsa di Sampit.

---

## UC-01 Catat Transaksi Pulsa dan Paket Data
- **Aktor:** Penjaga Konter (Kasir), Pemilik Konter
- **KF Terkait:** `KF-01`, `KF-02`, `KF-12`
- **Prasyarat:** Pengguna telah login dan berada di halaman beranda transaksi.

### Alur Utama (Main Flow):
1. Kasir membuka formulir transaksi penjualan.
2. Kasir mengetik nomor HP pembeli pada kolom input.
3. Sistem secara otomatis mendeteksi dan memilih operator seluler berdasarkan 4 digit prefix nomor HP (`KF-02`).
4. Kasir memilih nominal paket/pulsa dan jenis transaksi (Pulsa / Paket Data).
5. Sistem menampilkan harga modal dan mengisi harga jual standar secara otomatis.
6. Kasir memilih metode pembayaran "Tunai" dan menekan tombol "Simpan Transaksi".
7. Sistem memvalidasi kelengkapan data, menyimpan catatan transaksi ke database SQLite, dan memperbarui rekap kas hari ini.
8. Sistem menampilkan pesan sukses *"Transaksi berhasil disimpan"* dan formulir kembali kosong siap untuk pembeli berikutnya.

### Alur Alternatif:
- **3a. Operator Tidak Terdeteksi Otomatis:** Jika nomor HP yang diketik memiliki prefix baru atau nomor luar negeri, sistem menampilkan opsi dropdown bagi kasir untuk memilih operator secara manual.
- **6a. Pembayaran QRIS:** Jika pelanggan membayar dengan QRIS statis toko, kasir memilih metode "QRIS", sistem mencatat status masuk rekening bank tanpa menambah kas laci fisik.

### Pengecualian (Exceptions):
- **2a. Nomor HP Tidak Lengkap:** Jika nomor HP kurang dari 10 digit atau mengandung huruf, sistem menampilkan pesan error *"Nomor HP tidak valid (minimal 10 digit angka)"* dan tombol simpan tidak aktif.
- **5a. Harga Jual Kosong:** Jika kasir menghapus nominal harga jual, sistem menolak menyimpan dengan pesan *"Harga jual wajib diisi dan minimal sama dengan harga modal"*.

### Pascakondisi:
- Transaksi tersimpan permanen di database, omzet bertambah, dan tercatat di riwayat penjualan harian.

---

## UC-02 Kelola Stok dan Penjualan Voucher Fisik
- **Aktor:** Penjaga Konter (Kasir), Pemilik Konter
- **KF Terkait:** `KF-03`, `KF-04`, `KF-09`, `KF-10`
- **Prasyarat:** Data jenis voucher fisik telah terdaftar di database.

### Alur Utama (Penjualan Voucher Fisik):
1. Kasir memilih tab transaksi "Voucher Fisik".
2. Kasir memilih jenis voucher dari daftar (contoh: "Telkomsel 2.5GB 5 Hari").
3. Sistem memeriksa sisa kuantitas stok voucher di database.
4. Sistem menampilkan sisa stok yang tersedia (misal: "Sisa Stok: 8 pcs") dan mengisi nominal harga jual.
5. Kasir menentukan jumlah voucher yang dibeli (misal: 1 pcs) dan menekan "Simpan".
6. Sistem memotong stok voucher sebesar 1 pcs, menyimpan data transaksi, dan menampilkan pesan sukses.

### Alur Alternatif (Penambahan Stok Baru oleh Pemilik):
- **1a. Restock Barang Masuk:** Pemilik membuka menu "Inventaris", memilih voucher terkait, mengisi jumlah stok masuk (misal +20 pcs) dan tanggal expired baru, lalu menekan "Tambah Stok". Sistem memperbarui jumlah stok total.

### Pengecualian (Exceptions):
- **3a. Stok Habis (0 Pcs):** Jika kuantitas stok voucher yang dipilih bernilai 0, sistem langsung menonaktifkan tombol simpan dan menampilkan pesan merah *"Peringatan: Stok voucher ini telah habis!"* (`KF-04`).
- **3b. Voucher Kedaluwarsa:** Jika tanggal expired voucher sudah lewat dari tanggal hari ini, sistem menampilkan label merah *"Kedaluwarsa"* dan melarang transaksi penjualan voucher tersebut.

### Pascakondisi:
- Stok fisik di database berkurang, transaksi penjualan voucher tercatat, dan nominal laba kotor terhitung.

---

## UC-03 Kelola Kasbon Pelanggan & Pelunasan
- **Aktor:** Penjaga Konter (Kasir), Pemilik Konter
- **KF Terkait:** `KF-06`, `KF-07`
- **Prasyarat:** Pengguna berada di halaman formulir transaksi atau halaman buku kasbon.

### Alur Utama (Pencatatan Kasbon Baru):
1. Kasir melayani pembeli yang meminta kasbon pulsa/token.
2. Kasir mengisi nomor HP tujuan dan nominal pulsa seperti biasa.
3. Pada opsi metode pembayaran, kasir memilih "Kasbon (Hutang)".
4. Sistem memunculkan kolom tambahan: "Nama Pelanggan", "Nomor Kontak", dan "Batas Tanggal Tempo".
5. Kasir menginput nama pelanggan dan memilih tanggal jatuh tempo pembayaran.
6. Kasir menekan tombol "Simpan Transaksi Kasbon".
7. Sistem mencatat transaksi dengan status *"Kasbon/Belum Lunas"* dan otomatis memasukkannya ke buku piutang.

### Alur Alternatif (Pelunasan Kasbon):
- **1a. Pelanggan Datang Membayar:** Kasir membuka tab "Daftar Kasbon", mencari nama pelanggan, lalu mengklik tombol "Tandai Lunas".
- **2a. Konfirmasi Penerimaan:** Sistem menampilkan kotak dialog konfirmasi nominal uang yang diterima.
- **3a. Perubahan Status:** Kasir mengklik "Ya, Sudah Bayar". Sistem mencatat tanggal pelunasan dan mengubah status menjadi *"Lunas"*.

### Pengecualian (Exceptions):
- **5a. Nama Pelanggan Dikosongkan:** Jika kasir memilih kasbon namun tidak mengisi nama pelanggan, sistem membatalkan penyimpanan dengan pesan *"Nama pelanggan wajib diisi untuk transaksi kasbon!"*.

### Pascakondisi:
- Piutang tercatat di buku kasbon. Saat dilunasi, piutang berkurang dan uang masuk diakui dalam kas laci.

---

## UC-04 Lihat Rekapitulasi Laba dan Omzet Toko
- **Aktor:** Pemilik Konter (Admin)
- **KF Terkait:** `KF-05`, `KF-08`, `KF-11`
- **Prasyarat:** Pengguna login dengan akun peran Pemilik Konter.

### Alur Utama (Main Flow):
1. Pemilik memilih menu "Dashboard Laporan".
2. Sistem melakukan agregasi data dari tabel transaksi untuk hari ini:
   - Menghitung $\sum \text{harga\_jual}$ (Total Omzet).
   - Menghitung $\sum \text{harga\_modal}$ (Total Modal).
   - Menghitung $\text{Omzet} - \text{Modal}$ (Estimasi Laba Kotor).
   - Menghitung total kasbon aktif yang belum terbayar.
3. Sistem merender kartu ringkasan metrik statistik keuangan di bagian atas layar.
4. Sistem menampilkan tabel rincian transaksi hari ini lengkap dengan laba per transaksi.

### Alur Alternatif (Filter Tanggal):
- **1a. Filter Rentang Waktu:** Pemilik memilih tanggal awal dan tanggal akhir tertentu (misal: 1 minggu terakhir), sistem menghitung ulang seluruh metrik laba berdasarkan filter tanggal tersebut.

### Pengecualian (Exceptions):
- **1b. Akses oleh Kasir:** Jika pengguna yang login berstatus peran "Kasir" mencoba membuka URL laporan laba, sistem menolak dan mengarahkan kembali ke beranda kasir dengan pesan *"Akses ditolak: Menu ini hanya untuk Pemilik Toko"*.

### Pascakondisi:
- Pemilik mendapatkan visibilitas performa keuangan harian toko secara akurat dan transparan.

---

## UC-05 Autentikasi Login dan Kontrol Akses
- **Aktor:** Penjaga Konter (Kasir), Pemilik Konter
- **KF Terkait:** `KF-08`
- **Prasyarat:** Server aplikasi berjalan dan browser terhubung ke halaman login.

### Alur Utama (Main Flow):
1. Pengguna membuka halaman web aplikasi.
2. Jika belum terotentikasi, sistem menampilkan halaman formulir Login (Username & Password).
3. Pengguna memasukkan username dan password yang benar.
4. Pengguna menekan tombol "Masuk".
5. Sistem memvalidasi kredensial pengguna terhadap hash kata sandi di database.
6. Sistem membuat sesi aktif dan mengarahkan pengguna ke beranda sesuai hak akses perannya:
   - Jika Kasir $\rightarrow$ Diarahkan ke form entri transaksi cepat.
   - Jika Pemilik $\rightarrow$ Diarahkan ke dashboard utama (omzet, stok, laba).

### Pengecualian (Exceptions):
- **3a. Password / Username Salah:** Jika kredensial tidak cocok, sistem menampilkan pesan *"Username atau kata sandi salah"* dan kolom password dikosongkan.
- **3b. Akun Dinonaktifkan:** Jika akun ditandai nonaktif oleh pemilik, sistem menampilkan pesan *"Akun Anda telah dinonaktifkan. Silakan hubungi pemilik"*.

### Pascakondisi:
- Sesi login aktif tercipta dan otorisasi menu disesuaikan dengan peran pengguna.
