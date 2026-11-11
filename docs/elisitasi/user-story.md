# Daftar User Story — RPL Konter Sampit

> Dokumen ini memuat daftar kebutuhan pengguna yang dirumuskan ke dalam format **User Story** berstandar **INVEST** (*Independent, Negotiable, Valuable, Estimable, Small, Testable*) dengan kriteria penerimaan format **Given–When–Then**.

---

## US-01 Pencatatan Transaksi Pulsa Cepat
- **Sebagai** penjaga konter (kasir),  
- **Saya ingin** mencatat penjualan pulsa elektrik secara cepat dengan menginput nomor HP, nominal, dan harga,  
- **Agar** setiap transaksi pembeli langsung tercatat rapi sebelum pembeli meninggalkan konter.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Sukses):* **Given** kasir membuka form transaksi, **When** kasir mengisi nomor HP `081234567890`, memilih nominal `10.000`, dan menekan tombol "Simpan", **Then** sistem menyimpan transaksi ke database dan menampilkan pesan sukses dalam ≤ 2 detik.
  - *Skenario 2 (Nomor Kosong):* **Given** kasir membuka form transaksi, **When** kasir menekan tombol "Simpan" tanpa mengisi nomor HP, **Then** sistem menolak dan menampilkan pesan `"Nomor HP wajib diisi"`.
- **Sumber:** Catatan Wawancara No. 1 [Asumsi: Tidak]

---

## US-02 Deteksi Otomatis Operator Nomor HP
- **Sebagai** penjaga konter,  
- **Saya ingin** sistem otomatis mendeteksi operator (Telkomsel, Indosat, XL, Tri, Smartfren) berdasarkan prefix 4 digit pertama nomor HP,  
- **Agar** saya tidak perlu memilih operator manual dan terhindar dari salah produk.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Telkomsel):* **Given** kasir mengetik nomor HP berawalan `0812`, **When** 4 digit pertama selesai diketik, **Then** sistem otomatis memilih opsi operator `"Telkomsel"` dan menampilkan badge warna merah.
  - *Skenario 2 (Indosat):* **Given** kasir mengetik nomor HP berawalan `0857`, **When** 4 digit pertama selesai diketik, **Then** sistem otomatis memilih opsi operator `"Indosat"`.
- **Sumber:** Catatan Wawancara No. 1 [Asumsi: Tidak]

---

## US-03 Penjualan Voucher Fisik Mengurangi Stok
- **Sebagai** penjaga konter,  
- **Saya ingin** memilih jenis voucher fisik internet yang terjual dan sisa stok fisik otomatis berkurang satu,  
- **Agar** catatan stok di sistem selalu cocok dengan jumlah fisik voucher di etalase.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Stok Berkurang):* **Given** stok voucher "Telkomsel 2.5GB 5 Hari" berjumlah 10 pcs, **When** kasir mencatat penjualan 2 pcs voucher tersebut, **Then** sistem menyimpan transaksi dan sisa stok voucher berubah menjadi 8 pcs.
  - *Skenario 2 (Audit Stok):* **Given** sisa stok voucher adalah 8 pcs, **When** pemilik membuka tabel inventaris, **Then** sistem menampilkan angka stok terkini 8 pcs.
- **Sumber:** Catatan Wawancara No. 2 [Asumsi: Tidak]

---

## US-04 Validasi Penolakan Saat Stok Voucher Habis
- **Sebagai** penjaga konter,  
- **Saya ingin** sistem menolak transaksi voucher fisik jika stok barang tersebut bernilai 0,  
- **Agar** saya tidak salah mencatat penjualan barang yang barang fisiknya sudah habis di etalase.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Stok Habis):* **Given** stok voucher "Indosat 5GB" adalah 0 pcs, **When** kasir mencoba memilih dan menyimpan transaksi voucher tersebut, **Then** sistem menolak transaksi, stok tidak berubah, dan muncul pesan error `"Stok voucher habis!"`.
- **Sumber:** Catatan Wawancara No. 2 [Asumsi: Tidak]

---

## US-05 Rekapitulasi Laba Kotor Harian
- **Sebagai** pemilik konter,  
- **Saya ingin** melihat ringkasan omzet penjualan, total modal beli, dan estimasi laba kotor hari ini pada dashboard,  
- **Agar** saya dapat mengetahui hasil keuntungan harian tanpa harus menghitung dengan kalkulator setiap malam.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Hitung Laba):* **Given** terdapat 2 transaksi hari ini (Transaksi A: Jual Rp12.000, Modal Rp10.500; Transaksi B: Jual Rp25.000, Modal Rp23.000), **When** pemilik membuka halaman dashboard, **Then** sistem menampilkan Total Penjualan `Rp37.000`, Total Modal `Rp33.500`, dan Laba Kotor `Rp3.500`.
- **Sumber:** Catatan Wawancara No. 5 [Asumsi: Tidak]

---

## US-06 Pencatatan Transaksi Kasbon (Piutang)
- **Sebagai** penjaga konter,  
- **Saya ingin** mencatat transaksi dengan metode pembayaran "Kasbon" yang mencantumkan nama pelanggan dan tanggal jatuh tempo,  
- **Agar** tagihan piutang pelanggan tercatat jelas dan tidak hilang seperti saat dicatat di kertas.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Catat Kasbon):* **Given** pelanggan bernama "Pak Budi" membeli token PLN Rp22.000 secara kasbon, **When** kasir memilih metode pembayaran "Kasbon", mengisi nama "Pak Budi", dan menyimpan, **Then** transaksi tersimpan dengan status `"Belum Lunas"` dan masuk ke daftar buku kasbon.
  - *Skenario 2 (Nama Kasbon Kosong):* **Given** kasir memilih metode pembayaran "Kasbon", **When** kolom nama pelanggan dibiarkan kosong lalu tombol simpan ditekan, **Then** sistem menolak dan meminta nama pelanggan diisi.
- **Sumber:** Catatan Wawancara No. 4 [Asumsi: Tidak]

---

## US-07 Pelunasan Piutang Kasbon Pelanggan
- **Sebagai** penjaga atau pemilik konter,  
- **Saya ingin** mengubah status kasbon pelanggan menjadi "Lunas" saat pelanggan datang membayar,  
- **Agar** catatan hutang diperbarui dan uang pelunasan masuk ke arus kas masuk toko.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Pelunasan Sukses):* **Given** terdapat kasbon aktif atas nama "Pak Budi" sebesar Rp22.000, **When** kasir mengklik tombol "Tandai Lunas" dan mengonfirmasi penerimaan uang, **Then** status berubah menjadi `"Lunas"`, tanggal lunas tercatat, dan total piutang aktif berkurang.
- **Sumber:** Catatan Wawancara No. 4 [Asumsi: Tidak]

---

## US-08 Peringatan Voucher Mendekati Kedaluwarsa
- **Sebagai** pemilik konter,  
- **Saya ingin** melihat daftar voucher fisik yang masa berlakunya tinggal ≤ 7 hari,  
- **Agar** voucher tersebut dapat diprioritaskan untuk dijual atau dipromosikan sebelum hangus.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Deteksi Expired):* **Given** hari ini tanggal 11 November 2026 dan ada voucher dengan tanggal expired 15 November 2026 (sisa 4 hari), **When** pengguna membuka halaman inventaris, **Then** voucher tersebut ditandai dengan badge peringatan kuning `"Mendekati Expired (4 hari)"`.
  - *Skenario 2 (Sudah Expired):* **Given** tanggal expired voucher adalah 10 November 2026 (sudah lewat), **When** halaman inventaris dimuat, **Then** voucher ditandai dengan badge merah `"Expired"`.
- **Sumber:** Catatan Wawancara No. 3 [Asumsi: Tidak]

---

## US-09 Manajemen Data Stok Voucher Masuk
- **Sebagai** pemilik konter,  
- **Saya ingin** menambahkan stok voucher fisik baru (nama paket, operator, jumlah, modal beli, harga jual, tanggal expired),  
- **Agar** katalog barang di toko selalu terbarui saat ada suplai baru dari distributor.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Tambah Stok Baru):* **Given** pemilik mengisi form voucher baru dengan nama "XL Flex M 12GB", stok 20 pcs, modal Rp35.000, jual Rp40.000, expired 31-12-2026, **When** tombol simpan ditekan, **Then** data voucher baru muncul di daftar stok dengan jumlah 20 pcs.
- **Sumber:** Catatan Wawancara No. 2 [Asumsi: Tidak]

---

## US-10 Pembatasan Hak Akses Multi-Peran (Login)
- **Sebagai** pemilik konter,  
- **Saya ingin** membedakan hak akses login antara "Pemilik" dan "Kasir/Penjaga",  
- **Agar** kasir hanya bisa mencatat transaksi dan kasbon tanpa melihat total keuntungan akumulatif toko.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Akses Kasir):* **Given** pengguna login dengan peran "Kasir", **When** kasir membuka dashboard, **Then** kasir hanya dapat melihat form transaksi dan riwayat penjualan hari ini tanpa menu pengaturan modal/laba bulanan.
  - *Skenario 2 (Akses Pemilik):* **Given** pengguna login sebagai "Pemilik", **When** membuka menu laporan, **Then** seluruh rekap keuntungan dan pengaturan pengguna dapat diakses penuh.
- **Sumber:** Catatan Wawancara No. 6 [Asumsi: Tidak]

---

## US-11 Filter Riwayat Transaksi Berdasarkan Tanggal & Operator
- **Sebagai** pemilik atau penjaga konter,  
- **Saya ingin** memfilter daftar riwayat transaksi berdasarkan tanggal tertentu dan pilihan operator,  
- **Agar** saya mudah mencocokkan data jika ada pelanggan yang menanyakan status transaksi pulsa sebelumnya.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Filter Tanggal):* **Given** kasir memilih filter tanggal "10 November 2026", **When** tombol filter ditekan, **Then** tabel hanya menampilkan transaksi yang terjadi pada tanggal 10 November 2026.
  - *Skenario 2 (Filter Operator):* **Given** kasir memilih operator "Telkomsel", **When** filter diaplikasikan, **Then** hanya transaksi Telkomsel yang ditampilkan.
- **Sumber:** Catatan Wawancara No. 1 [Asumsi: Tidak]

---

## US-12 Tampilan Ramah Layar Sentuh Ponsel (Mobile-First)
- **Sebagai** penjaga konter yang bertransaksi menggunakan ponsel,  
- **Saya ingin** tata letak formulir dan tombol memiliki ukuran besar (minimal 44px) dan kontras jelas,  
- **Agar** saya dapat menginput nomor HP pembeli dengan cepat tanpa salah tekan tombol saat melayani di meja sempit.
- **Kriteria Penerimaan:**
  - *Skenario 1 (Responsif):* **Given** aplikasi dibuka pada layar smartphone lebar 360px–414px, **When** halaman beranda dimuat, **Then** semua tombol input dan teks terlihat tanpa harus melakukan scroll horizontal, dan tombol aksi berukuran minimal 44 piksel.
- **Sumber:** Catatan Wawancara No. 7 & 8 [Asumsi: Tidak]
