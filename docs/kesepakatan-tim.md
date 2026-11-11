# Kesepakatan Tim — rpl-konter-sampit

> Dokumen ini disusun bersama oleh anggota kelompok sebagai pedoman kerja tim, alur kerja Git, penerapan Scrum, dan batasan penggunaan asisten AI dalam pengembangan proyek perangkat lunak.

---

## 1. Identitas Proyek dan Kelompok
- **Nama Proyek:** Sistem Manajemen Operasional Warung Konter Pulsa & Data (RPL Konter Sampit)
- **Klien / Objek:** Warung Konter Pulsa & Data di Sampit, Kotawaringin Timur
- **Anggota dan Peran Scrum:**
  1. **Scrum Master:** [Nama Mahasiswa 1] (NIM: [NIM 1]) — Memfasilitasi alur kerja tim, memastikan kepatuhan Git, dan memoderasi rapat.
  2. **Product Owner:** [Nama Mahasiswa 2] (NIM: [NIM 2]) — Mengelola prioritas Product Backlog, memastikan fitur menjawab kebutuhan klien, dan memvalidasi kriteria penerimaan.
  3. **Developer / Quality Assurance:** [Nama Mahasiswa 3] (NIM: [NIM 3]) — Membangun komponen antarmuka, basis data, dan memverifikasi pengujian.

---

## 2. Komunikasi Tim
- **Kanal Utama:** Grup WhatsApp Kelompok dan Discord untuk diskusi sinkron / *pair programming*.
- **Waktu Daily Scrum (15 Menit):** Setiap hari Senin dan Kamis pukul 19.30 WIB via Discord/WhatsApp Voice.
- **Tiga Pertanyaan Standar Daily Scrum:**
  1. Apa yang sudah saya selesaikan sejak pertemuan kemarin?
  2. Apa yang akan saya kerjakan hari ini?
  3. Kendala (*blocker*) apa yang saya hadapi?
- **Batas Waktu Membalas Pesan:** Maksimal 3 jam pada hari kerja normal (08.00–21.00 WIB).

---

## 3. Aturan Kolaborasi Git & GitHub
- **Dilarang keras push langsung ke branch `main`.** Semua perubahan wajib melalui branch fitur dan Pull Request (PR).
- **Konvensi Penamaan Branch:**
  - Dokumen: `docs-<nama-topik>` (contoh: `docs-srs`, `docs-uml`, `docs-backlog`)
  - Fitur Baru: `fitur-<nama-fitur>` (contoh: `fitur-transaksi`, `fitur-stok-voucher`)
  - Perbaikan Bug: `perbaikan-<nama-bug>` (contoh: `perbaikan-hitung-laba`)
- **Aturan Pull Request:**
  - Wajib menggunakan templat PR `.github/pull_request_template.md`.
  - Minimal 1 anggota tim lain harus meninjau (*review*) dan memberikan komentar bermakna sebelum memberikan **Approve**.
  - Author PR dilarang melakukan merge mandiri sebelum disetujui reviewer.
- **Konvensi Pesan Commit:**
  - Wajib diawali kata kerja aktif dan jelas: `"Tambah halaman transaksi"`, `"Perbaiki validasi kasbon"`, `"Perbarui tabel matriks keterlacakan SRS"`.

---

## 4. Aturan Penggunaan Asisten AI (*Vibe Coding Terkendali*)
- **Pencatatan Wajib:** Setiap sesi generasi kode atau dokumen menggunakan asisten AI wajib dicatat dalam Jurnal *Vibe Coding* pribadi masing-masing anggota.
- **Privasi Klien:** Dilarang menempelkan data pribadi nyata (nama asli, nomor telepon, alamat, atau saldo rekening asli narasumber) ke dalam prompt AI. Wajib menggunakan data anonim atau inisial.
- **Keamanan:** Dilarang memasukkan kredensial, token akses, password, atau API key ke dalam prompt AI.
- **Tinjau Sebelum Commit:** Kode atau dokumen hasil AI tidak boleh diterima mentah-mentah. Pengembang wajib meninjau baris demi baris, memastikan tidak ada paket siluman (*dependency bloat*), dan menguji kriteria penerimaan.

---

## 5. Definition of Done (DoD)
Sebuah butir kebutuhan/fitur dinyatakan **Selesai (Done)** hanya bila:
1. Kode/dokumen memenuhi seluruh *Acceptance Criteria* (Kriteria Penerimaan) yang tertulis di PRD/SRS.
2. Lolos pengujian otomatis (`bun test`) tanpa kegagalan uji (*0 failures*).
3. Kode bersih dari komentar uji coba (*debug*) dan tidak ada warning fatal.
4. Perubahan diajukan via Pull Request, telah ditinjau dan di-approve oleh minimal 1 rekan tim.
5. PR berhasil di-merge ke branch `main` tanpa konflik.
6. Entri Jurnal *Vibe Coding* telah diperbarui oleh pengembang bersangkutan.

---

## 6. Penanganan Masalah & Resolusi Konflik
- **Anggota Tidak Responsif / Tidak Hadir:** Jika anggota tidak merespons dalam waktu 1x24 jam dan menghambat sprint, Scrum Master akan menghubungi langsung. Jika berlanjut 2x24 jam, porsi tugas akan diredistribusi dalam Sprint Planning darurat dan dilaporkan kepada dosen pengampu.
- **Perbedaan Pendapat Teknis:** Didiskusikan bersama dengan merujuk pada keselarasan PRD dan kemudahan bagi klien. Jika suara berimbang, Product Owner memegang keputusan akhir terkait cakupan fungsional, dan Scrum Master memegang keputusan terkait standar teknis.

---

## 7. Lembar Persetujuan

| No | Nama Mahasiswa | NIM | Peran Scrum | Tanda Tangan Digital / Status | Tanggal Persetujuan |
|:---|:---|:---|:---|:---|:---|
| 1 | [Nama Mahasiswa 1] | [NIM 1] | Scrum Master | Disetujui (Approved) | 11 November 2026 |
| 2 | [Nama Mahasiswa 2] | [NIM 2] | Product Owner | Disetujui (Approved) | 11 November 2026 |
| 3 | [Nama Mahasiswa 3] | [NIM 3] | Developer / QA | Disetujui (Approved) | 11 November 2026 |
