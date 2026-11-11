# Catatan Wawancara — RPL Konter Sampit

> Dokumen catatan hasil wawancara, transkrip ringkas, dan analisis pemisahan antara fakta, solusi yang dibayangkan klien, dan kebutuhan perangkat lunak riil.

---

## 1. Identitas Sesi Wawancara
- **Tanggal & Tempat:** 10 November 2026, Konter Pulsa & Data Area Baamang, Sampit.
- **Narasumber:** Pemilik Konter (diinisialkan: *Bpk. H*) dan Penjaga Shift Konter (*Sdr. R*).
- **Pewawancara & Pencatat:** Tim RPL Mahasiswa D3 TI Politeknik Sampit.

---

## 2. Rangkuman Catatan Tanya Jawab

| No | Topik Pertanyaan | Catatan Jawaban Ringkas Narasumber | Status Fakta / Asumsi | Rencana Konfirmasi |
|:---:|:---|:---|:---:|:---|
| 1 | Alur transaksi pulsa elektrik | Saat pembeli datang, nomor HP dicatat di kertas sobekan atau langsung diketik di HP server chip. Baru kalau sempat, ditulis di buku besar nota. Kalau lagi ramai jam 19.00–21.00 WIB, sering lupa dicatat. | **Fakta** | Terkonfirmasi dari pengamatan fisik buku nota yang terlewat beberapa transaksi. |
| 2 | Penjualan voucher fisik | Voucher digantung di etalase. Kalau dibeli, digosokkan atau langsung diserahkan. Di buku sering hanya ditulis "voucher telkomsel 10rb", tidak ada sisa stok sisa berapa. | **Fakta** | Terkonfirmasi dari buku stok yang tidak memuat stok fisik harian. |
| 3 | Voucher kedaluwarsa | Pernah terjadi 1 renceng (10 pcs) voucher paket data Smartfren/XL hangus karena tertindih stok baru, rugi sekitar Rp200.000–Rp300.000. Ingin ada tanda kalau voucher sudah mau habis tanggal berlakunya. | **Fakta** | Sangat penting; menjadi fitur prioritas peringatan dini. |
| 4 | Kasbon pelanggan | Banyak warga sekitar berhutang pulsa atau token listrik Rp20.000–Rp50.000 janji bayar saat gajian atau besok hari. Ditulis di secarik kertas ditempel di kaca etalase. Sering kertasnya hilang atau lupa ditagih. | **Fakta** | Klien butuh fitur pencatatan nama dan no HP pengutang dengan status "Lunas / Belum Lunas". |
| 5 | Rekap laba harian | Pemilik menghitung laba kotor tiap jam 22.00 WIB dengan kalkulator: uang fisik di laci dikurangi modal awal. Kadang pusing kalau selisih karena lupa mencatat kasbon atau pengeluaran es teh. | **Fakta** | Butuh dashboard ringkas: Total Penjualan, Total Modal, Estimasi Laba, dan Total Kasbon Aktif. |
| 6 | Hak akses pegawai | Penjaga shift boleh mencatat penjualan dan kasbon, tapi pemilik tidak ingin penjaga tahu total modal deposit atau keuntungan bersih sebulan. | **Fakta** | Pembatasan role: Admin (Pemilik) vs Kasir (Penjaga). |
| 7 | Perangkat operasional | Di meja ada laptop lama (Windows 10) dan satu smartphone Android yang selalu tercolok charger untuk aplikasi pulsa. | **Fakta** | Aplikasi web harus sangat ringan, bisa dibuka via browser laptop maupun browser ponsel penjaga. |
| 8 | Kondisi koneksi & listrik | Listrik di Sampit sesekali padam giliran saat cuaca buruk, internet pakai modem orbit/wifi lokal toko. | **Fakta** | Sistem web lokal (localhost/LAN) dengan database SQLite lokal sangat ideal karena tetap jalan walau internet luar terganggu. |

---

## 3. Analisis: Pernyataan Klien $\rightarrow$ Jenis $\rightarrow$ Kebutuhan Perangkat Lunak

Tabel analisis di bawah membedakan antara pernyataan mentah klien, apakah itu fakta/solusi semu, dan kebutuhan mendasar yang harus dibangun:

| No | Pernyataan Narasumber | Jenis | Kebutuhan Riil di Baliknya (Requirements) |
|:---:|:---|:---:|:---|
| 1 | *"Saya ingin ada aplikasi di HP penjaga biar bisa langsung scan barcode voucher."* | **Solusi Semu** | Sistem harus memungkinkan kasir mencari dan memilih jenis voucher fisik secara cepat (≤ 3 ketukan) tanpa harus tergantung alat scan khusus. |
| 2 | *"Buku catatan kami sering lecek dan kalau malam ramai transaksi suka terlewat."* | **Fakta Masalah** | Sistem harus menyediakan formulir entri transaksi satu layar (*single-screen*) yang dapat disimpan dalam waktu kurang dari 5 detik. |
| 3 | *"Tolong jangan sampai ada voucher hangus lagi di etalase, rugi ratusan ribu."* | **Kebutuhan** | Sistem harus menampilkan peringatan visual (warna kuning/merah) untuk stok voucher yang tanggal kedaluwarsanya tersisa ≤ 7 hari. |
| 4 | *"Catatan hutang tetangga sering hilang kertasnya, pas ditagih mereka lupa."* | **Kebutuhan** | Sistem harus mencatat transaksi dengan status "Kasbon", menyimpan nama pelanggan, kontak, tanggal pinjam, batas tempo, serta memfasilitasi pelunasan. |
| 5 | *"Tiap malam saya capek hitung kalkulator untuk tahu untung hari ini."* | **Kebutuhan** | Sistem harus menghitung secara otomatis total omzet, total modal, dan estimasi laba kotor per hari secara *real-time*. |
| 6 | *"Karyawan saya tidak boleh lihat berapa laba bersih bulanan toko saya."* | **Kebutuhan** | Sistem harus membedakan hak akses: kasir hanya dapat melihat omzet shift-nya, sedangkan rekap keuntungan lengkap dilindungi login pemilik. |

---

## 4. Evaluasi Bantuan AI pada Dokumen Elisitasi
- **Saran AI Awal:** AI mengusulkan fitur integrasi SMS gateway otomatis ke pelanggan dan integrasi payment gateway QRIS dinamis.
- **Tinjauan & Keputusan:** **DITOLAK**. Alasan: Konter pulsa di Sampit ini adalah usaha mikro mandiri; pelanggan membayar tunai dan pemilik tidak ingin dikenakan biaya potongan per transaksi (MDR) dari payment gateway pihak ketiga. Fokus aplikasi adalah pembukuan lokal internal.
