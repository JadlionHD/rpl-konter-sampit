# Product Backlog — rpl-konter-sampit

> Dokumen ini mencatat daftar kebutuhan produk secara berprioritas untuk pengembangan aplikasi web manajemen warung konter pulsa di Sampit. Disusun pada Minggu 2 (Jobsheet 2) dan disempurnakan berdasarkan elisitasi serta SRS ringkas pada Minggu 4 (Jobsheet 4).

---

## I. Alokasi Sprint & Prioritas MoSCoW (Hasil Pembaruan Jobsheet 4)

| No | ID Kebutuhan | Butir Backlog | Prioritas | Estimasi Sprint | Alasan & Nilai Tambah |
|:---:|:---:|:---|:---:|:---:|:---|
| 1 | `KF-01` | Formulir cepat pencatatan transaksi pulsa dan paket data (nomor HP, operator, nominal, harga beli, harga jual). | **Must** | **Sprint 1** | Transaksi pulsa adalah aktivitas harian tersering (puluhan kali per hari). Wajib selesai pertama. |
| 2 | `KF-02` | Validasi format nomor HP Indonesia (08xx / 628xx) dan deteksi otomatis operator (Telkomsel, Indosat, XL, Tri, Smartfren). | **Must** | **Sprint 1** | Mengurangi kesalahan penjaga konter salah memilih menu operator dan salah ketik nomor. |
| 3 | `KF-03` | Pencatatan transaksi voucher internet fisik & kartu perdana otomatis mengurangi sisa stok fisik. | **Must** | **Sprint 1** | Menghindari selisih antara catatan buku dengan stok voucher yang tergantung di etalase. |
| 4 | `KF-04` | Penolakan transaksi voucher fisik bila stok habis dengan pesan peringatan jelas. | **Must** | **Sprint 1** | Mencegah kasir menjual voucher yang barang fisiknya sudah tidak tersedia. |
| 5 | `KF-05` | Rekapitulasi transaksi harian: total omzet, total modal, dan estimasi laba kotor harian. | **Must** | **Sprint 2** | Pemilik konter tidak perlu lagi menghitung laba manual dengan kalkulator setiap tutup toko. |
| 6 | `KF-06` | Pencatatan status pembayaran "Kasbon" / Piutang pelanggan (nama pelanggan, kontak, tanggal, batas tempo). | **Must** | **Sprint 2** | Piutang pelanggan tetangga sering terlupa dicatat dan menyebabkan modal macet. |
| 7 | `KF-07` | Pelunasan kasbon pelanggan (bisa dicicil atau lunas sekaligus) serta pencatatan tanggal lunas. | **Must** | **Sprint 2** | Menjaga riwayat aliran kas masuk dari tagihan piutang lama. |
| 8 | `KF-08` | Autentikasi login multi-peran: Pemilik Konter (akses penuh) dan Penjaga Konter (transaksi & kasbon saja). | **Must** | **Sprint 2** | Pemilik ingin menyembunyikan data laba bersih dan modal akumulasi dari penjaga shift. |
| 9 | `KF-09` | Peringatan dini voucher fisik mendekati tanggal kedaluwarsa (≤ 7 hari sebelum expired). | **Should** | **Sprint 3** | Menghindari kerugian akibat voucher hangus sebelum sempat terjual ke pelanggan. |
| 10 | `KF-10` | Filter riwayat transaksi berdasarkan operator dan rentang tanggal tertentu. | **Should** | **Sprint 3** | Memudahkan audit jika ada komplain pelanggan atau selisih setoran vendor. |
| 11 | `KF-11` | Cetak nota transaksi termal (Bluetooth/USB printer 58mm) atau salin teks struk untuk dikirim via WhatsApp. | **Could** | — | Nilai tambah jika pelanggan meminta bukti pembayaran token PLN atau pulsa besar. |
| 12 | `KF-12` | Ekspor rekapitulasi laporan bulanan ke format file CSV/Excel. | **Could** | — | Dikerjakan bila ada sisa waktu pada Sprint 3. |

---

## II. Rincian Pembagian Tugas Kecil untuk Sprint 1 (Durasi 2 Minggu)

Tugas Sprint 1 dirancang kecil dan spesifik (maksimal 1 hari kerja per tugas) untuk dikerjakan tim:

| ID Tugas | Mengacu ke | Uraian Tugas Teknis | Penanggung Jawab | Estimasi | Status |
|:---:|:---:|:---|:---:|:---:|:---:|
| `TSK-101` | Fondasi | Inisialisasi struktur folder Bun + Hono, konfig SQLite via `bun:sqlite`, dan file skema awal `src/db.ts`. | SM / Dev | 0.5 hari | Selesai |
| `TSK-102` | `KF-02` | Buat modul fungsi `detectOperator(phone: string)` untuk deteksi otomatis prefix nomor HP. | Dev | 0.5 hari | Siap |
| `TSK-103` | `KF-02` | Tulis unit test untuk validasi nomor HP dan operator di `src/index.test.ts`. | QA / Dev | 0.5 hari | Siap |
| `TSK-104` | `KF-01` | Buat halaman beranda formulir cepat penjualan pulsa (input nomor, nominal, modal, jual). | Dev | 1 hari | Siap |
| `TSK-105` | `KF-01` | Buat endpoint POST `/api/transaksi` untuk menyimpan penjualan pulsa langsung ke database. | Dev | 1 hari | Siap |
| `TSK-106` | `KF-03` | Buat tabel database `vouchers` (kode, nama_paket, operator, stok, harga_beli, harga_jual, expired_date). | Dev | 0.5 hari | Siap |
| `TSK-107` | `KF-03` | Logika pengurangan stok voucher saat transaksi jenis fisik berhasil dicatat. | Dev | 0.5 hari | Siap |
| `TSK-108` | `KF-04` | Validasi penolakan jika stok voucher = 0 dengan pesan error `"Stok voucher habis!"`. | Dev | 0.5 hari | Siap |
| `TSK-109` | DoD | Jalankan uji regresi `bun test` dan review Pull Request Sprint 1. | Tim | 0.5 hari | Siap |

---

## III. Hal yang Sengaja Tidak Dikerjakan (*Won't Have Kali Ini*)
1. **Integrasi API otomatis ke server distributor pulsa:** Aplikasi fokus pada pencatatan internal kasir konter. Eksekusi pengisian pulsa tetap dilakukan kasir melalui aplikasi distributor/chip masing-masing.
2. **Aplikasi native Android/iOS di Google Play:** Aplikasi menggunakan web responsif ramah layar ponsel via browser untuk menghemat waktu dan biaya.
