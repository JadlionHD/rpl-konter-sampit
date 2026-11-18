# Latihan Tanya Jawab — RPL Konter Sampit

> Jawab tanpa membuka AI. Rujukan berkas membantu saat latihan; saat presentasi, jelaskan dengan bahasa sendiri.

## 1. Mengapa memakai Bun/Hono, bukan Flask seperti contoh jobsheet?

Stack adalah keputusan sadar penulis: Bun menyatukan runtime, package manager, dan test runner; Hono ringan dan mendukung JSX; `bun:sqlite` tidak memerlukan server DB. Keputusan dan aturan adaptasi dicatat di `aturan-proyek.md` §1 dan `docs/srs.md` §2.3. Yang dipertahankan dari jobsheet adalah arsitektur berlapis, SQL berparameter, validasi server, dan pengujian.

## 2. Di mana SQL ditulis? Mengapa?

Hanya di `src/models/`. Route mengurus HTTP, service mengurus aturan bisnis, view mengurus HTML. Dengan pemisahan ini, query dapat diuji dan tidak tercampur dengan tampilan. Contoh: `src/models/transaksi.ts`, `src/models/voucher.ts`.

## 3. Mengapa `laba` tidak disimpan sebagai kolom?

`laba = harga_jual - harga_modal` adalah nilai turunan. Menyimpannya menciptakan dua sumber kebenaran dan risiko tidak sinkron. Laba dihitung saat rekap (`SUM(harga_jual - harga_modal)`). Alasannya ada di `docs/desain/normalisasi.md`.

## 4. Apa fungsi tabel `voucher_masuk`?

Ledger penambahan stok. Setiap penambahan menulis baris ledger dan menambah `vouchers.stok` dalam satu transaksi DB. Ini memenuhi KF-10 dan memberi jejak audit; tanpa ledger, perubahan stok tidak dapat ditelusuri.

## 5. Bagaimana stok dijaga agar tidak minus?

Service memeriksa stok 0 dan jumlah > stok; model juga memakai `UPDATE ... WHERE stok >= ?` di dalam `db.transaction`. Bila salah satu langkah gagal, seluruh transaksi di-rollback. Uji: `tests/transaksi.test.ts`, `tests/voucher-masuk.test.ts`. Mutasi manual membuktikan uji menangkap regresi.

## 6. Bagaimana kata sandi disimpan?

`Bun.password.hash` dengan Argon2id; verifikasi `Bun.password.verify`. Tidak ada kata sandi asli di DB/kode. Saat username tidak ada, hash dummy tetap diverifikasi agar waktu respons tidak membocorkan akun. Lihat `src/services/autentikasi.ts`.

## 7. Bagaimana sesi dan peran bekerja?

Login menulis cookie bertanda tangan berisi `pengguna_id` (HttpOnly, SameSite=Lax). Setiap request, middleware memuat pengguna dari DB dan memeriksa `aktif`; role dibaca dari DB, bukan dari form/URL. `wajibPeran` memeriksa GET dan POST. Detail: `src/lib/sesi.ts`, `src/middleware/autentikasi.ts`.

## 8. Bagaimana CSRF dicegah?

Token acak disimpan di cookie bertanda tangan dan hidden input. Setiap POST membandingkan keduanya sebelum service dijalankan; gagal → 403. Ini mencakup login, transaksi, voucher, voucher masuk, kasbon, dan logout. Lihat `src/lib/csrf.ts` dan `tests/keamanan.test.ts`.

## 9. Apa yang salah dari kode lama?

Kode lama berupa monolit: HTML+CSS+SQL+logika dalam satu string, XSS, uji menulis DB kerja, tanggal UTC, expired hardcoded, operator dari klien, tanpa auth/CSRF. Delapan cacat didokumentasikan di `docs/pengujian/laporan-cacat.md`; sepuluh temuan di `docs/laporan-temuan.md`.

## 10. Bagaimana uji diisolasi?

`tests/bantuan.ts` memakai `inisialisasiDatabase(":memory:")` dan skema; koneksi ditutup `afterEach`. `tests/cek_skema.ts` juga in-memory. `konter.sqlite` tidak tersentuh.

## 11. Apa hasil uji dan mutasinya?

119 uji lulus, 0 gagal; 23 pelanggaran skema ditolak; typecheck bersih. Mutasi: cek stok dilepas → 2 uji gagal, lalu kode dipulihkan. Detail di `docs/pengujian/test-case.md` dan `laporan-cacat.md`.

## 12. Mengapa proporsi “Terima” jurnal tinggi? Apakah AI selalu benar?

Tidak. 25 Terima, 7 Ubah, 1 Tolak. “Terima” berarti hasil sesuai setelah ditinjau, bukan tanpa review. Tinjauan menemukan masalah keamanan, cakupan middleware, dan angka uji yang salah. Sampel kecil dan satu penulis; hasil tidak digeneralisasi. Lihat `docs/bab4/bab4.md` §4.6.

## 13. Apa yang belum selesai?

KF-12 (salin struk), UAT nyata, deployment klien, review silang, rate limit persisten, dan migrasi `pengguna_id` NOT NULL. Semua dicatat jujur; rencana tersedia.

## 14. Mengapa tidak memakai framework CSS?

Tidak perlu untuk 11 halaman; CSS satu berkas lebih ringan dan memenuhi KNF-04. Usulan menambah dependensi UI ditolak (jurnal entri 33) agar tidak menambah beban dan risiko.

## 15. Bagaimana membuktikan klaim di laporan?

Setiap klaim menunjuk berkas/keluaran: uji, screenshot, dokumen desain, atau keluaran `bun test`. Peta bukti ada di `docs/bab4/peta-bukti.md`; hash commit diisi setelah commit.
