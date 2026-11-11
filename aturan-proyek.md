# Aturan Proyek untuk Asisten AI — rpl-konter-sampit

> Dokumen ini adalah panduan teknis mengikat bagi asisten AI saat mengusulkan, mengubah, atau menghasilkan kode untuk proyek **rpl-konter-sampit**. Asisten AI wajib mematuhi seluruh batasan arsitektur di bawah ini.

---

## 1. Stack Teknologi
- **Runtime & Package Manager:** [Bun](https://bun.sh) (v1.4+)
- **Framework Web:** [Hono](https://hono.dev) (v4+) dengan arsitektur modular TypeScript.
- **Basis Data:** `bun:sqlite` bawaan Bun (`import { Database } from "bun:sqlite"`).
  * *Larangan:* Dilarang menginstal atau mengimpor pustaka database eksternal seperti `better-sqlite3`, `sqlite3`, `prisma`, atau `typeorm`. Gunakan API native `bun:sqlite`.
- **Test Runner:** `bun test` bawaan (`import { describe, expect, it } from "bun:test"`).

---

## 2. Struktur Direktori Proyek
```
rpl-konter-sampit/
├── .github/
│   └── pull_request_template.md  # Format standar PR
├── docs/
│   ├── kesepakatan-tim.md        # Aturan kerja tim & DoD
│   ├── product-backlog.md        # Daftar backlog terencana
│   ├── srs.md                    # SRS ringkas formal
│   ├── elisitasi/                # Dokumen elisitasi (pedoman, catatan, user story)
│   └── uml/                      # Diagram use case, skenario, dan activity
├── src/
│   ├── index.ts                  # Entrypoint server Hono dan route utama
│   ├── db.ts                     # Inisialisasi Database SQLite & skema tabel
│   └── index.test.ts             # Pengujian unit & integrasi menggunakan bun:test
├── PRD.md                        # Konteks kebutuhan produk siap-AI
├── aturan-proyek.md              # Aturan teknis ini
├── package.json                  # Manifes dependensi Bun
└── tsconfig.json                 # Konfigurasi TypeScript
```

---

## 3. Konvensi Penulisan Kode
- **Bahasa Komentar & Teks UI:** Seluruh komentar kode, label antarmuka pengguna, pesan sukses, dan pesan galat wajib menggunakan **Bahasa Indonesia** yang baku dan ramah pengguna.
- **Gaya Penamaan:**
  - Fungsi & Variabel: `camelCase` deskriptif (contoh: `catatTransaksi()`, `hitungLabaKotor()`).
  - Tabel & Kolom Database: `snake_case` (contoh: `harga_modal`, `tanggal_expired`).
  - Tipe / Interface TypeScript: `PascalCase` (contoh: `Transaksi`, `Voucher`).
- **Granularitas Commit:** Satu fitur atau satu perbaikan bug per commit dengan pesan bermakna.

---

## 4. Larangan Tegas untuk AI (*Strict Prohibitions*)
1. **Dilarang menambah dependensi npm / paket baru** tanpa persetujuan eksplisit dari tim mahasiswa di dalam chat.
2. **Dilarang menaruh rahasia:** Jangan pernah menanamkan password, token, atau connection string berstatus rahasia di dalam kode sumber.
3. **Dilarang mengubah berkas di luar yang diminta:** AI dilarang melakukan refaktor berkas lain yang tidak relevan dengan tugas spesifik yang diberikan.
4. **Dilarang menghapus atau melemahkan pengujian:** Jika suatu pengujian gagal, perbaiki implementasi logikanya, bukan menurunkan ambang atau menghapus pengujian tersebut.
5. **Dilarang mengarang fitur di luar PRD:** Jangan menambahkan fitur yang tidak tercantum dalam `PRD.md` (seperti registrasi dengan media sosial, integrasi payment gateway internasional, AI chatbot, dll).

---

## 5. Cara Menjalankan dan Menguji
- **Menjalankan mode pengembangan (auto-reload):**
  ```bash
  bun dev
  ```
- **Menjalankan server produksi:**
  ```bash
  bun start
  ```
- **Menjalankan uji otomatis:**
  ```bash
  bun test
  ```
- **Memeriksa tipe TypeScript:**
  ```bash
  bun tsc --noEmit
  ```
