# Checkpoint Prototipe — Jobsheet 12

## Persiapan

1. `bun install`
2. Pastikan `.env` berisi `SECRET_KEY` (minimal 32 karakter) dan `KONTER_DB=konter.sqlite`.
3. Buat akun demo:
   ```bash
   bun run buat:pengguna
   ```
   Buat satu akun **pemilik** dan satu akun **kasir** dengan kata sandi karangan yang Anda tentukan (minimal 8 karakter). Jangan menuliskan kata sandi pada dokumen atau screenshot.
4. Jalankan `bun dev`, buka `http://localhost:3000`.
5. Siapkan voucher contoh melalui menu Voucher → Tambah, atau gunakan seed pengembangan.

## Skrip demo 5 menit

| Waktu | Langkah | Yang ditunjukkan |
|---:|---|---|
| 0:00 | Buka `/` | Dialihkan ke login |
| 0:20 | Login **pemilik** | Dashboard penuh: omzet, laba, kasbon, voucher |
| 0:50 | Catat transaksi pulsa valid | Pesan sukses, transaksi muncul di riwayat |
| 1:20 | Jual voucher | Stok berkurang; coba stok habis → pesan “Stok voucher habis!” |
| 1:50 | Buka Voucher Masuk, tambah 10 pcs | Stok bertambah; ledger muncul |
| 2:20 | Catat kasbon, lalu buka Buku Kasbon | Piutang tampil; tombol Tandai Lunas |
| 2:50 | Riwayat: filter operator + tanggal | Hasil terfilter |
| 3:20 | Laporan | Omzet/modal/laba periode |
| 3:50 | Logout, login **kasir** | Menu tanpa Laporan/Voucher Masuk; dashboard tanpa laba |
| 4:20 | Ketik `/laporan` langsung | Halaman 403 |
| 4:40 | Kembali ke beranda | Ringkasan fitur dan rencana Sprint 3 |

## Fitur yang sengaja ditunda

- KF-12 salin struk WhatsApp (Could) — belum diimplementasikan.
- Ekspor CSV — tidak ada di SRS.
- Rate limit lintas proses/persisten — batas in-memory.
- Pemulihan kata sandi — di luar lingkup.

## Jika demo gagal

- Login gagal: periksa `SECRET_KEY` dan apakah akun dibuat pada DB yang sama (`KONTER_DB`).
- Cookie tidak tersimpan: jika memakai HTTP LAN, set `COOKIE_SECURE=0`; untuk HTTPS biarkan 1.
- Data kosong: buat voucher dan transaksi baru; jangan memakai data klien nyata.
