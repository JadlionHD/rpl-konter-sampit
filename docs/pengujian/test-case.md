# Test Case — RPL Konter Sampit

> Jobsheet 13. Hasil di bawah berasal dari eksekusi **18 November 2026**. Uji otomatis: `bun test` → **119 lulus, 0 gagal**, ditambah `bun run cek:skema`. Uji manual yang belum dijalankan ditandai jujur.

## 1. Lingkungan

- Windows, Bun 1.4.4, Hono 4.13, SQLite `bun:sqlite`.
- Uji otomatis memakai basis data `:memory:`; tidak menyentuh `konter.sqlite`.
- Data uji karangan: `081234567890`, `081399887766`, `14012345678`, voucher “Voucher Uji”.
- Perintah: `bun test`, `bun run cek:skema`, `bunx tsc --noEmit`.

## 2. Hasil per KF

| KF | Uji otomatis | Status |
|---|---|---|
| KF-01 Transaksi | `tests/transaksi.test.ts` | Lulus |
| KF-02 Operator | `tests/operator.test.ts`, `tests/validasi.test.ts` | Lulus |
| KF-03/04 Stok voucher | `tests/transaksi.test.ts` | Lulus |
| KF-05 Rekap/laporan | `tests/laporan.test.ts`, `tests/transaksi.test.ts` | Lulus |
| KF-06/07 Kasbon | `tests/transaksi.test.ts` | Lulus |
| KF-08 Autentikasi/peran | `tests/auth.test.ts`, `tests/keamanan.test.ts` | Lulus |
| KF-09 Kedaluwarsa | `tests/voucher-status.test.ts` | Lulus |
| KF-10 CRUD/stok voucher | `tests/voucher-crud.test.ts`, `tests/voucher-masuk.test.ts` | Lulus |
| KF-11 Filter riwayat | `tests/pencarian.test.ts` | Lulus |
| KF-12 Salin struk | — | Tidak dikerjakan (Could) |
| KNF-04 Tampilan 360 px | — | Manual, belum dijalankan |
| KNF-05 Keamanan | `tests/keamanan.test.ts`, `tests/auth.test.ts` | Lulus |

## 3. Daftar test case

| ID | KF | Prasyarat / masukan | Langkah | Hasil diharapkan | Hasil aktual | Teknik |
|---|---|---|---|---|---|---|
| TC-TRX-01 | KF-01 | Nomor 081234567890, modal 10500, jual 12000, tunai | Kirim form transaksi | Tersimpan; omzet +12000; laba +1500 | Lulus (otomatis) | EP valid |
| TC-TRX-02 | KF-01 | Nomor 0812 | Kirim form | Ditolak “Nomor HP tidak valid” | Lulus (otomatis) | BVA bawah |
| TC-TRX-03 | KF-01 | Nomor 14 digit | Validasi nomor | Ditolak | Lulus (unit validasi) | BVA atas |
| TC-TRX-04 | KF-01 | Modal 10000, jual 9000 | Kirim form | Ditolak harga jual < modal | Lulus (otomatis) | Inv |
| TC-TRX-05 | KF-01 | Harga jual “abc” | Kirim form | Ditolak; isian tetap | Lulus (otomatis, form preservation) | Inv |
| TC-TRX-06 | KF-01 | Token 14012345678 | Kirim form | Operator PLN; tersimpan | Lulus (otomatis) | EP valid |
| TC-OPR-01 | KF-02 | 081234567890 | Deteksi | Telkomsel | Lulus (otomatis) | EP valid |
| TC-OPR-02 | KF-02 | 6285211223344 | Normalisasi + deteksi | 0852…/Telkomsel | Lulus (otomatis) | EP valid |
| TC-OPR-03 | KF-02 | 080012345678 | Deteksi | “Lainnya” | Lulus (otomatis) | Inv/EP |
| TC-OPR-04 | KF-02 | 10 digit | Validasi | Diterima | Lulus (unit) | BVA tepat |
| TC-OPR-05 | KF-02 | 13 digit | Validasi | Diterima | Lulus (unit) | BVA tepat |
| TC-STK-01 | KF-03 | Stok 2, jual 1 | Transaksi voucher | Stok 1 | Lulus (otomatis) | EP valid |
| TC-STK-02 | KF-04 | Stok 0 | Transaksi voucher | Ditolak “Stok voucher habis!” | Lulus (otomatis) | BVA bawah |
| TC-STK-03 | KF-03 | Stok 2, jual 2 | Transaksi voucher | Stok 0 | Lulus (otomatis) | BVA tepat |
| TC-STK-04 | KF-04 | Stok 2, jual 3 | Transaksi voucher | Ditolak “Stok tidak cukup: tersedia 2 pcs.” | Lulus (otomatis, mutasi terdeteksi) | BVA atas |
| TC-STK-05 | KF-04 | Jumlah 0/-1 | Transaksi voucher | Ditolak | Lulus (otomatis) | Inv/BVA |
| TC-VCR-01 | KF-10 | Form voucher valid | Tambah | Tersimpan | Lulus (otomatis) | EP valid |
| TC-VCR-02 | KF-10 | Operator+nama sama | Tambah | Ditolak “sudah ada” | Lulus (otomatis) | Inv UNIQUE |
| TC-VCR-03 | KF-10 | Voucher ada | Ubah harga/expired | Berubah; stok tetap | Lulus (otomatis) | EP valid |
| TC-VCR-04 | KF-10 | Voucher tidak dipakai | Hapus POST | Terhapus | Lulus (otomatis) | EP valid |
| TC-VCR-05 | KF-10 | Voucher dipakai transaksi | Hapus POST | Ditolak; data tetap | Lulus (otomatis) | Inv FK |
| TC-VCR-06 | KF-10 | Jual < modal | Simpan | Ditolak | Lulus (otomatis) | Inv |
| TC-VCR-07 | KF-10 | Nama kosong | Simpan | Ditolak; isian tetap | Lulus (otomatis) | Inv |
| TC-VCR-08 | KF-10 | ID 999 | Buka ubah | 404 | Lulus (otomatis) | Inv |
| TC-VCR-09 | KF-10 | Stok 5 | Voucher masuk 20 | Stok 25 | Lulus (otomatis) | EP valid |
| TC-VMS-01 | KF-10 | Voucher id 1 | Tambah voucher masuk | Stok +20; nama tampil | Lulus (otomatis) | EP valid |
| TC-VMS-02 | KF-10 | Voucher 999 | Tambah voucher masuk | Ditolak; tanpa baris | Lulus (otomatis) | Inv FK |
| TC-VMS-03 | KF-10 | Jumlah 0/-3/abc | Tambah voucher masuk | Ditolak; stok tetap | Lulus (otomatis) | Inv/BVA |
| TC-VMS-04 | KF-10 | Tanggal 18-11-2026 | Tambah voucher masuk | Ditolak format ISO | Lulus (otomatis) | Inv |
| TC-VMS-05 | KF-10 | Tanggal tidak valid | Tambah voucher masuk | Rollback total | Lulus (otomatis) | Atomisitas |
| TC-KSB-01 | KF-06 | Kasbon Pak Andi, tempo +7 | Simpan transaksi | Kasbon aktif; piutang +25000 | Lulus (otomatis) | EP valid |
| TC-KSB-02 | KF-07 | Kasbon belum lunas | Tandai lunas | Status lunas + tanggal | Lulus (otomatis) | EP valid |
| TC-KSB-03 | KF-07 | Kasbon sudah lunas | Tandai lagi | Ditolak | Lulus (otomatis) | Inv |
| TC-KSB-04 | KF-06 | Tempo kemarin | Buka beranda | Lencana “Lewat tempo” | Lulus (otomatis) | BVA |
| TC-KSB-05 | KF-06 | Nama kosong | Simpan kasbon | Ditolak | Lulus (otomatis) | Inv |
| TC-RPT-01 | KF-05 | Dua transaksi | Buka laporan | Omzet/modal/laba sesuai | Lulus (otomatis) | EP valid |
| TC-RPT-02 | KF-05 | Tanpa transaksi | Buka laporan | Angka 0/empty state | Lulus (otomatis) | BVA |
| TC-RPT-03 | KF-05/KNF-05 | Login kasir | Buka dashboard | Laba/modal tidak tampil | Lulus (otomatis) | Otorisasi |
| TC-SEC-01 | KF-08 | Kredensial benar | Login | Sesi dibuat | Lulus (otomatis) | EP valid |
| TC-SEC-02 | KF-08 | Kata sandi salah | Login | Pesan generik | Lulus (otomatis) | Inv |
| TC-SEC-03 | KF-08 | Username tidak ada | Login | Pesan sama | Lulus (otomatis) | Keamanan |
| TC-SEC-04 | KF-08 | Akun nonaktif | Login | Ditolak “dinonaktifkan” | Lulus (otomatis) | Inv |
| TC-SEC-05 | KF-08 | Tamu | Buka /voucher | Redirect login | Lulus (otomatis) | Otorisasi |
| TC-SEC-06 | KF-08 | Kasir | Buka /voucher/tambah | 403 | Lulus (otomatis) | Otorisasi |
| TC-SEC-07 | KF-08 | Kasir | POST hapus voucher | 403; data tetap | Lulus (otomatis) | Otorisasi POST |
| TC-SEC-08 | KF-08 | Tamu | next=https://jahat.example | Tidak dialihkan keluar | Lulus (otomatis) | Keamanan |
| TC-SEC-09 | KF-08 | Login | POST logout | Sesi kosong | Lulus (otomatis) | EP valid |
| TC-SEC-10 | KNF-05 | Akun dibuat | Periksa hash | Argon2id, bukan teks asli | Lulus (otomatis) | Keamanan |
| TC-SEC-11 | KNF-05 | POST tanpa token CSRF | Kirim | 403; data tetap | Lulus (otomatis) | CSRF |
| TC-SEC-12 | KNF-05 | 5 login gagal | Percobaan ke-6 | 429; pesan generik | Lulus (otomatis) | BVA/keamanan |
| TC-EXP-01 | KF-09 | Expired +7 hari | Buka voucher | “Expired Dalam 7 Hari” | Lulus (otomatis) | BVA tepat |
| TC-EXP-02 | KF-09 | Expired +8 hari | Buka voucher | “Aman” | Lulus (otomatis) | BVA atas |
| TC-EXP-03 | KF-09 | Expired kemarin | Buka voucher | “Kedaluwarsa” | Lulus (otomatis) | BVA bawah |
| TC-EXP-04 | KF-09 | Expired hari ini | Buka voucher | “Expired Hari Ini” | Lulus (otomatis) | BVA tepat |
| TC-FLT-01 | KF-11 | Data 0812… | Cari 0812 | Baris cocok | Lulus (otomatis) | EP valid |
| TC-FLT-02 | KF-11 | Data Telkomsel/Indosat | Filter Telkomsel | Hanya Telkomsel | Lulus (otomatis) | EP valid |
| TC-FLT-03 | KF-11 | Tanggal 18/19 | Filter 18–18 | Hanya 18 | Lulus (otomatis) | BVA |
| TC-FLT-04 | KF-11 | Voucher “Diskon 100%” | Cari % | Hanya yang memuat % literal | Lulus (otomatis) | LIKE escape |
| TC-FLT-05 | KF-11 | Ada data | Cari `' OR 1=1 --` | Tidak ada hasil; tidak error | Lulus (otomatis) | Injeksi |
| TC-FLT-06 | KF-11 | Data campuran | Gabung filter | Hasil sesuai | Lulus (otomatis) | EP kombinasi |
| TC-UI-01 | KNF-04 | Lebar 360 px | Buka login/daftar/form | Tidak ada guliran horizontal | **Belum dijalankan (manual)** | KNF |
| TC-RCP-01 | KF-12 | Transaksi | Klik salin struk | Teks tersalin | **Tidak dikerjakan (Could)** | — |

## 4. Catatan

- Uji manual UI/UAT dijadwalkan pada Jobsheet 14; hasilnya tidak dikarang.
- TC-STK-02/04 diverifikasi ulang melalui mutasi manual (lihat `laporan-cacat.md`).
- KF-12 adalah Could dan tidak menjadi syarat rilis; aplikasi tetap memiliki 11 KF Must/Should yang berfungsi.
- Hasil lengkap dapat direproduksi dengan `bun test` dan `bun run cek:skema`.
