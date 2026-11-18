# Laporan Cacat — RPL Konter Sampit

> Jobsheet 13. Seluruh cacat di bawah ditemukan dan diperbaiki selama pengerjaan Jobsheet 6–12. Tidak ada hash commit fiktif; hash diisi pengguna setelah commit.

## 1. Ringkasan

| ID | Cacat | Keparahan | Status | Uji regresi |
|---|---|---|---|---|
| DEF-01 | Rekap harian memakai tanggal UTC | Sedang | Diperbaiki | `tests/waktu.test.ts` |
| DEF-02 | XSS melalui template string HTML | Tinggi | Diperbaiki | `tests/transaksi.test.ts`, `tests/voucher-crud.test.ts` |
| DEF-03 | Uji menulis ke `konter.sqlite` | Sedang | Diperbaiki | seluruh suite memakai `:memory:` |
| DEF-04 | Cek stok tidak konsisten / stok bisa berubah tanpa ledger | Tinggi | Diperbaiki | `tests/transaksi.test.ts`, `tests/voucher-masuk.test.ts` |
| DEF-05 | Operator transaksi dipercaya dari klien | Sedang | Diperbaiki | `tests/operator.test.ts`, `tests/transaksi.test.ts` |
| DEF-06 | Peringatan kedaluwarsa hardcoded | Rendah | Diperbaiki | `tests/voucher-status.test.ts` |
| DEF-07 | Middleware peran sub-app mencocokkan rute lain (kasir 403 di riwayat) | Sedang | Diperbaiki | `tests/auth.test.ts` |
| DEF-08 | Form kehilangan isian saat validasi gagal | Rendah | Diperbaiki | `tests/transaksi.test.ts` |

## 2. Rincian

### DEF-01 — Tanggal UTC
- **Gejala:** transaksi pukul 00.30 WIB masuk ke rekap kemarin.
- **Penyebab:** `new Date().toISOString().slice(0,10)`.
- **Perbaikan:** `src/lib/waktu.ts` memakai `Intl.DateTimeFormat` Asia/Jakarta.
- **Regresi:** tanggal `2026-11-17T17:30:00Z` → `2026-11-18`.
- **Status:** Selesai.

### DEF-02 — XSS
- **Gejala:** nama pelanggan `<script>alert(1)</script>` berpotensi dieksekusi.
- **Penyebab:** HTML lama disusun dengan template string.
- **Perbaikan:** Hono JSX; data di-escape; `dangerouslySetInnerHTML` hanya untuk CSS/JS statis.
- **Regresi:** nama `<script>` tampil sebagai `&lt;script&gt;`.
- **Status:** Selesai.

### DEF-03 — Uji mengotori basis data kerja
- **Gejala:** `bun test` mengubah `konter.sqlite`.
- **Penyebab:** modul DB membuka berkas kerja saat diimpor.
- **Perbaikan:** `KONTER_DB`/`:memory:` dan `siapkanDatabaseUji()`.
- **Regresi:** seluruh suite; `cek_skema` juga in-memory.
- **Status:** Selesai.

### DEF-04 — Stok dan ledger
- **Gejala:** penjualan voucher dan penambahan stok berisiko berubah tanpa baris ledger; kegagalan kedua dapat meninggalkan data parsial.
- **Penyebab:** dua pernyataan SQL tidak dibungkus transaksi pada versi awal.
- **Perbaikan:** `db.transaction` pada `simpanTransaksi` dan `simpanVoucherMasuk`; `UPDATE ... WHERE stok >= ?` sebagai penjaga atomik.
- **Regresi:** uji atomisitas dan mutasi manual.
- **Status:** Selesai.

### DEF-05 — Operator dari klien
- **Gejala:** operator dapat dipalsukan lewat form.
- **Perbaikan:** deteksi di server; token selalu PLN; harga voucher dari master.
- **Regresi:** `tests/operator.test.ts`, `tests/transaksi.test.ts`.
- **Status:** Selesai.

### DEF-06 — Kedaluwarsa hardcoded
- **Gejala:** peringatan tidak berubah seiring waktu.
- **Perbaikan:** `statusKedaluwarsa()` menghitung selisih hari per voucher.
- **Regresi:** batas 7/8 hari, hari ini, kemarin.
- **Status:** Selesai.

### DEF-07 — Cakupan middleware peran
- **Gejala:** kasir mendapat 403 saat membuka `/riwayat` (seharusnya boleh, hanya hari ini).
- **Penyebab:** `use("*")` pada sub-app yang dipasang di `/` ikut mencocokkan rute lain.
- **Perbaikan:** `wajibPeran` dipasang per-route pada voucher masuk dan laporan.
- **Regresi:** `tests/auth.test.ts` (“kasir hanya melihat riwayat hari ini”).
- **Status:** Selesai.

### DEF-08 — Isian hilang saat galat
- **Gejala:** setelah validasi gagal, form transaksi kosong.
- **Perbaikan:** POST galat merender ulang dashboard dengan `isian` dan status 422.
- **Regresi:** `tests/transaksi.test.ts` (“mempertahankan isian…”).
- **Status:** Selesai.

## 3. Uji mutasi manual

**Mutasi:** menghapus sementara dua pemeriksaan stok di `src/services/transaksi.ts` (stok 0 dan jumlah > stok), lalu menjalankan:

```bash
bun test tests/transaksi.test.ts
```

**Hasil:** 2 uji gagal, yaitu “menolak voucher dengan stok habis” dan “menolak jumlah yang melebihi stok”. Pesan yang muncul berubah menjadi “Stok voucher tidak mencukupi saat menyimpan.” karena penjaga atomik di model tetap menolak; namun pesan bisnis yang diharapkan hilang. Ini membuktikan asersi tidak kosong.

**Tindakan:** kode dikembalikan; `bun test tests/transaksi.test.ts tests/voucher-status.test.ts` → 20 lulus, 0 gagal.

## 4. Catatan

- Cacat di atas berasal dari kode nyata dan sudah diperbaiki; tidak ada data klien yang dipakai.
- Cacat yang belum diperbaiki dicatat di `docs/temuan-keamanan.md` (mis. rate limit in-memory).
