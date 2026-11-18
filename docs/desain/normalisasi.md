# Normalisasi Data — RPL Konter Sampit

> Jobsheet 6, Langkah 6. Dokumen ini menurunkan tabel dari satu lembar catatan mentah konter hingga bentuk normal ketiga (3NF), lalu menyelaraskannya dengan `erd.mmd`, `kamus-data.md`, dan `schema.sql`.

## 1. Data mentah (satu lembar catatan harian konter)

Contoh lembar catatan milik kasir. Satu baris = satu nota; isi nota ditulis bebas dan bisa memuat lebih dari satu barang.

| no_nota | tanggal | jam | nama_kasir | peran_kasir | isi_nota | nama_pelanggan | kontak | tempo | metode_bayar | status | tanggal_lunas |
|---|---|---|---|---|---|---|---|---|---|---|---|
| N-001 | 18-11-2026 | 08:15 | Sari | kasir | `081234567890 Telkomsel pulsa 10.000 (modal 10.500, jual 12.000)` | — | — | — | tunai | — | — |
| N-002 | 18-11-2026 | 09:02 | Sari | kasir | `Voucher Telkomsel 2.5GB 5 Hari x1 (modal 10.500, jual 12.000); Voucher XL Xtra Combo 12GB x1 (modal 36.000, jual 40.000)` | Pak Andi | 081399887766 | 25-11-2026 | kasbon | belum lunas | — |
| N-003 | 18-11-2026 | 10:40 | Budi | pemilik | `081399887766 Indosat paket data 25.000 (modal 22.000, jual 25.000)` | — | — | — | qris | — | — |
| N-004 | 18-11-2026 | 11:15 | Budi | pemilik | `14012345678 Token PLN 23.000 (modal 20.500, jual 23.000)` | Pak Andi | 081399887766 | 25-11-2026 | kasbon | belum lunas | — |

Masalah yang terlihat:

1. Sel `isi_nota` tidak atomik (berisi beberapa fakta sekaligus), dan N-002 memuat kelompok berulang (dua voucher dalam satu sel).
2. Tanggal ditulis `18-11-2026`, bukan format ISO `2026-11-18`.
3. Nama dan kontak pelanggan diulang di setiap baris kasbon.
4. `status` dan `tanggal_lunas` saling bergantung; `peran_kasir` bergantung pada `nama_kasir`.
5. Harga modal/jual, laba, dan nominal kasbon tercampur; laba dan nominal sebenarnya dapat dihitung.

## 2. Bentuk Normal Pertama (1NF)

Syarat: setiap sel berisi satu nilai atomik dan tidak ada kelompok berulang.

Tindakan: pecah `isi_nota` menjadi satu baris per item, dan pecah N-002 menjadi dua baris.

| no_nota | no_urut | tanggal | jam | nama_kasir | peran_kasir | jenis | nomor_tujuan | nama_voucher | operator_voucher | jumlah | harga_modal | harga_jual | metode_bayar | nama_pelanggan | kontak | tempo | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| N-001 | 1 | 2026-11-18 | 08:15 | Sari | kasir | pulsa | 081234567890 | — | Telkomsel | 1 | 10500 | 12000 | tunai | — | — | — | — |
| N-002 | 1 | 2026-11-18 | 09:02 | Sari | kasir | voucher | — | Telkomsel 2.5GB 5 Hari | Telkomsel | 1 | 10500 | 12000 | kasbon | Pak Andi | 081399887766 | 2026-11-25 | belum lunas |
| N-002 | 2 | 2026-11-18 | 09:02 | Sari | kasir | voucher | — | XL Xtra Combo 12GB | XL Axiata | 1 | 36000 | 40000 | kasbon | Pak Andi | 081399887766 | 2026-11-25 | belum lunas |
| N-003 | 1 | 2026-11-18 | 10:40 | Budi | pemilik | data | 081399887766 | — | Indosat | 1 | 22000 | 25000 | qris | — | — | — | — |
| N-004 | 1 | 2026-11-18 | 11:15 | Budi | pemilik | token | 14012345678 | — | PLN | 1 | 20500 | 23000 | kasbon | Pak Andi | 081399887766 | 2026-11-25 | belum lunas |

1NF terpenuhi: satu baris = satu item; kunci sementara adalah `(no_nota, no_urut)`.

## 3. Bentuk Normal Kedua (2NF)

Syarat: 1NF dan setiap kolom non-kunci bergantung pada **seluruh** kunci, bukan sebagian.

Kunci gabungan `(no_nota, no_urut)` membuat ketergantungan sebagian terlihat:

| Kolom | Bergantung pada | Akibat |
|---|---|---|
| tanggal, jam, nama_kasir, peran_kasir, metode_bayar | `no_nota` saja | ketergantungan sebagian → pindahkan ke tabel NOTA |
| nama_voucher, operator_voucher, stok, tanggal_expired | `nama_voucher` saja | ketergantungan sebagian → pindahkan ke tabel VOUCHER |
| nama_pelanggan, kontak, tempo, status | data kasbon (item yang dibayar belakangan) | ketergantungan sebagian → pindahkan ke tabel KASBON |
| jenis, nomor_tujuan, jumlah, harga_modal, harga_jual | `(no_nota, no_urut)` penuh | tetap di tabel ITEM |

Hasil 2NF:

- `NOTA(no_nota, tanggal, jam, nama_kasir, peran_kasir, metode_bayar)`
- `ITEM(no_nota, no_urut, jenis, nomor_tujuan, nama_voucher, jumlah, harga_modal, harga_jual)`
- `VOUCHER(nama_voucher, operator_voucher, stok, harga_modal, harga_jual, tanggal_expired)`
- `KASBON(no_nota, no_urut, nama_pelanggan, kontak, tempo, status, tanggal_lunas)`

## 4. Bentuk Normal Ketiga (3NF)

Syarat: 2NF dan tidak ada kolom non-kunci yang bergantung pada kolom non-kunci lain (ketergantungan transitif).

| Pelanggaran | Ketergantungan transitif | Perbaikan |
|---|---|---|
| `peran_kasir` | `peran_kasir` → `nama_kasir` | buat tabel `pengguna(username, password_hash, peran, aktif)` |
| `nama_pelanggan`, `kontak` pada setiap kasbon | data pelanggan berulang → anomali ubah/hapus | buat tabel `pelanggan(nama, kontak)`; kasbon menyimpan `pelanggan_id` |
| `laba` | `laba = harga_jual - harga_modal` | **dihapus**; dihitung saat dibaca (`SUM(harga_jual - harga_modal)`) |
| `status_bayar` pada transaksi | `status_bayar` ditentukan oleh `metode_bayar` dan `debts.status` | **dihapus**; status tampilan diturunkan dari `LEFT JOIN debts` |
| `nominal` kasbon | `nominal = transactions.harga_jual` | **dihapus**; nominal dibaca dari transaksi terkait |
| `tanggal_pinjam` kasbon | sama dengan tanggal `transactions.waktu` | **dihapus**; memakai `transactions.waktu` |
| `operator_voucher` pada transaksi voucher | `operator` dapat dibaca dari `vouchers.operator` | tidak disimpan untuk transaksi voucher; `operator` hanya diisi untuk pulsa/data/token |
| `nama_voucher`/harga voucher pada transaksi | harga berubah sewaktu-waktu | `voucher_id` sebagai FK; **harga_modal/harga_jual tetap disimpan** sebagai fakta saat transaksi (pengecualian snapshot) |

## 5. Hasil akhir 3NF (selaras dengan ERD)

1. **pengguna** — `id` (PK), `username` (UK), `password_hash`, `peran`, `aktif`
2. **vouchers** — `id` (PK), `nama_paket`, `operator`, `stok`, `harga_modal`, `harga_jual`, `tanggal_expired`; unik `(operator, nama_paket)`
3. **voucher_masuk** — `id` (PK), `voucher_id` (FK), `jumlah`, `tanggal`, `pengguna_id` (FK); ledger penambahan stok
4. **pelanggan** — `id` (PK), `nama`, `kontak`; unik `(nama, kontak)`
5. **transactions** — `id` (PK), `waktu`, `jenis`, `nomor_tujuan`, `operator`, `voucher_id` (FK), `jumlah`, `harga_modal`, `harga_jual`, `metode_bayar`, `pengguna_id` (FK, sementara opsional hingga login JS11)
6. **debts** — `id` (PK), `transaction_id` (FK, unik = relasi 1:1), `pelanggan_id` (FK), `tanggal_tempo`, `status`, `tanggal_lunas`

ERD, kamus data, dan `schema.sql` memakai enam tabel yang sama.

## 6. Keputusan desain yang perlu dicatat

1. **Satu transaksi = satu item.** Nota multi-item seperti N-002 dipecah menjadi beberapa transaksi. Ini sesuai alur kasir yang melayani satu pembelian per transaksi dan menghindari tabel detail yang belum dibutuhkan PRD.
2. **Tidak ada relasi banyak-ke-banyak.** Karena satu transaksi hanya memuat satu item, hubungan voucher–transaksi bersifat satu-ke-banyak. Bila klien kelak meminta satu nota berisi banyak voucher, tambahkan tabel penghubung `transaction_items(transaction_id, voucher_id, jumlah, harga_modal, harga_jual)` pada versi berikutnya — bukan pada v1.0.
3. **Snapshot harga.** `transactions.harga_modal` dan `harga_jual` tetap disimpan walau `voucher_id` menunjuk master voucher. Harga saat transaksi harus tetap walau harga master berubah (alasan yang sama dengan `harga_satuan` pada jobsheet).
4. **Status kasbon disimpan eksplisit** karena KF-06/KF-07 menyebut status `belum_lunas`/`lunas` sebagai keadaan yang wajib dilaporkan. Konsistensi dengan `tanggal_lunas` dijaga `CHECK` di `schema.sql`, sehingga tidak ada dua sumber kebenaran.
5. **`pengguna_id` pada transaksi bersifat opsional sementara** [Asumsi]. Kolom ini untuk jejak audit dan baru wajib terisi setelah login dibangun pada Jobsheet 11. Tambahan ini akan dikonfirmasi ke klien; bila ditolak, kolom dihapus tanpa mengubah tabel lain.
6. **Uang INTEGER (rupiah tanpa desimal), tanggal TEXT ISO.** Tanggal/jam disimpan sebagai `YYYY-MM-DD HH:MM:SS` dan tanggal saja `YYYY-MM-DD`, divalidasi `CHECK` di skema.
7. **`voucher_masuk` adalah ledger, bukan duplikasi stok.** `vouchers.stok` menyimpan saldo terkini agar penjualan cepat; setiap perubahan saldo memiliki baris ledger (penjualan di `transactions`, penambahan di `voucher_masuk`). Keduanya ditulis dalam satu transaksi basis data sehingga tidak ada perubahan stok tanpa jejak.

## 7. Perubahan terhadap PRD “Data Awal”

| PRD Data Awal | Rancangan 3NF | Alasan |
|---|---|---|
| `transactions.laba` | dihapus; dihitung `harga_jual - harga_modal` | nilai turunan; mencegah data ganda/tidak sinkron |
| `transactions.status_bayar` | dihapus; diturunkan dari `debts.status` | nilainya ditentukan metode bayar dan pelunasan kasbon |
| `debts.nominal` | dihapus; memakai `transactions.harga_jual` | duplikasi nilai transaksi |
| `debts.tanggal_pinjam` | dihapus; memakai `transactions.waktu` | duplikasi tanggal transaksi |
| `debts.nama_pelanggan`, `debts.kontak` | tabel `pelanggan` + `pelanggan_id` | menghilangkan anomali ubah/hapus data pelanggan |
| `transactions` tanpa item voucher | tambah `voucher_id`, `jumlah` | KF-03/KF-04 membutuhkan hubungan stok voucher dengan transaksi |
| tidak ada tabel pengguna | tambah `pengguna` | KF-08 dan prasyarat Jobsheet 11 |
| `vouchers` tanpa keunikan | unik `(operator, nama_paket)` | mencegah produk ganda |
| belum ada ledger penambahan stok | tambah `voucher_masuk` | memenuhi KF-10 dan memberi jejak audit stok |
