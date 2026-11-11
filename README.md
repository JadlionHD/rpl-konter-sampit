# RPL Konter Sampit

> **Sistem Informasi & Manajemen Operasional Warung Konter Pulsa, Paket Data, & PPOB di Sampit**  
> Proyek Praktikum Mata Kuliah Rekayasa Perangkat Lunak (3 SKS) — Semester 4  
> Program Studi D3 Teknologi Informasi, Politeknik Sampit

---

## 👥 Tim Pengembang

- **Anggota 1:** Hendra Gunawan - 24554010026

---

## 🎯 Gambaran Proyek

Aplikasi web lokal responsif untuk warung konter pulsa di Kota Sampit guna mengatasi:

1. Pencatatan transaksi penjualan pulsa, kuota data, voucher fisik, dan token listrik yang cepat.
2. Manajemen inventaris ganda: barang fisik (kartu perdana, voucher) dan saldo digital.
3. Peringatan dini voucher fisik mendekati tanggal kedaluwarsa (_expired alert_).
4. Pencatatan piutang / kasbon pelanggan harian sekitar konter.
5. Rekap laba kotor harian otomatis tanpa hitung manual buku tulis.

---

## 🛠️ Stack Teknologi

- **Runtime & Package Manager:** [Bun](https://bun.sh) (v1.4+)
- **Web Framework:** [Hono](https://hono.dev) (v4+) dengan JSX/HTML rendering
- **Database:** `bun:sqlite` (SQLite terintegrasi berkecepatan tinggi)
- **Testing:** `bun test` bawaan
- **Styling:** CSS modern ramah layar ponsel & laptop kasir

---

## 🚀 Cara Menjalankan

### 1. Prasyarat

Pastikan komputer telah terpasang **Bun 1.0+** (`bun --version`).

### 2. Instalasi Dependensi

```bash
bun install
```

### 3. Menjalankan Aplikasi (Mode Development)

```bash
bun dev
```

Buka peramban pada alamat: `http://localhost:3000`

### 4. Menjalankan Uji Otomatis

```bash
bun test
```

---

## 📂 Struktur Repositori & Dokumen

- `PRD.md`: Ringkasan spesifikasi produk siap-AI (_Product Requirements Document_).
- `aturan-proyek.md`: Panduan aturan teknis dan batasan arsitektur untuk asisten AI.
- `docs/kesepakatan-tim.md`: Dokumen tata kelola tim, alur Git, Scrum, dan _Definition of Done_ (Jobsheet 2).
- `docs/product-backlog.md`: Daftar backlog produk terencana Sprint 1–3 (Jobsheet 2 & 4).
- `docs/elisitasi/`: Hasil wawancara elisitasi, pedoman, catatan fakta/asumsi, dan 12+ User Story (Jobsheet 3).
- `docs/srs.md`: Dokumen formal _Software Requirements Specification_ ringkas (Jobsheet 4 & 5).
- `docs/uml/`: Diagram Use Case, Skenario Use Case, dan Activity Diagrams (Jobsheet 5).
- `src/`: Kode sumber aplikasi web Hono + SQLite.
