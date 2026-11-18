# Keputusan Revisi Design Review — Jobsheet 7

> Bagian **Self-review** diisi dari pemeriksaan sendiri terhadap Lampiran C. Bagian **Tinjauan sejawat** menunggu sesi kelas; tidak difabrikasi.

## 1. Self-review

| No | Temuan | Kategori | Keputusan | Perubahan / alasan |
|---:|---|---|---|---|
| 1 | Halaman login belum memperlihatkan kondisi galat | Umpan balik | Terima | Menambahkan kotak pesan galat pada `wf-01-login` dan pesan seragam untuk username/kata sandi salah |
| 2 | Form ubah voucher berpotensi mengubah stok langsung | Pencegahan galat | Terima | Stok hanya berubah lewat transaksi penjualan dan `voucher_masuk`; form ubah tidak menyediakan kolom stok |
| 3 | Halaman 403 belum ada di peta navigasi | Kelengkapan | Terima | Menambahkan `wf-12-403` dan simpul 403 pada `navigasi.mmd` |
| 4 | Belum ada halaman voucher masuk untuk KF-10 | Kesesuaian kebutuhan | Terima | Menambahkan `wf-08-voucher-masuk`, tabel `voucher_masuk`, dan alur stok atomik |
| 5 | Test case awal belum memuat nilai batas umur voucher | Keterlacakan uji | Terima | Menambahkan TC-EXP-01…04 (7 hari, 8 hari, hari ini, kemarin) |
| 6 | Navigasi sempat hanya satu arah | Konsistensi | Terima | Setiap halaman memiliki tautan kembali ke beranda/login |

## 2. Tinjauan sejawat

| No | Masukan penelaah | Keputusan | Perubahan / alasan |
|---:|---|---|---|
| 1 | (diisi saat kelas) | Terima / Tolak / Tanya klien |  |
| 2 |  |  |  |
| 3 |  |  |  |

**Catatan:** hasil tinjauan kelompok lain wajib dilampirkan pada `lembar-tinjauan.md` setelah sesi. Bila tidak ada kelompok penelaah, mintalah dosen/teman sekelas dan catat kondisi sebenarnya.
