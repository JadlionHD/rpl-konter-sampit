# Anotasi Wireframe — Jobsheet 7

> Semua data pada wireframe adalah **karangan**. Tidak ada nama, nomor telepon, atau kata sandi pelanggan nyata. Nomor anotasi mengacu pada lingkaran di setiap berkas `wf-*.svg` / `.png`.

## 1. Login (`wf-01-login`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Kartu login | Fokus tugas tunggal | Hanya isian autentikasi; tidak ada menu sebelum masuk | Kesederhanaan |
| 2 | Nama pengguna | teks, wajib, 3–30 karakter | `autocomplete="username"`, `autofocus` | Pencegahan galat |
| 3 | Kata sandi | password, wajib | `autocomplete="current-password"`; tidak ditampilkan | Keamanan |
| 4 | Pesan galat | role `alert` | Pesan sama untuk username salah dan kata sandi salah | Umpan balik, keamanan |
| 5 | Tombol Masuk | POST /login | Fokus terlihat; enter mengirim form | Konsistensi |

## 2. Beranda Pemilik (`wf-02-beranda-pemilik`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Kartu kasbon aktif | total piutang | Angka dari kasbon `belum_lunas` | Keterbacaan |
| 2 | Peringatan voucher | stok + sisa hari | ≤7 hari = peringatan; lewat = kedaluwarsa | Umpan balik |
| 3 | Transaksi terbaru | 10 baris terakhir | Status diturunkan dari kasbon | Konsistensi |
| 4 | Kasbon jatuh tempo | pelanggan, nominal, tempo | Tombol “Tandai lunas” dengan konfirmasi | Pencegahan galat |

## 3. Beranda Kasir (`wf-03-beranda-kasir`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Panel terkunci | modal, laba, laporan | Hanya tampil untuk Pemilik | Otorisasi + keterbacaan |
| 2 | Transaksi shift | transaksi hari ini | Kasir tidak melihat rekap modal | Kesederhanaan |
| 3 | Kasbon aktif | piutang berjalan | Kasir boleh mencatat/melunasi kasbon | Konsistensi |

## 4. Catat Transaksi (`wf-04-transaksi`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Form transaksi | nomor, jenis, metode, harga | Satu item per transaksi | Kesederhanaan |
| 2 | Nomor HP / ID PLN | 10–13 digit angka | Pesan “Nomor HP tidak valid” | Pencegahan galat |
| 3 | Operator | otomatis dari prefix | Tidak dapat diubah dari klien | Keamanan |
| 4 | Panel kasbon | nama, kontak, tempo | Muncul hanya bila metode Kasbon; nama wajib | Umpan balik |
| 5 | Tombol Simpan | POST /api/transaksi | Sukses → PRG; galat → form tetap terisi | Umpan balik |

## 5. Jual Voucher (`wf-05-jual-voucher`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Pilih voucher | daftar master + stok | Opsi stok 0 dinonaktifkan | Pencegahan galat |
| 2 | Jumlah & metode | angka > 0, metode | Harga diambil dari master | Konsistensi |
| 3 | Panel kasbon | nama, kontak, tempo | Sama seperti transaksi pulsa | Konsistensi |
| 4 | Pesan stok | “Stok voucher habis!” | Muncul sebelum/sesudah kirim; stok tidak berubah | Umpan balik |

## 6. Inventaris Voucher (`wf-06-inventaris-voucher`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Tambah voucher | form tambah | Hanya Pemilik | Otorisasi |
| 2 | Voucher masuk | ledger penambahan | Hanya Pemilik | Konsistensi |
| 3 | Aksi baris | Ubah / Hapus | Hapus hanya POST + konfirmasi | Pencegahan galat |
| 4 | Status stok/expired | lencana | Habis dan kedaluwarsa menonjol | Keterbacaan |
| 5 | Pesan FK | “tidak dapat dihapus…” | Data yang dipakai transaksi tidak terhapus | Umpan balik |

## 7. Form Voucher (`wf-07-form-voucher`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Nama paket | wajib | Unik bersama operator | Pencegahan galat |
| 2 | Operator | allowlist | Telkomsel/Indosat/XL/Tri/Smartfren | Konsistensi |
| 3 | Stok awal | hanya saat tambah | Tidak dapat diubah saat mode ubah | Pencegahan galat |
| 4 | Harga modal/jual | angka ≥0 | Jual ≥ modal | Pencegahan galat |
| 5 | Tanggal expired | ISO | Tanggal kalender valid | Pencegahan galat |
| 6 | Simpan/Batal | POST | Galat menampilkan isian tetap | Umpan balik |

## 8. Voucher Masuk (`wf-08-voucher-masuk`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Pilih voucher | select induk | Wajib; id harus ada | Pencegahan galat |
| 2 | Jumlah | bilangan bulat > 0 | “Jumlah harus lebih dari 0” | Pencegahan galat |
| 3 | Tanggal | ISO, default hari ini | Simpan atomik dengan tambah stok | Umpan balik |

## 9. Buku Kasbon (`wf-09-kasbon`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Pencarian | nama pelanggan | GET + parameter | Konsistensi |
| 2 | Tabel kasbon | pelanggan, nominal, tempo | Urut tempo terdekat | Keterbacaan |
| 3 | Status | belum lunas / lewat tempo | Lewat tempo ditandai | Umpan balik |
| 4 | Tandai lunas | POST | Konfirmasi; kedua kali ditolak | Pencegahan galat |

## 10. Riwayat & Filter (`wf-10-riwayat-filter`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Rentang tanggal | dari/sampai | Batas inklusif; default hari ini | Pencegahan galat |
| 2 | Filter | operator, jenis, status | Allowlist; dapat digabung | Kesederhanaan |
| 3 | Tabel hasil | jam, keterangan, jual, status | Status dari kasbon | Keterbacaan |
| 4 | Hasil kosong | “Tidak ada transaksi yang cocok” | Beda dari “Belum ada transaksi” | Umpan balik |

## 11. Laporan (`wf-11-laporan`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Penanda Pemilik | lencana | Kasir mendapat 403 | Otorisasi |
| 2 | Rentang tanggal | dari/sampai | Validasi ISO | Pencegahan galat |
| 3 | Statistik | omzet, modal, laba | Dihitung dari transaksi | Keterbacaan |
| 4 | Tabel harian | tanggal, omzet, modal, laba | Angka konsisten dengan dashboard | Konsistensi |

## 12. Halaman 403 (`wf-12-403`)

| No | Elemen | Data / aksi | Aturan / pesan | Prinsip |
|---:|---|---|---|---|
| 1 | Judul | “Akses ditolak” | Status HTTP 403 | Umpan balik |
| 2 | Penjelasan | peran tidak berhak | Tidak membocorkan data | Keamanan |
| 3 | Kembali | tautan beranda | Jalan keluar jelas | Kesederhanaan |

## Contoh sebelum–sesudah

- **Sebelum:** tombol Hapus pada daftar voucher langsung mengirim POST tanpa konfirmasi dan tanpa pesan hasil.
- **Sesudah:** tombol meminta konfirmasi (`data-konfirmasi`), server menolak hapus bila voucher dipakai transaksi, lalu menampilkan pesan “Voucher tidak dapat dihapus karena sudah dipakai transaksi.” Prinsip: pencegahan galat + umpan balik.
