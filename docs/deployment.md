# Deployment — RPL Konter Sampit v1.0.0

> Lingkungan default: **komputer toko/LAN**. Deployment nyata ke komputer klien adalah langkah manual; dokumen ini menjelaskan prosedur yang harus dijalankan.

## 1. Pilihan lingkungan

| Lingkungan | Cocok untuk | Catatan |
|---|---|---|
| Komputer toko (LAN) | Kasir dan pemilik di satu lokasi | Komputer harus menyala; atur firewall; HTTP di jaringan tertutup; cadangan rutin |
| Hosting/VPS | Akses dari luar | Wajib HTTPS, reverse proxy, `COOKIE_SECURE=1`, secret di pengaturan server |
| Laptop demo | UAT/demo | Bukan rilis operasional; data demo bukan data klien |

## 2. Persiapan di komputer toko (Windows)

1. Pasang **Bun 1.4+**.
2. Salin proyek ke folder tetap, mis. `D:\aplikasi\konter`.
3. `bun install`.
4. Buat `.env` (jangan commit):
   ```env
   APP_ENV=production
   SECRET_KEY=<64 karakter acak>
   KONTER_DB=D:\data\konter.sqlite
   PORT=3000
   HOST=0.0.0.0
   COOKIE_SECURE=0
   ```
   Buat secret: `bun -e "console.log(crypto.randomUUID() + crypto.randomUUID())"`.
5. Buat akun pertama:
   ```bash
   bun run buat:pengguna
   ```
6. Jalankan `bun start`.
7. Buka `http://localhost:3000` di komputer itu; lalu `http://<IP-LAN>:3000` dari perangkat lain.
8. Izinkan port 3000 di Windows Defender Firewall (Private network).
9. Pastikan `/kesehatan` merespons `{"status":"ok","versi":"1.0.0"}`.

### Menjalankan otomatis saat Windows menyala

Gunakan **Task Scheduler**:

- Trigger: At startup.
- Action: Start a program → `C:\Users\<user>\.bun\bin\bun.exe` (sesuaikan lokasi).
- Arguments: `src/index.ts`.
- Start in: `D:\aplikasi\konter`.
- Jalankan dengan akun yang memiliki akses ke folder dan database.

Alternatif: layanan Windows (mis. NSSM) bila tersedia. Jangan memakai `bun --watch` untuk produksi.

## 3. HTTPS (opsional)

Bila aplikasi dapat diakses dari internet:

- Pasang reverse proxy (Caddy/Nginx) dengan sertifikat TLS.
- Set `COOKIE_SECURE=1`.
- Batasi akses jaringan/firewall.
- Jalankan cadangan terenkripsi dan simpan di lokasi terpisah.

## 4. Cadangan dan pemulihan

- Cadangan: `bun run cadangkan` → `backup/konter-YYYY-MM-DD-HH-MM-SS.sqlite`.
- Jadwalkan harian (Task Scheduler) dan salin hasilnya ke drive/cloud terpisah.
- Uji pemulihan minimal sekali: hentikan aplikasi, salin cadangan ke `KONTER_DB`, hapus WAL/SHM, jalankan, periksa data.
- Jangan menyimpan cadangan di folder yang sama dengan satu-satunya salinan.

## 5. Verifikasi setelah deployment

1. `/kesehatan` 200 dan versi benar.
2. Login pemilik dan kasir.
3. Catat satu transaksi, jual satu voucher, catat satu kasbon.
4. Buka laporan sebagai pemilik; pastikan kasir mendapat 403.
5. Buka dari perangkat lain di LAN; periksa cookie/sesi.
6. Matikan dan nyalakan ulang komputer; pastikan aplikasi dan data tetap ada.
7. Jalankan cadangan dan pulihkan ke DB uji.

## 6. Yang belum dilakukan

- Deployment ke komputer klien sebenarnya (tanggal dan lingkungan disepakati).
- UAT dengan klien (rencana tersedia di `docs/pengujian/rencana-uat.md`).
- Pengujian dari jaringan internet/HTTPS.

Catat hasilnya di `docs/uat/hasil-uat.md`; jangan mengarang status.
