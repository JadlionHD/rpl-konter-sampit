# Jurnal Vibe Coding — RPL Konter Sampit

Nama: **Hendra Gunawan**  
NIM: **24554010026**  
Kelompok: Individu  
Alat AI: Command Code

> Draf ini disusun jujur dari siklus kerja nyata. Setiap entri wajib ditinjau dan disesuaikan oleh penulis sebelum dikumpulkan. Keputusan **Terima/Ubah/Tolak** dan alasannya adalah bagian yang dinilai.

| No | Tujuan | Prompt (ringkas) | Hasil AI | Keputusan | Alasan |
|---:|---|---|---|---|---|
| 1 | Merancang skema dan normalisasi Jobsheet 6 | Konteks PRD/SRS + aturan proyek; minta ERD, 1NF–3NF, kamus data, schema.sql, arsitektur Bun/Hono | 5 tabel + kamus + skema; beberapa kolom turunan masih diusulkan | Ubah | Menghapus `laba`, `status_bayar`, `nominal`, `tanggal_pinjam`; memisahkan `pelanggan`; menambah `voucher_id`/`jumlah` agar KF-03/04 terlacak |
| 2 | Merapikan `src/` menjadi modular | Refactor ke routes/services/models/views/db/lib, tanpa mengubah perilaku | Struktur berlapis, 44 uji | Terima | SQL hanya di models; validasi di services; view JSX; uji memakai DB in-memory |
| 3 | [Debug] Rekap harian salah sebelum pukul 07.00 WIB | Gejala + kode `new Date().toISOString()`; minta penyebab dulu | Menunjuk UTC vs WIB; usul `Intl` zona Asia/Jakarta | Terima | Uji `tests/waktu.test.ts` membuktikan tanggal 18 Nov pada 00.30 WIB |
| 4 | Mengisolasi uji dari basis data kerja | Uji lama memakai `konter.sqlite`; minta DB sementara | `KONTER_DB`/`:memory:` + `siapkanDatabaseUji()` | Terima | `bun test` tidak lagi mengubah data kerja |
| 5 | Menutup XSS pada halaman | HTML lama disusun dari template string; minta render aman | Hono JSX + auto-escape | Terima | Uji nama `<script>` tampil sebagai teks; tidak ada HTML mentah dari data |
| 6 | [Galat: keamanan] Operator dari klien | Form mengirim `operator` yang dipercaya server | Deteksi prefix di server; harga voucher dari master | Ubah | Klien tidak boleh menentukan operator/harga transaksi |
| 7 | Merancang wireframe Jobsheet 7 | Daftar halaman dari KF/UC + prinsip Nielsen; minta SVG low-fidelity | 12 wireframe + navigasi + anotasi | Terima | Semua halaman punya kondisi galat dan jalan kembali; menu konsisten |
| 8 | Menyusun rencana uji dan matriks | KF Must/Should + kamus data; minta TC dengan EP/BVA | 30+ TC; beberapa TC belum mengacu KF | Ubah | Menambahkan ID KF, nilai batas stok/umur voucher, dan kasus tidak valid |
| 9 | Menambah ledger `voucher_masuk` | KF-10 + pola Jobsheet 10; minta desain relasi stok | Tabel + alur stok atomik | Terima | Memberi jejak audit penambahan stok; stok tetap saldo terkendali |
| 10 | CRUD voucher | Skema + aturan KF-10; minta daftar/tambah/ubah/hapus | Rute + view + validasi; stok tidak bisa diubah dari form ubah | Terima | Memenuhi pola CRUD JS9; hapus dijaga FK dan hanya POST |
| 11 | Modul voucher masuk | JOIN + pilihan induk + transaksi dua tabel | Ledger + stok bertambah dalam satu transaksi | Terima | Uji atomisitas membuktikan tidak ada baris parsial |
| 12 | Pencarian dan filter riwayat | LIKE berparameter + escape + allowlist | Filter tanggal/operator/jenis/status; `%`/`_` literal | Ubah | Sempat salah menganggap kasbon lunas bukan `lunas`; filter diperbaiki dan diuji |
| 13 | Refactor keterangan transaksi | Duplikasi logika voucher/kata kunci di dua view | Helper `keteranganTransaksi` | Terima | Perilaku tetap; uji regresi lulus sebelum/sesudah |
| 14 | Autentikasi dan peran | KF-08 + Bun.password + cookie | Login/logout, sesi bertanda tangan, middleware peran, UI menurut peran | Terima | Hash Argon2id, pesan login seragam, role dari DB, 403 diuji untuk GET/POST |
| 15 | [Debug] Kasir mendapat 403 di `/riwayat` | Gejala 403 + kode route; minta penyebab | Middleware `use("*")` pada sub-app ikut mencocokkan rute lain | Ubah | Memasang `wajibPeran` per-route, bukan `use("*")`; uji kasir riwayat lulus |
| 16 | Keamanan: CSRF, rate limit, header | Temuan JS12 + skema form | Token CSRF pada semua POST, 5 gagal/15 menit, CSP tanpa unsafe-inline | Terima | Uji tanpa/salah token 403, blokir login 429, header/CSP diperiksa |
| 17 | [Galat: uji-lemah] Uji mutasi cek stok | Lepas cek stok, jalankan uji; minta bukti asersi | 2 uji gagal (stok habis & jumlah melebihi stok) | Terima | Kode dikembalikan; uji kembali 20 lulus; asersi terbukti menangkap regresi |
| 18 | Rilis v1.0.0 | Versi, health, backup, README, manual, screenshot | 8 screenshot, 119 uji, health/backup lulus | Terima | Rilis siap; UAT/deployment/tag tetap manual |
| 19 | Analisis jurnal untuk Bab 4 | Hitung proporsi keputusan dan tag | Rekap dihitung skrip | Terima | Angka dipakai di 4.6; bukan klaim penghematan waktu |
| 20 | Test case dan hasil | 40+ TC dari rencana uji; cocokkan dengan uji nyata | 119 uji lulus; TC manual ditandai | Ubah | Awalnya menulis 113; diperbarui setelah uji rilis ditambah |
| 21 | Laporan cacat | DEF-01…DEF-08 + bukti mutasi | 8 cacat nyata diperbaiki | Terima | Setiap cacat punya uji regresi |
| 22 | Rencana UAT | Skenario pemilik/kasir + SUS | Templat UAT, belum dijalankan | Terima | Hasil tidak dikarang; sesi klien manual |
| 23 | Versi, health, konfigurasi | 1.0.0 + `/kesehatan` + validasi produksi | Versi/footer/health/uji konfigurasi | Terima | Produksi menolak secret lemah/hilang |
| 24 | Backup dan pemulihan | `VACUUM INTO` + uji buka cadangan | Skrip + uji cadangan | Terima | Cadangan tidak menimpa berkas yang ada |
| 25 | README, manual, screenshot | Dokumentasi pengguna + 8 gambar | README/manual/deployment | Terima | Data screenshot karangan; tanpa data klien |
| 26 | Templat UAT dan deployment | Lembar UAT, hasil, prosedur LAN | Templat jujur, belum diisi | Terima | Status “belum dilaksanakan” dipertahankan |
| 27 | Catatan rilis dan persiapan tag | CHANGELOG + catatan v1.0.0 | Perintah tag untuk pengguna | Terima | Agen tidak commit/tag |
| 28 | Peta bukti Bab 4 | 4.1–4.6 → sumber bukti | Peta bukti lengkap | Terima | Setiap klaim menunjuk berkas/keluaran |
| 29 | Salindia dan skrip presentasi | 12 slide + durasi 20 menit | Draf presentasi | Terima | Menekankan demo dan batasan |
| 30 | Latihan tanya jawab | Pertanyaan auth, CSRF, normalisasi, uji | Jawaban dengan rujukan kode | Terima | Latihan tanpa AI untuk kesiapan individu |
| 31 | Kartu progress check | Status KF/uji/dokumen | Kartu progress check | Terima | Item manual ditandai |
| 32 | Finalisasi Bab 3–4 | Integrasi istilah/ID + angka final | 119 uji, 8 cacat, 33 entri jurnal | Ubah | Angka diperbarui dari sumber; dokumen .docx/PDF manual |
| 33 | Tolak usulan dependensi UI | Minta tampilan lebih modern; AI mengusulkan framework CSS baru | Paket tambahan | Tolak | Tidak perlu untuk 11 halaman; CSS satu berkas lebih ringan dan sudah memenuhi KNF-04 |

## Catatan

- Entri bertanda `[Debug]` wajib memuat gejala, penyebab, perbaikan, dan uji pencegah.
- Jangan mengisi hasil sebelum siklus benar-benar dijalankan.
- Data klien pada contoh harus karangan/inisial.
