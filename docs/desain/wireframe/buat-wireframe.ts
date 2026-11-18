/**
 * Generator wireframe low-fidelity Jobsheet 7.
 * Jalankan: bun docs/desain/wireframe/buat-wireframe.ts
 * Hasil: wf-*.svg dan navigasi.svg (sumber yang di-commit).
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const LEBAR = 1440;
const TINGGI = 900;
const FONT = "Segoe UI, Arial, sans-serif";

const esc = (nilai: string): string =>
  nilai
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

function teks(
  x: number,
  y: number,
  isi: string,
  ukuran = 16,
  tebal = 400,
  anchor: "start" | "middle" | "end" = "start",
  warna = "#1f1f1f",
): string {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${ukuran}" font-weight="${tebal}" text-anchor="${anchor}" fill="${warna}">${esc(isi)}</text>`;
}

function kotak(
  x: number,
  y: number,
  w: number,
  h: number,
  isi?: string,
  opsi: { isian?: boolean; tebal?: number; isiAbu?: boolean } = {},
): string {
  const fill = opsi.isiAbu ? "#f2f2f2" : "#ffffff";
  const dash = opsi.isian ? ' stroke-dasharray="6 5"' : "";
  const label = isi
    ? teks(x + 12, y + 28, isi, 15, 600, "start", "#444")
    : "";
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="#777" stroke-width="${opsi.tebal ?? 1.4}"${dash}/>${label}`;
}

function isian(
  x: number,
  y: number,
  w: number,
  label: string,
  contoh: string,
): string {
  return [
    teks(x, y, label, 14, 600, "start", "#333"),
    `<rect x="${x}" y="${y + 10}" width="${w}" height="48" rx="4" fill="#fff" stroke="#999" stroke-width="1.3" stroke-dasharray="5 4"/>`,
    teks(x + 12, y + 41, contoh, 15, 400, "start", "#888"),
  ].join("");
}

function tombol(
  x: number,
  y: number,
  w: number,
  label: string,
  utama = true,
): string {
  const fill = utama ? "#d9d9d9" : "#ffffff";
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="52" rx="4" fill="${fill}" stroke="#444" stroke-width="1.6"/>`,
    teks(x + w / 2, y + 34, label, 16, 700, "middle", "#222"),
  ].join("");
}

function pesan(
  x: number,
  y: number,
  w: number,
  label: string,
  jenis: "sukses" | "galat" = "galat",
): string {
  const isi = jenis === "sukses" ? "Pesan sukses" : "Pesan galat";
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="52" rx="4" fill="#fafafa" stroke="#666" stroke-width="1.3" stroke-dasharray="7 5"/>`,
    teks(x + 12, y + 22, isi, 12, 700, "start", "#555"),
    teks(x + 12, y + 42, label, 14, 400, "start", "#333"),
  ].join("");
}

function tabel(
  x: number,
  y: number,
  w: number,
  kolom: string[],
  baris: string[][],
  lebarKolom?: number[],
): string {
  const tinggiHeader = 40;
  const tinggiBaris = 40;
  const lebar =
    lebarKolom ?? kolom.map(() => Math.floor(w / kolom.length));
  const total = lebar.reduce((a, b) => a + b, 0);
  const bagian: string[] = [
    `<rect x="${x}" y="${y}" width="${total}" height="${tinggiHeader}" fill="#e6e6e6" stroke="#777"/>`,
  ];
  let px = x;
  kolom.forEach((judul, i) => {
    bagian.push(teks(px + 10, y + 26, judul, 14, 700, "start", "#333"));
    px += lebar[i] ?? 0;
  });
  baris.forEach((row, r) => {
    const ry = y + tinggiHeader + r * tinggiBaris;
    bagian.push(
      `<rect x="${x}" y="${ry}" width="${total}" height="${tinggiBaris}" fill="#fff" stroke="#aaa"/>`,
    );
    let cx = x;
    row.forEach((sel, i) => {
      bagian.push(teks(cx + 10, ry + 26, sel, 14, 400, "start", "#222"));
      cx += lebar[i] ?? 0;
    });
  });
  const akhir = y + tinggiHeader + baris.length * tinggiBaris;
  bagian.push(
    `<rect x="${x}" y="${y}" width="${total}" height="${akhir - y}" fill="none" stroke="#777" stroke-width="1.4"/>`,
  );
  return bagian.join("");
}

function lencana(
  x: number,
  y: number,
  label: string,
  lebar = 120,
): string {
  return [
    `<rect x="${x}" y="${y}" width="${lebar}" height="26" rx="13" fill="#f0f0f0" stroke="#888"/>`,
    teks(x + lebar / 2, y + 18, label, 12, 700, "middle", "#333"),
  ].join("");
}

function anotasi(nomor: number, x: number, y: number): string {
  return [
    `<circle cx="${x}" cy="${y}" r="15" fill="#fff" stroke="#222" stroke-width="1.6"/>`,
    teks(x, y + 5, String(nomor), 13, 700, "middle", "#222"),
  ].join("");
}

function menu(aktif: string, peran: "Pemilik" | "Kasir" | "Tamu"): string {
  const semua = [
    "Beranda",
    "Transaksi",
    "Voucher",
    "Voucher Masuk",
    "Kasbon",
    "Riwayat",
    "Laporan",
  ];
  const item =
    peran === "Kasir"
      ? semua.filter((x) => x !== "Voucher Masuk" && x !== "Laporan")
      : semua;

  const bagian: string[] = [
    `<rect x="0" y="0" width="${LEBAR}" height="64" fill="#ededed"/>`,
    `<line x1="0" y1="64" x2="${LEBAR}" y2="64" stroke="#777" stroke-width="1.4"/>`,
    teks(28, 40, "RPL Konter Sampit", 20, 700),
  ];

  let x = 300;
  for (const nama of item) {
    const aktifkan = nama === aktif;
    bagian.push(teks(x, 40, nama, 15, aktifkan ? 700 : 400, "start", "#222"));
    if (aktifkan) {
      bagian.push(
        `<line x1="${x}" y1="50" x2="${x + nama.length * 8.2}" y2="50" stroke="#222" stroke-width="2.5"/>`,
      );
    }
    x += 118;
  }

  bagian.push(
    `<rect x="${LEBAR - 290}" y="14" width="190" height="36" rx="4" fill="#fff" stroke="#999"/>`,
    teks(LEBAR - 280, 38, `Hendra (${peran})`, 13, 600),
    `<rect x="${LEBAR - 92}" y="16" width="64" height="32" rx="4" fill="#fff" stroke="#777"/>`,
    teks(LEBAR - 60, 38, "Keluar", 13, 600, "middle"),
  );

  return bagian.join("");
}

function halaman(opsi: {
  judul: string;
  subjudul: string;
  aktif: string;
  peran: "Pemilik" | "Kasir" | "Tamu";
  isi: string;
  menuTampil?: boolean;
}): string {
  const bagian: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LEBAR}" height="${TINGGI}" viewBox="0 0 ${LEBAR} ${TINGGI}">`,
    `<rect width="${LEBAR}" height="${TINGGI}" fill="#ffffff"/>`,
    `<rect x="6" y="6" width="${LEBAR - 12}" height="${TINGGI - 12}" fill="none" stroke="#555" stroke-width="2"/>`,
  ];

  if (opsi.menuTampil !== false) {
    bagian.push(menu(opsi.aktif, opsi.peran));
    bagian.push(teks(32, 112, opsi.judul, 28, 700));
    bagian.push(teks(32, 140, opsi.subjudul, 14, 400, "start", "#555"));
  } else {
    bagian.push(
      `<rect x="0" y="0" width="${LEBAR}" height="64" fill="#ededed"/>`,
      `<line x1="0" y1="64" x2="${LEBAR}" y2="64" stroke="#777" stroke-width="1.4"/>`,
      teks(28, 40, "RPL Konter Sampit", 20, 700),
    );
  }

  bagian.push(opsi.isi);
  bagian.push(
    `<line x1="24" y1="856" x2="${LEBAR - 24}" y2="856" stroke="#bbb"/>`,
    teks(32, 880, `Wireframe low-fidelity — Jobsheet 7 — ${opsi.judul}`, 12, 400, "start", "#777"),
    teks(LEBAR - 32, 880, "RPL Konter Sampit", 12, 400, "end", "#777"),
  );
  bagian.push("</svg>");
  return bagian.join("\n");
}

const kartuStatistik = (
  x: number,
  y: number,
  judul: string,
  nilai: string,
): string =>
  [
    kotak(x, y, 320, 96),
    teks(x + 16, y + 28, judul, 13, 600, "start", "#666"),
    teks(x + 16, y + 68, nilai, 26, 700),
  ].join("");

const isiLogin = [
  `<rect x="450" y="180" width="540" height="470" rx="6" fill="#fff" stroke="#777" stroke-width="1.6"/>`,
  teks(720, 235, "Masuk ke Sistem", 24, 700, "middle"),
  teks(720, 262, "Gunakan akun Pemilik atau Kasir", 14, 400, "middle", "#666"),
  isian(500, 300, 440, "Nama pengguna", "contoh: hendra"),
  isian(500, 390, 440, "Kata sandi", "••••••••"),
  pesan(500, 490, 440, "Nama pengguna atau kata sandi salah.", "galat"),
  tombol(500, 562, 440, "Masuk"),
  anotasi(1, 468, 205),
  anotasi(2, 468, 330),
  anotasi(3, 468, 420),
  anotasi(4, 468, 515),
  anotasi(5, 468, 590),
  teks(720, 640, "Tidak ada akun? Hubungi pemilik untuk dibuatkan akun.", 13, 400, "middle", "#666"),
].join("\n");

const isiDashboardPemilik = [
  kartuStatistik(32, 170, "Omzet Hari Ini", "Rp1.250.000"),
  kartuStatistik(380, 170, "Modal Hari Ini", "Rp1.090.000"),
  kartuStatistik(728, 170, "Laba Kotor", "Rp160.000"),
  kartuStatistik(1076, 170, "Kasbon Aktif", "Rp75.000"),
  kotak(32, 292, 680, 236),
  teks(48, 322, "Peringatan Voucher (≤ 7 hari)", 16, 700),
  tabel(48, 340, 648, ["Paket", "Stok", "Kedaluwarsa"], [
    ["XL Combo 12GB", "5 pcs", "3 hari lagi"],
    ["Telkomsel 2.5GB", "15 pcs", "45 hari lagi"],
    ["Tri Happy 6GB", "Habis", "Sudah lewat"],
  ]),
  kotak(728, 292, 680, 236),
  teks(744, 322, "Transaksi Terbaru", 16, 700),
  tabel(744, 340, 648, ["Jam", "Keterangan", "Jual", "Status"], [
    ["10:42", "0812xxxx (Telkomsel)", "Rp12.000", "Lunas"],
    ["10:31", "Voucher XL 12GB", "Rp40.000", "Kasbon"],
    ["09:58", "Token PLN 23.000", "Rp23.000", "Lunas"],
  ]),
  kotak(32, 548, 680, 210),
  teks(48, 578, "Kasbon Jatuh Tempo", 16, 700),
  tabel(48, 596, 648, ["Pelanggan", "Nominal", "Tempo", "Aksi"], [
    ["Pak Andi", "Rp25.000", "25-11-2026", "Tandai lunas"],
    ["Bu Sari", "Rp50.000", "22-11-2026", "Tandai lunas"],
  ]),
  kotak(728, 548, 680, 210),
  teks(744, 578, "Aksi Cepat", 16, 700),
  tombol(744, 600, 280, "+ Transaksi Baru"),
  tombol(1044, 600, 300, "+ Voucher Masuk", false),
  teks(744, 700, "Menu Laporan hanya tampil untuk Pemilik.", 13, 400, "start", "#666"),
  anotasi(1, 1110, 160),
  anotasi(2, 672, 282),
  anotasi(3, 1370, 282),
  anotasi(4, 672, 538),
].join("\n");

const isiDashboardKasir = [
  kartuStatistik(32, 170, "Omzet Hari Ini", "Rp1.250.000"),
  kartuStatistik(380, 170, "Transaksi Hari Ini", "24 trx"),
  kotak(728, 170, 680, 96, undefined, { isiAbu: true }),
  teks(744, 204, "Modal, laba, dan laporan hanya untuk Pemilik.", 15, 600, "start", "#555"),
  lencana(1250, 202, "Akses terbatas", 140),
  kotak(32, 292, 680, 410),
  teks(48, 322, "Transaksi Shift Aktif", 16, 700),
  tabel(48, 340, 648, ["Jam", "Keterangan", "Jual", "Status"], [
    ["10:42", "0812xxxx (Telkomsel)", "Rp12.000", "Lunas"],
    ["10:31", "Voucher XL 12GB", "Rp40.000", "Kasbon"],
    ["09:58", "Token PLN 23.000", "Rp23.000", "Lunas"],
    ["09:40", "0813xxxx (Indosat)", "Rp25.000", "Lunas"],
  ]),
  kotak(728, 292, 680, 226),
  teks(744, 322, "Kasbon Aktif", 16, 700),
  tabel(744, 340, 648, ["Pelanggan", "Nominal", "Tempo", "Aksi"], [
    ["Pak Andi", "Rp25.000", "25-11-2026", "Tandai lunas"],
    ["Bu Sari", "Rp50.000", "22-11-2026", "Tandai lunas"],
  ]),
  kotak(728, 538, 680, 164),
  teks(744, 568, "Aksi Cepat", 16, 700),
  tombol(744, 590, 280, "+ Transaksi Baru"),
  tombol(1044, 590, 300, "Jual Voucher", false),
  anotasi(1, 1110, 160),
  anotasi(2, 672, 282),
  anotasi(3, 672, 538),
].join("\n");

const isiTransaksi = [
  kotak(32, 160, 880, 650),
  teks(48, 192, "Form Transaksi Pulsa / Data / Token", 18, 700),
  isian(48, 216, 820, "Nomor HP / ID Pelanggan PLN", "081234567890"),
  isian(48, 306, 396, "Operator terdeteksi", "Telkomsel (otomatis)"),
  isian(472, 306, 396, "Jenis transaksi", "Pulsa Reguler"),
  isian(48, 396, 396, "Metode bayar", "Tunai / QRIS / Kasbon"),
  isian(472, 396, 396, "Jatuh tempo (bila kasbon)", "2026-11-25"),
  kotak(48, 486, 820, 118, undefined, { isiAbu: true }),
  teks(64, 514, "Data kasbon (muncul bila metode = Kasbon)", 14, 700),
  isian(64, 526, 380, "Nama pelanggan", "Nama pelanggan"),
  isian(464, 526, 388, "Kontak", "0813xxxxxxxx"),
  isian(48, 624, 396, "Harga modal (Rp)", "10500"),
  isian(472, 624, 396, "Harga jual (Rp)", "12000"),
  pesan(48, 716, 820, "Harga jual minimal sama dengan harga modal.", "galat"),
  tombol(48, 786, 300, "Simpan Transaksi"),
  tombol(364, 786, 200, "Batal", false),
  anotasi(1, 1040, 190),
  anotasi(2, 1040, 250),
  anotasi(3, 1040, 440),
  anotasi(4, 1040, 500),
  anotasi(5, 1040, 760),
  kotak(940, 160, 468, 300),
  teks(956, 192, "Panduan Cepat", 16, 700),
  teks(956, 224, "• Nomor HP 10–13 digit.", 14),
  teks(956, 252, "• Operator terisi otomatis dari prefix.", 14),
  teks(956, 280, "• Harga jual tidak boleh di bawah modal.", 14),
  teks(956, 308, "• Kasbon wajib nama dan jatuh tempo.", 14),
  teks(956, 336, "• Stok voucher dicek di server.", 14),
  pesan(956, 370, 436, "Transaksi berhasil disimpan.", "sukses"),
].join("\n");

const isiJualVoucher = [
  kotak(32, 160, 760, 620),
  teks(48, 192, "Jual Voucher Fisik", 18, 700),
  isian(48, 216, 728, "Pilih voucher", "XL Xtra Combo 12GB — 5 pcs — Rp40.000"),
  isian(48, 306, 340, "Jumlah (pcs)", "1"),
  isian(404, 306, 372, "Metode bayar", "Tunai / QRIS / Kasbon"),
  kotak(48, 396, 728, 150, undefined, { isiAbu: true }),
  teks(64, 424, "Data kasbon (muncul bila metode = Kasbon)", 14, 700),
  isian(64, 436, 330, "Nama pelanggan", "Nama pelanggan"),
  isian(410, 436, 350, "Kontak", "0813xxxxxxxx"),
  isian(64, 496, 300, "Jatuh tempo", "2026-11-25"),
  pesan(48, 574, 728, "Stok voucher habis! Tersedia 0 pcs.", "galat"),
  tombol(48, 640, 300, "Jual Voucher"),
  tombol(364, 640, 200, "Batal", false),
  anotasi(1, 810, 220),
  anotasi(2, 810, 330),
  anotasi(3, 810, 470),
  anotasi(4, 810, 610),
  kotak(824, 160, 584, 300),
  teks(840, 192, "Info Stok", 16, 700),
  tabel(840, 210, 552, ["Paket", "Stok", "Harga"], [
    ["XL Combo 12GB", "5 pcs", "Rp40.000"],
    ["Telkomsel 2.5GB", "15 pcs", "Rp12.000"],
    ["Tri Happy 6GB", "Habis", "Rp20.000"],
  ]),
  teks(840, 410, "Harga diambil dari master voucher, bukan isian klien.", 13, 400, "start", "#666"),
].join("\n");

const isiInventaris = [
  kotak(32, 160, 1376, 92),
  isian(48, 176, 500, "Cari nama paket / operator", "XL"),
  tombol(568, 186, 150, "Cari", false),
  tombol(736, 186, 220, "+ Tambah Voucher"),
  tombol(972, 186, 200, "+ Voucher Masuk", false),
  tabel(32, 276, 1376, ["Paket", "Operator", "Stok", "Harga Jual", "Kedaluwarsa", "Aksi"], [
    ["Telkomsel 2.5GB 5 Hari", "Telkomsel", "15 pcs", "Rp12.000", "Aman (45 hari)", "Ubah | Hapus"],
    ["Indosat Freedom 3GB", "Indosat", "8 pcs", "Rp25.000", "Aman (20 hari)", "Ubah | Hapus"],
    ["XL Xtra Combo 12GB", "XL Axiata", "5 pcs", "Rp40.000", "3 hari lagi", "Ubah | Hapus"],
    ["Tri Happy 6GB", "Tri (3)", "Habis", "Rp20.000", "Aman (60 hari)", "Ubah | Hapus"],
  ]),
  pesan(32, 490, 700, "Voucher tidak dapat dihapus karena sudah dipakai transaksi.", "galat"),
  teks(32, 576, "Tombol Ubah/Hapus hanya untuk peran Pemilik (penegakan di server).", 14, 600, "start", "#555"),
  anotasi(1, 1030, 200),
  anotasi(2, 760, 260),
  anotasi(3, 1380, 300),
  anotasi(4, 1380, 420),
  anotasi(5, 760, 520),
].join("\n");

const isiFormVoucher = [
  kotak(250, 160, 940, 620),
  teks(280, 196, "Form Tambah / Ubah Voucher", 20, 700),
  isian(280, 222, 880, "Nama paket", "XL Xtra Combo 12GB"),
  isian(280, 312, 430, "Operator", "XL Axiata"),
  isian(730, 312, 430, "Stok awal (hanya saat tambah)", "5"),
  isian(280, 402, 430, "Harga modal (Rp)", "36000"),
  isian(730, 402, 430, "Harga jual (Rp)", "40000"),
  isian(280, 492, 430, "Tanggal kedaluwarsa", "2026-12-31"),
  pesan(280, 582, 880, "Nama paket dan operator tersebut sudah ada.", "galat"),
  tombol(280, 660, 300, "Simpan"),
  tombol(596, 660, 200, "Batal", false),
  teks(280, 746, "Saat mode ubah, kolom stok tidak dapat diubah dari form ini.", 13, 400, "start", "#666"),
  anotasi(1, 1230, 250),
  anotasi(2, 1230, 340),
  anotasi(3, 1230, 430),
  anotasi(4, 1230, 520),
  anotasi(5, 1230, 610),
  anotasi(6, 1230, 690),
].join("\n");

const isiVoucherMasuk = [
  kotak(32, 160, 1376, 260),
  teks(48, 192, "Catat Voucher Masuk", 18, 700),
  isian(48, 216, 520, "Pilih voucher (induk)", "-- pilih voucher --"),
  isian(592, 216, 300, "Jumlah masuk", "20"),
  isian(916, 216, 300, "Tanggal", "2026-11-18"),
  tombol(48, 302, 260, "Simpan Voucher Masuk"),
  pesan(340, 302, 700, "Voucher tidak ditemukan. Pilih induk yang valid.", "galat"),
  anotasi(1, 1420, 200),
  anotasi(2, 1420, 260),
  anotasi(3, 1420, 330),
  teks(32, 456, "Riwayat Voucher Masuk", 18, 700),
  tabel(32, 476, 1376, ["Tanggal", "Voucher", "Operator", "Jumlah", "Dicatat oleh"], [
    ["2026-11-18", "XL Xtra Combo 12GB", "XL Axiata", "20 pcs", "Hendra"],
    ["2026-11-17", "Telkomsel 2.5GB 5 Hari", "Telkomsel", "10 pcs", "Hendra"],
  ]),
  pesan(32, 660, 700, "Belum ada voucher masuk.", "sukses"),
  teks(32, 742, "Stok bertambah tepat sebesar jumlah; bila gagal, tidak ada baris yang tersimpan.", 13, 400, "start", "#666"),
].join("\n");

const isiKasbon = [
  kotak(32, 160, 1376, 84),
  isian(48, 176, 420, "Cari nama pelanggan", "Pak Andi"),
  tombol(484, 186, 160, "Cari", false),
  lencana(664, 200, "Hanya belum lunas", 160),
  teks(844, 218, "Urutkan: jatuh tempo terdekat", 14, 400, "start", "#555"),
  tabel(32, 268, 1376, ["Pelanggan", "Kontak", "Nominal", "Jatuh Tempo", "Status", "Aksi"], [
    ["Pak Andi", "0813xxxx", "Rp25.000", "25-11-2026", "Belum lunas", "Tandai lunas"],
    ["Bu Sari", "0812xxxx", "Rp50.000", "22-11-2026", "Lewat tempo", "Tandai lunas"],
    ["Mas Budi", "—", "Rp12.000", "01-12-2026", "Belum lunas", "Tandai lunas"],
  ]),
  pesan(32, 500, 760, "Kasbon sudah lunas. Tidak ada perubahan data.", "galat"),
  teks(32, 590, "Pelunasan mengisi status Lunas dan tanggal lunas dalam satu pernyataan.", 13, 400, "start", "#666"),
  anotasi(1, 1420, 200),
  anotasi(2, 1420, 300),
  anotasi(3, 1420, 420),
  anotasi(4, 1420, 540),
].join("\n");

const isiRiwayat = [
  kotak(32, 160, 1376, 132),
  isian(48, 176, 230, "Dari tanggal", "2026-11-01"),
  isian(294, 176, 230, "Sampai tanggal", "2026-11-18"),
  isian(540, 176, 220, "Operator", "Semua"),
  isian(776, 176, 220, "Jenis", "Semua"),
  isian(1012, 176, 180, "Status", "Semua"),
  isian(48, 238, 420, "Kata kunci nomor / voucher", "0812"),
  tombol(484, 248, 150, "Cari", false),
  tombol(650, 248, 150, "Reset", false),
  tabel(32, 316, 1376, ["Jam", "Keterangan", "Operator", "Jual", "Status", "Metode"], [
    ["10:42", "081234567890", "Telkomsel", "Rp12.000", "Lunas", "Tunai"],
    ["10:31", "XL Xtra Combo 12GB", "Voucher", "Rp40.000", "Belum lunas", "Kasbon"],
    ["09:58", "14012345678", "PLN", "Rp23.000", "Lunas", "QRIS"],
  ]),
  pesan(32, 548, 700, "Tidak ada transaksi yang cocok.", "galat"),
  teks(32, 638, "Kasir hanya melihat transaksi hari ini; Pemilik dapat memakai rentang tanggal.", 13, 400, "start", "#666"),
  anotasi(1, 1420, 200),
  anotasi(2, 1420, 260),
  anotasi(3, 1420, 350),
  anotasi(4, 1420, 470),
].join("\n");

const isiLaporan = [
  lencana(32, 168, "Khusus Pemilik", 150),
  isian(32, 212, 240, "Dari tanggal", "2026-11-01"),
  isian(288, 212, 240, "Sampai tanggal", "2026-11-18"),
  tombol(544, 222, 160, "Tampilkan", false),
  kartuStatistik(32, 292, "Omzet Periode", "Rp12.500.000"),
  kartuStatistik(380, 292, "Modal Periode", "Rp10.900.000"),
  kartuStatistik(728, 292, "Laba Kotor", "Rp1.600.000"),
  kartuStatistik(1076, 292, "Transaksi", "248 trx"),
  tabel(32, 416, 1376, ["Tanggal", "Omzet", "Modal", "Laba", "Jumlah Transaksi"], [
    ["2026-11-18", "Rp1.250.000", "Rp1.090.000", "Rp160.000", "24"],
    ["2026-11-17", "Rp1.100.000", "Rp960.000", "Rp140.000", "21"],
    ["2026-11-16", "Rp980.000", "Rp850.000", "Rp130.000", "19"],
  ]),
  teks(32, 700, "Angka dihitung dari transaksi; tidak ada kolom laba yang disimpan.", 13, 400, "start", "#666"),
  anotasi(1, 1420, 190),
  anotasi(2, 1420, 280),
  anotasi(3, 1420, 380),
  anotasi(4, 1420, 560),
].join("\n");

const isi403 = [
  `<rect x="450" y="250" width="540" height="360" rx="6" fill="#fff" stroke="#777" stroke-width="1.6"/>`,
  teks(720, 320, "Akses ditolak", 28, 700, "middle"),
  teks(720, 362, "Peran Anda tidak diizinkan membuka halaman ini.", 15, 400, "middle", "#444"),
  pesan(500, 400, 440, "Halaman ini hanya untuk Pemilik.", "galat"),
  tombol(500, 490, 440, "Kembali ke Beranda"),
  anotasi(1, 468, 275),
  anotasi(2, 468, 430),
  anotasi(3, 468, 520),
].join("\n");

const berkas: { nama: string; isi: string }[] = [
  {
    nama: "wf-01-login.svg",
    isi: halaman({
      judul: "Login",
      subjudul: "Autentikasi pengguna sebelum mengakses konter",
      aktif: "Login",
      peran: "Tamu",
      menuTampil: false,
      isi: isiLogin,
    }),
  },
  {
    nama: "wf-02-beranda-pemilik.svg",
    isi: halaman({
      judul: "Beranda — Pemilik",
      subjudul: "Ringkasan omzet, laba, stok, dan kasbon hari ini",
      aktif: "Beranda",
      peran: "Pemilik",
      isi: isiDashboardPemilik,
    }),
  },
  {
    nama: "wf-03-beranda-kasir.svg",
    isi: halaman({
      judul: "Beranda — Kasir",
      subjudul: "Ringkasan shift aktif tanpa data modal dan laba",
      aktif: "Beranda",
      peran: "Kasir",
      isi: isiDashboardKasir,
    }),
  },
  {
    nama: "wf-04-transaksi.svg",
    isi: halaman({
      judul: "Catat Transaksi",
      subjudul: "Pulsa, paket data, dan token listrik",
      aktif: "Transaksi",
      peran: "Kasir",
      isi: isiTransaksi,
    }),
  },
  {
    nama: "wf-05-jual-voucher.svg",
    isi: halaman({
      judul: "Jual Voucher Fisik",
      subjudul: "Stok berkurang otomatis setelah transaksi tersimpan",
      aktif: "Voucher",
      peran: "Kasir",
      isi: isiJualVoucher,
    }),
  },
  {
    nama: "wf-06-inventaris-voucher.svg",
    isi: halaman({
      judul: "Inventaris Voucher",
      subjudul: "Stok, harga, dan peringatan kedaluwarsa",
      aktif: "Voucher",
      peran: "Pemilik",
      isi: isiInventaris,
    }),
  },
  {
    nama: "wf-07-form-voucher.svg",
    isi: halaman({
      judul: "Form Voucher",
      subjudul: "Tambah atau ubah master voucher",
      aktif: "Voucher",
      peran: "Pemilik",
      isi: isiFormVoucher,
    }),
  },
  {
    nama: "wf-08-voucher-masuk.svg",
    isi: halaman({
      judul: "Voucher Masuk",
      subjudul: "Ledger penambahan stok dengan pilihan voucher induk",
      aktif: "Voucher Masuk",
      peran: "Pemilik",
      isi: isiVoucherMasuk,
    }),
  },
  {
    nama: "wf-09-kasbon.svg",
    isi: halaman({
      judul: "Buku Kasbon",
      subjudul: "Piutang pelanggan dan pelunasan",
      aktif: "Kasbon",
      peran: "Pemilik",
      isi: isiKasbon,
    }),
  },
  {
    nama: "wf-10-riwayat-filter.svg",
    isi: halaman({
      judul: "Riwayat dan Filter Transaksi",
      subjudul: "Cari berdasarkan tanggal, operator, jenis, status, dan kata kunci",
      aktif: "Riwayat",
      peran: "Pemilik",
      isi: isiRiwayat,
    }),
  },
  {
    nama: "wf-11-laporan.svg",
    isi: halaman({
      judul: "Laporan",
      subjudul: "Rekap omzet, modal, dan laba untuk Pemilik",
      aktif: "Laporan",
      peran: "Pemilik",
      isi: isiLaporan,
    }),
  },
  {
    nama: "wf-12-403.svg",
    isi: halaman({
      judul: "Halaman 403",
      subjudul: "Penolakan akses berdasarkan peran",
      aktif: "Beranda",
      peran: "Kasir",
      isi: isi403,
    }),
  },
];

for (const file of berkas) {
  writeFileSync(join(import.meta.dir, file.nama), file.isi, "utf8");
}

// Peta navigasi: satu simpul per halaman, panah perpindahan.
const NAV = [
  { id: "login", x: 80, y: 380, label: "Login" },
  { id: "beranda", x: 300, y: 380, label: "Beranda" },
  { id: "transaksi", x: 540, y: 180, label: "Transaksi" },
  { id: "jual", x: 540, y: 300, label: "Jual Voucher" },
  { id: "voucher", x: 540, y: 420, label: "Inventaris Voucher" },
  { id: "masuk", x: 540, y: 540, label: "Voucher Masuk (Pemilik)" },
  { id: "kasbon", x: 540, y: 660, label: "Buku Kasbon" },
  { id: "riwayat", x: 900, y: 180, label: "Riwayat & Filter" },
  { id: "laporan", x: 900, y: 300, label: "Laporan (Pemilik)" },
  { id: "form", x: 900, y: 420, label: "Form Voucher (Pemilik)" },
  { id: "403", x: 900, y: 540, label: "403" },
];

const kotakNav = (n: (typeof NAV)[number]): string => {
  const w = Math.max(180, n.label.length * 9 + 28);
  return [
    `<rect x="${n.x}" y="${n.y}" width="${w}" height="52" rx="6" fill="#f4f4f4" stroke="#555" stroke-width="1.5"/>`,
    teks(n.x + w / 2, n.y + 32, n.label, 14, 600, "middle"),
  ].join("");
};

const panah = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  putus = false,
): string =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#555" stroke-width="1.6" marker-end="url(#panah)"${putus ? ' stroke-dasharray="6 5"' : ""}/>`;

const navigasi = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">`,
  `<defs><marker id="panah" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#555"/></marker></defs>`,
  `<rect width="1440" height="900" fill="#fff"/>`,
  `<rect x="6" y="6" width="1428" height="888" fill="none" stroke="#555" stroke-width="2"/>`,
  teks(32, 54, "Peta Navigasi — RPL Konter Sampit", 26, 700),
  teks(32, 82, "Garis penuh: perpindahan utama. Garis putus-putus: keluar. Halaman bertanda (Pemilik) memerlukan peran Pemilik.", 13, 400, "start", "#555"),
  ...NAV.map(kotakNav),
  panah(260, 406, 300, 406),
  panah(480, 380, 540, 206),
  panah(480, 390, 540, 326),
  panah(480, 406, 540, 446),
  panah(480, 420, 540, 566),
  panah(480, 430, 540, 686),
  panah(480, 400, 900, 206),
  panah(480, 390, 900, 326),
  panah(720, 446, 900, 446),
  panah(720, 566, 900, 566),
  panah(720, 206, 900, 566, true),
  panah(720, 326, 900, 566, true),
  panah(720, 686, 900, 566, true),
  panah(80, 432, 80, 760),
  panah(80, 760, 300, 432, true),
  teks(84, 790, "Keluar (POST /logout) → Login", 12, 400, "start", "#666"),
  teks(540, 820, "Semua halaman punya jalan kembali ke Beranda atau Login.", 13, 400, "start", "#666"),
  `</svg>`,
].join("\n");

writeFileSync(join(import.meta.dir, "navigasi.svg"), navigasi, "utf8");

console.log(`Dibuat ${berkas.length} wireframe + navigasi.svg di ${import.meta.dir}`);
