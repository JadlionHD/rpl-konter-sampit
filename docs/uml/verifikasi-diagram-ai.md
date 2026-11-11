# Laporan Verifikasi Draf Diagram AI — Jobsheet 5

> Dokumen ini mencatat proses verifikasi dan audit terhadap draf diagram UML yang digenerate menggunakan asisten AI, menggunakan **Daftar Periksa Verifikasi (Lampiran C Jobsheet 5)**.

---

## 1. Daftar Periksa Verifikasi Diagram (Lampiran C)

| No | Pertanyaan Periksa | Hasil Pemeriksaan | Catatan Penyesuaian Tim |
|:---:|:---|:---:|:---|
| 1 | Semua aktor di diagram ada di SRS/PRD? Adakah aktor tambahan yang tidak diminta? | **Ya (Lolos)** | Hanya ada 2 aktor: Penjaga Konter (Kasir) dan Pemilik Konter. AI sempat mengusulkan aktor "Distributor Server", namun ditolak. |
| 2 | Setiap use case tertelusur ke minimal satu KF? | **Ya (Lolos)** | Seluruh use case `UC-01` s.d. `UC-05` tertelusur langsung ke `KF-01` s.d. `KF-12`. |
| 3 | Adakah use case tambahan yang tidak ada di SRS (fitur "kreatif" AI)? | **Ya (Lolos)** | AI sempat menambahkan use case "Kirim SMS Otomatis" dan "Scan Barcode Kamera". Keduanya telah dihapus. |
| 4 | Notasi benar: aktor di luar batas sistem; include/extend dipakai dengan tepat? | **Ya (Lolos)** | Aktor berada di luar batas subgraph sistem. Hubungan `include` hanya dipakai untuk Deteksi Operator, dan `extend` untuk Salin Struk & Peringatan Expired (total 3 relasi). |
| 5 | Activity diagram memiliki satu awal dan minimal satu akhir? | **Ya (Lolos)** | Seluruh diagram memiliki simpul `Mulai` tunggal dan berakhir pada simpul `Selesai`. |
| 6 | Setiap keputusan memiliki semua cabang berlabel (Ya/Tidak)? | **Ya (Lolos)** | Seluruh simpul keputusan `{}` memiliki cabang jelas `Ya` dan `Tidak` / `Tunai` dan `Kasbon`. |
| 7 | Pengecualian pada skenario (mis. stok habis, kasbon) muncul di diagram? | **Ya (Lolos)** | Kondisi stok habis dan nomor tidak valid muncul sebagai percabangan pengecualian. |
| 8 | Tidak ada aktivitas buntu atau perulangan tanpa jalan keluar? | **Ya (Lolos)** | Seluruh alur error kembali ke input sebelumnya atau diarahkan ke simpul Selesai. |
| 9 | Nama aktivitas berupa kata kerja dan sesuai istilah klien? | **Ya (Lolos)** | Menggunakan kata kerja: "Kasir menginput...", "Sistem memvalidasi...", "Kasir memilih...". |
| 10 | Diagram dapat dirender tanpa galat dan terbaca di layar ponsel/laptop? | **Ya (Lolos)** | Diuji dan valid dirender via Mermaid Live Editor dan viewer VS Code. |

---

## 2. Tabel Temuan Draf AI dan Tindakan Perbaikan (Langkah 11 Jobsheet 5)

| No | Temuan pada Draf Diagram AI | Diagram Terkait | Valid? | Tindakan Perbaikan oleh Tim |
|:---:|:---|:---:|:---:|:---|
| 1 | AI menggambar basis data SQLite sebagai Aktor di luar sistem. | Use Case Diagram | **Tidak Valid (Salah)** | Menghapus basis data dari aktor. Basis data adalah komponen internal sistem, bukan aktor luar. |
| 2 | Percabangan keputusan `Cek Stok > 0` pada draf awal AI hanya memiliki cabang `Ya`, tanpa cabang `Tidak` (jalur buntu jika stok habis). | Activity 2 (Stok Voucher) | **Valid (Masalah)** | Menambahkan cabang `Tidak` yang mengarahkan ke pesan peringatan *"Stok voucher habis!"* dan mengembalikan kasir ke pemilihan voucher. |
| 3 | AI menambahkan langkah *"Kirim pesan WhatsApp otomatis ke pelanggan"* saat transaksi kasbon dicatat. | Activity 3 (Kasbon) | **Tidak Valid (Salah)** | Menghapus langkah tersebut karena di luar kesepakatan ruang lingkup PRD (*Won't Have*). Pembukuan bersifat internal konter. |
| 4 | AI lupa menyertakan simpul `Selesai` pada jalur pembatalan pelunasan kasbon. | Activity 3 (Kasbon) | **Valid (Masalah)** | Menghubungkan jalur `Batal / Belum` ke simpul `Selesai` agar diagram memiliki terminasi yang benar. |

---

## 3. Refleksi Tim pada Jurnal Vibe Coding
*Kesimpulan evaluasi:* Asisten AI sangat cepat dalam membuat kerangka dasar diagram Mermaid, namun cenderung mengabaikan jalur pengecualian (*unhappy paths*) dan sering berhalusinasi menambahkan dependensi pihak ketiga (SMS/WhatsApp gateway otomatis). Pemeriksaan manual manusia dengan daftar periksa Lampiran C mutlak diperlukan.
