# Pedoman Wawancara — RPL Konter Sampit

> Dokumen elisitasi kebutuhan untuk menggali alur operasional, kendala, data, dan harapan pemilik serta penjaga warung konter pulsa di Kota Sampit.

---

## A. Konteks Proyek

### 1. Klien / Objek Wawancara
- **Objek:** Warung Konter Pulsa, Kuota Internet, dan Aksesoris HP (di Sampit, Kotawaringin Timur).
- **Karakteristik Usaha:** Usaha mikro perseorangan, melayani 40–80 transaksi per hari, jam operasional 08.00–22.00 WIB, memiliki 1 pemilik dan 2 penjaga shift.

### 2. Masalah Utama Klien
1. **Pencatatan Campur Aduk & Tercecer:** Transaksi pulsa elektrik, paket data, token PLN, voucher fisik, dan kasbon pelanggan dicatat manual pada buku tulis bergaris. Sering kali saat jam ramai (sore/malam), transaksi lupa dicatat.
2. **Voucher Hangus / Kedaluwarsa:** Pemilik sering lupa mengecek tanggal kedaluwarsa voucher fisik kuota yang dipajang di etalase, sehingga baru ketahuan saat pelanggan komplain atau saat voucher sudah tidak bisa diisi.
3. **Kasbon Tetangga Tertimbun:** Pelanggan sekitar sering berhutang pulsa/token. Catatannya terpisah di kertas lepas atau pojok buku nota, sehingga pemilik kesulitan melacak total piutang yang belum terbayar.

### 3. Ruang Lingkup Proyek
- **Di Dalam Proyek (Akan Dikerjakan):**
  - Pencatatan transaksi pulsa elektrik, paket data, voucher fisik, dan token listrik.
  - Pengurangan stok voucher fisik secara otomatis.
  - Peringatan dini voucher mendekati masa kedaluwarsa.
  - Pencatatan dan pelunasan kasbon/piutang pelanggan.
  - Laporan rekapitulasi omzet dan estimasi laba kotor harian.
- **Di Luar Proyek (Tidak Dikerjakan):**
  - Integrasi API *direct gateway* ke server multi-chip / distributor (pembelian pulsa tetap manual via aplikasi distributor).
  - Pembayaran otomatis menggunakan kartu kredit / debit (tetap tunai / QRIS statis).
  - Aplikasi native Android khusus di Play Store.

### 4. Pemangku Kepentingan (Stakeholders)

| No | Pemangku Kepentingan | Peran dalam Sistem | Kepentingan Utama | Cara Dilibatkan |
|:---:|:---|:---|:---|:---|
| 1 | Pemilik Konter | Pengambil keputusan, pengelola modal | Mengetahui laba bersih harian, mengontrol stok voucher, memantau kasbon | Wawancara mendalam & validasi berkala |
| 2 | Penjaga Konter (Kasir) | Pengguna operasional harian | Kemudahan mencatat transaksi cepat saat antre ramai tanpa ribet | Wawancara alur kerja & uji kegunaan |
| 3 | Pelanggan Konter | Sumber transaksi | Kecepatan pelayanan dan kejelasan struk/harga | Observasi pola pembelian |

### 5. Teknik Elisitasi Dipilih

| No | Teknik Elisitasi | Sumber Data | Alasan Pemilihan |
|:---:|:---|:---|:---|
| 1 | **Wawancara Terstruktur & Semiterstruktur** | Pemilik konter dan penjaga shift | Sangat efektif menggali keluhan mendalam, alur pembukuan riil, dan alasan terjadinya kasbon macet. |
| 2 | **Studi Dokumen & Observasi** | Buku catatan nota transaksi, fisik voucher etalase, dan catatan kasbon | Melihat format riil pencatatan manual dan kode voucher yang digunakan sehari-hari. |

---

## B. Tujuan Wawancara
1. Memahami alur kerja penjualan pulsa elektrik dan voucher fisik dari kedatangan pelanggan sampai uang diterima.
2. Mengetahui cara pengelolaan stok fisik kartu perdana/voucher dan batas waktu kedaluwarsa.
3. Mengidentifikasi alur pencatatan kasbon pelanggan dan cara penagihannya.
4. Mengetahui parameter perhitungan laba kotor harian yang diinginkan pemilik toko.

---

## C. Daftar Pertanyaan Wawancara

| No | Kategori | Pertanyaan Utama | Pertanyaan Lanjutan (*Probing*) |
|:---:|:---|:---|:---|
| 1 | Proses Saat Ini | Bagaimana langkah-langkah yang Mas/Mbak lakukan saat ada pembeli datang ingin mengisi pulsa atau kuota? | Apakah nomor HP pembeli langsung dicatat di buku sebelum atau sesudah pulsa terkirim dari chip/aplikasi? |
| 2 | Proses Saat Ini | Bagaimana cara Mas/Mbak membedakan penjualan barang fisik (seperti voucher gosok/perdana) dengan pulsa elektrik? | Apakah sisa voucher fisik di etalase dihitung setiap pergantian shift jaga? |
| 3 | Masalah | Pernahkah terjadi selisih antara uang di laci kas dengan catatan di buku catatan harian? Mengapa itu biasanya terjadi? | Apakah saat warung sedang ramai pembeli, transaksi sering terlewat untuk dicatat? |
| 4 | Masalah | Bagaimana pengalaman Mas/Mbak terkait voucher fisik yang kedaluwarsa? Seberapa sering hal itu terjadi? | Berapa kerugian perkiraan jika ada 1 paket voucher hangus tidak sempat terjual? |
| 5 | Masalah | Bagaimana sistem pencatatan jika ada pelanggan langganan atau tetangga sekitar yang berhutang (*kasbon*)? | Apakah ada batas waktu tempo kasbon yang disepakati, dan bagaimana cara mengingatkannya? |
| 6 | Data | Data apa saja yang wajib dicatat untuk satu transaksi pulsa/voucher? | Bolehkah kami melihat contoh lembaran buku catatan yang biasa dipakai sehari-hari? |
| 7 | Data | Bagaimana cara Mas/Mbak mencatat harga modal beli dan harga jual untuk mengetahui keuntungan? | Apakah harga beli dari distributor sering berubah mendadak? |
| 8 | Pengguna | Siapa saja yang bertugas menjaga konter, dan bagaimana tingkat kenyamanan mereka menggunakan komputer/laptop atau ponsel? | Apakah penjaga konter memerlukan tampilan antarmuka dengan tulisan besar dan tombol yang mudah ditekan di layar sentuh? |
| 9 | Kendala | Perangkat apa yang saat ini tersedia di meja konter (ponsel, tablet, atau laptop/PC)? | Bagaimana kondisi jaringan internet dan listrik di konter, apakah sering padam atau tidak stabil? |
| 10 | Kendala | Apakah pemilik mengizinkan penjaga konter melihat total laba bersih toko, atau data laba hanya untuk pemilik? | Bagaimana pembagian hak akses yang diinginkan antara pemilik dan karyawan jaga? |
| 11 | Harapan | Informasi apa yang paling ingin dilihat oleh pemilik konter setiap malam saat toko akan tutup? | Apakah rekap harian cukup ditampilkan di layar atau perlu bisa dicetak/diekspor? |
| 12 | Harapan | Jika sistem ini dibuatkan aplikasi web lokal, apa hal terpenting yang harus ada agar penjaga konter tidak malas menggunakannya? | Berapa lama batas waktu maksimal pencatatan 1 transaksi agar antrean tidak macet? |

---

## D. Etika dan Privasi
- **Izin Klien:** Izin telah dimintakan sebelum wawancara dilakukan.
- **Anonimisasi Data:** Nama pemilik, penjaga konter, pelanggan yang kasbon, nomor telepon pribadi, dan nominal modal rahasia disamarkan dalam semua dokumen publik repositori.
