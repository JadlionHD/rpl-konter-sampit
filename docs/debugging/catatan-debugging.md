# Catatan Debugging — Jobsheet 10

## Kasus 1: rekap harian memakai tanggal UTC

**Gejala.** Pada pukul 00.30 WIB, transaksi yang baru dicatat tidak muncul di “Omzet Hari Ini”; angka yang tampil adalah rekap kemarin. Pada pukul 08.00 WIB masalah tidak terlihat.

**Langkah reproduksi.**
1. Jalankan aplikasi pada zona Asia/Jakarta.
2. Buat transaksi pukul 00.30 WIB.
3. Buka beranda dan periksa tanggal pada kartu rekap.

**Kode sebelum perbaikan (disederhanakan).**

```ts
const hariIni = new Date().toISOString().slice(0, 10);
// 2026-11-17T17:30:00Z -> "2026-11-17", padahal WIB sudah 18 November
```

**Traceback/log.** Tidak ada exception; ini bug logika. Log menunjukkan transaksi tersimpan dengan `waktu` lokal `2026-11-18 00:30:00`, sedangkan query rekap memakai `2026-11-17`.

**Hipotesis.** `toISOString()` selalu menghasilkan UTC, sehingga tanggal WIB sebelum pukul 07.00 bergeser satu hari.

**Prompt ke AI (ringkas).** “Rekap harian memakai `new Date().toISOString()`; transaksi 00.30 WIB masuk ke tanggal kemarin. Jelaskan penyebab dan usulkan perbaikan tanpa mengubah skema.”

**Penyebab.** `toISOString()` mengonversi ke UTC; zona Asia/Jakarta adalah UTC+7.

**Perbaikan.** `src/lib/waktu.ts` memakai `Intl.DateTimeFormat` dengan `timeZone: "Asia/Jakarta"` dan `hourCycle: "h23"` untuk menghasilkan `YYYY-MM-DD HH:MM:SS`. Semua penulisan waktu dan rekap memakai fungsi ini.

**Uji pencegah.** `tests/waktu.test.ts`:

```ts
const diniHari = new Date("2026-11-17T17:30:00Z");
expect(tanggalLokal(diniHari)).toBe("2026-11-18");
expect(waktuLokal(diniHari)).toBe("2026-11-18 00:30:00");
```

**Keputusan.** Terima. Perbaikan kecil, teruji, dan tidak mengubah format penyimpanan.

---

## Kasus 2: uji otomatis menulis ke basis data kerja

**Gejala.** Setelah `bun test`, data di `konter.sqlite` bertambah/berubah.

**Reproduksi.** Jalankan `bun test`, lalu buka `konter.sqlite` dan hitung baris `transactions`.

**Hipotesis.** Modul `src/db.ts` membuka `konter.sqlite` saat diimpor; uji memakai koneksi yang sama.

**Perbaikan.** Uji memakai `inisialisasiDatabase(":memory:")` melalui `tests/bantuan.ts`; koneksi ditutup pada `afterEach`. `konter.sqlite` tidak lagi disentuh.

**Uji pencegah.** `tests/transaksi.test.ts` dan `tests/voucher-crud.test.ts` membuat DB baru pada setiap uji; `tests/cek_skema.ts` juga memakai `:memory:`.

**Keputusan.** Terima. Isolasi uji adalah syarat agar hasil dapat dipercaya.

---

## Latihan debugging manual

Untuk memenuhi latihan berpasangan, pengguna dapat membuat branch `latihan/debug`, menyisipkan satu kesalahan kecil (mis. salah nama kolom atau lupa `await c.req.parseBody()`), lalu meminta rekan menemukannya. Branch tersebut **tidak boleh di-merge**. Agen tidak membuat commit; perintah diberikan di chat.
