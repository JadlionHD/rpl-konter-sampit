# Lembar UAT — RPL Konter Sampit v1.0.0

**Tanggal:** ____________________  
**Tempat:** ____________________  
**Peserta:** Pemilik: ____________  Kasir: ____________  Fasilitator: Hendra  
**Versi aplikasi:** 1.0.0  
**Lingkungan:** ____________________

> Isi kolom **Hasil aktual** dan **Status** saat sesi. Jangan mengisi sebelum UAT dilakukan.

| ID | Peran | Skenario | Hasil yang diharapkan | Hasil aktual | Status (Lulus/Gagal) | Catatan |
|---|---|---|---|---|---|---|
| UAT-01 | Pemilik | Login dan logout | Masuk; menu lengkap; logout mengakhiri sesi |  |  |  |
| UAT-02 | Kasir | Login dan batas peran | Dashboard tanpa laba/modal; `/laporan` 403 |  |  |  |
| UAT-03 | Kasir | Catat transaksi pulsa | Tersimpan; muncul di riwayat; pesan sukses |  |  |  |
| UAT-04 | Kasir | Jual voucher dan stok habis | Stok berkurang; stok habis ditolak |  |  |  |
| UAT-05 | Pemilik | Tambah stok voucher | Stok +10; ledger muncul |  |  |  |
| UAT-06 | Kasir | Kasbon dan pelunasan | Piutang tercatat; status lunas |  |  |  |
| UAT-07 | Pemilik | Filter riwayat | Hasil sesuai filter; empty state jelas |  |  |  |
| UAT-08 | Pemilik | Laporan | Omzet/modal/laba sesuai |  |  |  |
| UAT-09 | Keduanya | Tampilan 360 px | Tidak ada guliran horizontal |  |  |  |
| UAT-10 | Keduanya | Pesan galat validasi | Pesan spesifik; isian tidak hilang |  |  |  |

## Catatan pengamat

- Intervensi teknis yang diperlukan: ____________________
- Kebingungan yang terlihat: ____________________
- Data yang dipakai: karangan / bukan data pelanggan nyata (lingkari).

**Tanda tangan fasilitator:** ____________________
