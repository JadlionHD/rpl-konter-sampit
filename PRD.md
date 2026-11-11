# PRD — RPL Konter Sampit

> **Product Requirements Document (PRD) Siap-AI**  
> Versi: 1.0 | Status: Siap untuk Panduan Konteks AI | Bebas Data Pribadi

---

## 1. Ringkasan dan Tujuan
Aplikasi web lokal responsif untuk warung konter pulsa di Kota Sampit guna mempercepat pencatatan transaksi pulsa/voucher harian, mengendalikan stok voucher fisik agar tidak kedaluwarsa, menata buku piutang kasbon pelanggan sekitar, serta menyajikan rekapitulasi laba kotor harian secara otomatis tanpa perhitungan manual di buku tulis.

---

## 2. Pengguna dan Peran
- **Kasir (Penjaga Shift):** Mencatat transaksi pulsa, paket data, voucher fisik, mencatat kasbon pelanggan baru, serta menandai pelunasan kasbon.
- **Pemilik (Admin):** Menambah dan memperbarui data stok voucher fisik, memantau peringatan voucher mendekati kedaluwarsa, mengaudit riwayat transaksi, serta melihat total omzet dan estimasi laba kotor akumulatif.

---

## 3. Fitur & Kriteria Penerimaan (*Must* & *Should*)

### F-01 Pencatatan Transaksi Pulsa & Data Cepat (Must, Sprint 1) `<- KF-01, US-01`
Kriteria Penerimaan:
- *Given* form transaksi terbuka, *When* kasir memasukkan nomor HP 10-13 digit, memilih nominal, dan menyimpan, *Then* sistem menyimpan transaksi dalam ≤ 1 detik dan menampilkan status sukses.
- *Given* nomor HP kosong atau kurang dari 10 digit, *When* tombol simpan ditekan, *Then* sistem menolak dengan pesan validasi yang jelas.

### F-02 Deteksi Otomatis Operator Nomor HP (Must, Sprint 1) `<- KF-02, US-02`
Kriteria Penerimaan:
- *Given* nomor HP berawalan prefix `0811`, `0812`, `0813`, `0821`, `0822`, `0823`, `0851`, `0852`, `0853`, *When* nomor diketik, *Then* sistem menetapkan operator sebagai "Telkomsel".
- *Given* nomor HP berawalan `0814`, `0815`, `0816`, `0855`, `0856`, `0857`, `0858`, *When* diketik, *Then* sistem menetapkan operator sebagai "Indosat".
- *Given* nomor berawalan `0817`, `0818`, `0819`, `0859`, `0877`, `0878`, *When* diketik, *Then* sistem menetapkan operator sebagai "XL Axiata".

### F-03 Pengurangan Stok Voucher Fisik Otomatis (Must, Sprint 1) `<- KF-03, US-03`
Kriteria Penerimaan:
- *Given* stok voucher A berjumlah 5 pcs, *When* kasir menjual 1 pcs, *Then* sistem mengurangi sisa stok voucher A menjadi 4 pcs.
- *Given* stok voucher B berjumlah 0 pcs, *When* kasir mencoba memilih voucher B, *Then* sistem memblokir pemilihan dan menampilkan peringatan `"Stok voucher habis!"`.

### F-04 Rekapitulasi Omzet & Laba Kotor Harian (Must, Sprint 2) `<- KF-05, US-05`
Kriteria Penerimaan:
- *Given* transaksi hari ini memiliki akumulasi penjualan Rp100.000 dan modal Rp88.000, *When* dashboard dibuka, *Then* sistem menampilkan Omzet `Rp100.000`, Modal `Rp88.000`, dan Laba Kotor `Rp12.000`.

### F-05 Manajemen Kasbon Pelanggan & Pelunasan (Must, Sprint 2) `<- KF-06, KF-07, US-06, US-07`
Kriteria Penerimaan:
- *Given* kasir mencatat transaksi jenis "Kasbon" untuk "Pak Andi" nominal Rp25.000, *When* disimpan, *Then* catatan tersimpan dengan status `"Belum Lunas"` di buku kasbon.
- *Given* ada kasbon aktif atas nama "Pak Andi", *When* tombol "Tandai Lunas" diklik oleh kasir, *Then* status kasbon berubah menjadi `"Lunas"` dan tercatat waktu lunasnya.

### F-06 Peringatan Voucher Mendekati Expired (Should, Sprint 3) `<- KF-09, US-08`
Kriteria Penerimaan:
- *Given* voucher memiliki tanggal kedaluwarsa ≤ 7 hari dari tanggal hari ini, *When* tabel inventaris dibuka, *Then* baris voucher diberi sorotan warna kuning dan label `"Perhatian: Expired Dalam X Hari"`.

---

## 4. Data Awal (Skema Entitas Ringkas)
1. **Produk / Voucher Fisik (`vouchers`):**
   - `id` (INTEGER PRIMARY KEY), `nama_paket` (TEXT), `operator` (TEXT), `stok` (INTEGER), `harga_modal` (INTEGER), `harga_jual` (INTEGER), `tanggal_expired` (TEXT).
2. **Transaksi (`transactions`):**
   - `id` (INTEGER PRIMARY KEY), `waktu` (TEXT), `jenis` (TEXT: 'pulsa'/'voucher'/'token'), `nomor_tujuan` (TEXT), `operator` (TEXT), `harga_modal` (INTEGER), `harga_jual` (INTEGER), `laba` (INTEGER), `metode_bayar` (TEXT: 'tunai'/'qris'/'kasbon'), `status_bayar` (TEXT: 'lunas'/'kasbon').
3. **Buku Kasbon (`debts`):**
   - `id` (INTEGER PRIMARY KEY), `transaction_id` (INTEGER), `nama_pelanggan` (TEXT), `kontak` (TEXT), `nominal` (INTEGER), `tanggal_pinjam` (TEXT), `tanggal_tempo` (TEXT), `status` (TEXT: 'belum_lunas'/'lunas'), `tanggal_lunas` (TEXT).

---

## 5. Di Luar Lingkup (*Won't Have*)
- Pembelian saldo otomatis melalui integrasi API / web scrapping server multi-chip.
- Gateway pembayaran online kartu debit/kredit otomatis.
- Aplikasi mobile native Android (APK) di Google Play Store.

---

## 6. Pertanyaan Terbuka untuk Klien
1. Apakah kasbon diperbolehkan dicicil sebagian, atau selalu dibayar lunas sekaligus? *(Asumsi saat ini: dibayar lunas sekaligus).*
2. Apakah kasir shift pagi dan shift malam perlu laporan kas terpisah per pergantian shift? *(Asumsi saat ini: rekap harian gabungan 1 hari penuh).*
