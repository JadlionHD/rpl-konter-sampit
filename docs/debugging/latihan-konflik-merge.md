# Latihan Konflik Merge — Jobsheet 10

> Latihan ini dijalankan **oleh pengguna** karena membutuhkan commit dan branch. Agen tidak melakukan commit. Gunakan data karangan dan jangan mengubah `main` secara langsung.

Skenario: dua branch mengubah baris menu yang sama di `src/views/layout.tsx`.

## Langkah

1. Dari `main` yang bersih, buat dua branch:
   ```bash
   git switch -c latihan/menu-a
   ```
   Ubah daftar `tautan` di `src/views/layout.tsx` dengan menambahkan menu “Laporan” (hanya contoh).
   ```bash
   git add src/views/layout.tsx
   git commit -m "Latihan: tambah menu Laporan"
   git switch main
   git switch -c latihan/menu-b
   ```
   Ubah baris yang sama dengan menambahkan menu “Pengguna”.
   ```bash
   git add src/views/layout.tsx
   git commit -m "Latihan: tambah menu Pengguna"
   ```
2. Gabungkan branch pertama ke `main` (di latihan lokal):
   ```bash
   git switch main
   git merge latihan/menu-a
   ```
3. Masuk ke branch kedua dan tarik `main`:
   ```bash
   git switch latihan/menu-b
   git merge main
   ```
4. Buka `src/views/layout.tsx`, cari penanda `<<<<<<<`, `=======`, `>>>>>>>`. Pertahankan **kedua** menu dengan urutan yang disepakati, hapus penanda.
5. Jalankan `bun test` dan `bunx tsc --noEmit`, lalu:
   ```bash
   git add src/views/layout.tsx
   git commit -m "Selesaikan konflik menu: pertahankan Laporan dan Pengguna"
   ```
6. Hapus branch latihan setelah selesai:
   ```bash
   git branch -d latihan/menu-a latihan/menu-b
   ```

## Bukti yang dicatat

- Screenshot/teks konflik sebelum diselesaikan.
- Hasil `bun test` setelah resolusi.
- Satu kalimat pelajaran di Jurnal Vibe Coding.

**Jangan** menyelesaikan konflik dengan memilih satu sisi saja tanpa memeriksa pekerjaan branch lain.
