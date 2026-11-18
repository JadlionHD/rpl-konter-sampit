# Kesepakatan Tim — rpl-konter-sampit

> Dokumen ini menjadi pedoman kerja, alur Git, penerapan Scrum, dan batasan penggunaan asisten AI. **Proyek dikerjakan secara individu oleh Hendra Gunawan.** Jobsheet menyarankan kelompok 2–3 orang; karena kondisi tim satu orang, item yang mensyaratkan peninjau pihak lain (review silang, PR reviewer, UAT) dikerjakan bersama dosen/teman sekelas dan dicatat apa adanya, bukan difabrikasi.

---

## 1. Identitas Proyek dan Peran

- **Nama Proyek:** Sistem Manajemen Operasional Warung Konter Pulsa & Data (RPL Konter Sampit)
- **Klien / Objek:** Warung Konter Pulsa & Data di Sampit, Kotawaringin Timur
- **Anggota:** **Hendra Gunawan** (NIM: 24554010026)
- **Peran:** Scrum Master, Product Owner, Developer, dan QA dijalankan oleh satu orang dengan pemisahan tugas berdasarkan tahap pekerjaan (perencanaan → desain → implementasi → pengujian → rilis).

---

## 2. Ritme Kerja

- **Perencanaan:** setiap awal jobsheet, menetapkan satu fitur kecil dan kriteria penerimaan dari PRD.
- **Eksekusi:** satu prompt = satu perubahan kecil; jalankan dan uji sebelum lanjut.
- **Tinjauan:** membaca seluruh diff, memeriksa keamanan dasar, dan mencatat keputusan Terima/Ubah/Tolak di Jurnal Vibe Coding.
- **Refleksi:** mengisi jurnal pada hari yang sama, bukan di akhir proyek.
- **Batas waktu:** pekerjaan diselesaikan sebelum pertemuan berikutnya; tidak ada klaim kolaborasi yang tidak dilakukan.

---

## 3. Aturan Git & GitHub

- **Dilarang push langsung ke `main`.** Semua perubahan melalui branch dan Pull Request.
- **Konvensi branch:**
  - Dokumen: `docs-<topik>` (contoh: `docs-antarmuka`)
  - Fitur: `fitur/<nama-fitur>` (contoh: `fitur/crud-voucher`)
  - Perbaikan: `perbaikan/<nama-bug>`
  - Rilis: `rilis/v1.0.0`
- **PR wajib memakai templat** `.github/pull_request_template.md` dan memuat ringkasan, cara menguji, serta bagian Penggunaan AI.
- **Review:** karena tim satu orang, PR ditinjau sendiri dengan daftar periksa (self-review) dan, bila memungkinkan, diminta pemeriksaan tambahan dari dosen/teman. Komentar reviewer luar dicatat di `docs/desain/review/`.
- **Pesan commit** diawali kata kerja aktif dan menjelaskan perubahan, contoh: “Tambah CRUD voucher dengan validasi stok” — bukan “update”.

---

## 4. Penggunaan Asisten AI (*Vibe Coding Terkendali*)

- Setiap sesi yang memakai AI dicatat di `jurnal-vibe-coding.md`: tujuan, prompt ringkas, hasil, keputusan, dan alasan.
- Dilarang menempelkan data pribadi klien, kata sandi, atau kunci rahasia ke prompt.
- Kode/dokumen hasil AI wajib dibaca, diuji, dan dipahami sebelum di-commit.
- AI tidak boleh menambah dependensi atau fitur di luar PRD/SRS tanpa persetujuan.

---

## 5. Definition of Done (DoD)

1. Memenuhi seluruh kriteria penerimaan pada PRD/SRS.
2. `bun test` lulus tanpa kegagalan; `bun run cek:skema` lulus.
3. Tidak ada rahasia, data pribadi, atau `konter.sqlite` yang ikut di-commit.
4. Perubahan melalui branch dan PR (self-review terdokumentasi).
5. Jurnal Vibe Coding diperbarui.
6. Dokumen terkait (kamus data, rencana uji, manual) ikut diperbarui bila perilaku berubah.

---

## 6. Penanganan Masalah

- **Pekerjaan terlambat:** kurangi cakupan fitur Could, bukan menunda pengujian.
- **Konflik keputusan teknis:** kembali ke SRS/PRD; bila tetap ambigu, catat sebagai [Asumsi] dan tanyakan ke klien/dosen.
- **Kesalahan:** dicatat di laporan cacat dan jurnal; riwayat Git tidak dihapus untuk menutupi kesalahan.

---

## 7. Persetujuan

| No | Nama | NIM | Peran | Status | Tanggal |
|:---|:---|:---|:---|:---|:---|
| 1 | Hendra Gunawan | 24554010026 | Scrum Master / Product Owner / Developer / QA | Disetujui | 18 November 2026 |
