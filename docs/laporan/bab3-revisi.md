# Revisi dan Integrasi Bab 3 — RPL Konter Sampit

> Ringkasan perubahan yang perlu masuk ke Laporan Bab 3 (RTM-1) agar konsisten dengan implementasi v1.0.0. Dokumen `.docx`/PDF final disusun pengguna.

## 1. Pemetaan subbab dan sumber

| Subbab | Isi | Sumber | Perubahan/ catatan |
|---|---|---|---|
| 3.1 | Gambaran objek dan metode pengembangan | `PRD.md`, catatan elisitasi, `aturan-proyek.md`, jurnal | Tim **satu orang** (Hendra); jobsheet menyarankan kelompok 2–3, kondisi sebenarnya ditulis jujur |
| 3.2 | Analisis kebutuhan | `docs/elisitasi/`, `docs/srs.md`, `PRD.md` | ID KF-10/11/12 disamakan dengan SRS; ekspor CSV dikeluarkan dari lingkup |
| 3.3 | Pemodelan sistem | `docs/uml/` | Use case/skenario/activity tetap; aktor Pemilik/Kasir |
| 3.4 | Perancangan basis data dan arsitektur | `docs/desain/` | Tambah `voucher_masuk`; lima tabel menjadi enam; arsitektur Bun/Hono |
| 3.5 | Perancangan antarmuka | `docs/desain/wireframe/` | 12 wireframe + navigasi + anotasi; halaman 403 dan kondisi galat |
| 3.6 | Rencana pengujian | `docs/pengujian/rencana-uji.md`, `test-case.md` | 50+ TC; hasil aktual 119 uji otomatis |

## 2. Perubahan penting yang harus disebut di Bab 3

1. **Stack:** Bun + Hono + `bun:sqlite` + Hono JSX + `bun:test`, bukan Flask/Jinja/pytest. Alasan dan aturan ada di `aturan-proyek.md`.
2. **Tim:** satu anggota; item peer review/UAT diakui sebagai pekerjaan manual yang melibatkan dosen/teman/klien, bukan dikarang.
3. **ID KF:** KF-10 = stok/CRUD voucher, KF-11 = filter riwayat, KF-12 = salin struk (Could). Backlog sebelumnya menukar ID ini; sudah diperbaiki.
4. **Skema:** tambah `voucher_masuk` sebagai ledger penambahan stok (KF-10). `vouchers.stok` adalah saldo terkendali; penjualan mengurangi, voucher masuk menambah, keduanya atomik.
5. **Normalisasi:** `laba`, `status_bayar`, `nominal` kasbon, dan `tanggal_pinjam` tidak disimpan; pelanggan dipisah ke tabel `pelanggan`.
6. **Keamanan:** login Argon2id, sesi bertanda tangan, peran di server, CSRF, rate limit, CSP. Detail di `docs/temuan-keamanan.md`.
7. **Antarmuka:** CSS/JS dipisah ke `public/`; dashboard menyesuaikan peran; 403 disediakan.
8. **Pengujian:** hasil aktual dan cacat di `docs/pengujian/`; UAT belum dilaksanakan.

## 3. Daftar periksa konsistensi

| No | Pertanyaan | Status |
|---:|---|:---:|
| 1 | Nama aktor/istilah sama di SRS, UML, wireframe, kamus data? | Ya (Pemilik/Kasir, voucher, kasbon) |
| 2 | ID KF/UC/TC konsisten dan saling merujuk? | Ya; matriks SRS + test case |
| 3 | Setiap gambar bernomor dan terbaca? | Wireframe/screenshot ada; nomor gambar di laporan diisi pengguna |
| 4 | Setiap tabel/gambar dijelaskan dalam narasi? | Draf Bab 4 menyediakan narasi; Bab 3 perlu disesuaikan |
| 5 | Tidak ada data pribadi klien? | Ya; data karangan |
| 6 | Tata tulis sesuai pedoman TA? | **Manual** (judul, daftar pustaka, penomoran) |
| 7 | Kontribusi/AI tercatat? | Jurnal 33 entri; bagian Penggunaan AI di PR |
| 8 | Revisi design review tercermin? | Ya; `docs/desain/review/keputusan-revisi.md` |

## 4. Yang belum dapat diselesaikan otomatis

- Konversi `.docx`/PDF dan pengumpulan LMS.
- Review silang/PR review pihak lain (templat tersedia).
- UAT dan deployment nyata.
- Hash commit/tautan PR (diisi setelah pengguna commit).
