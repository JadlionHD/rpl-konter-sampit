/**
 * Uji pelanggaran skema — versi Bun dari Lampiran B.2 Jobsheet 6.
 *
 * Memuat docs/desain/schema.sql ke basis data in-memory, mencetak tabel dan
 * kunci asing, lalu menjalankan perintah yang HARUS DITOLAK oleh skema.
 *
 * Jalankan: bun tests/cek_skema.ts
 */
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BERKAS_SKEMA = join(import.meta.dir, "..", "docs", "desain", "schema.sql");
const TABEL_WAJIB = [
  "debts",
  "pelanggan",
  "pengguna",
  "transactions",
  "voucher_masuk",
  "vouchers",
];

const db = new Database(":memory:");
db.exec("PRAGMA foreign_keys = ON;");
db.exec(readFileSync(BERKAS_SKEMA, "utf8"));

const tabel = (
  db
    .query(
      `SELECT name FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
       ORDER BY name`,
    )
    .all() as { name: string }[]
).map((baris) => baris.name);

console.log("Tabel:", tabel.join(", "));

let masalah = 0;
for (const nama of TABEL_WAJIB) {
  if (!tabel.includes(nama)) {
    console.log(`GAGAL: tabel wajib tidak ada -> ${nama}`);
    masalah++;
  }
}

for (const nama of tabel) {
  console.log(`[${nama}]`);
  const kolom = db.query(`PRAGMA table_info(${nama})`).all() as {
    name: string;
    type: string;
    notnull: number;
    pk: number;
  }[];
  for (const k of kolom) {
    const penanda = [k.notnull ? "NOT NULL" : "", k.pk ? "PK" : ""]
      .filter(Boolean)
      .join(" ");
    console.log("  ", k.name, k.type, penanda);
  }
  const fk = db.query(`PRAGMA foreign_key_list(${nama})`).all() as {
    from: string;
    table: string;
    to: string;
  }[];
  for (const f of fk) {
    console.log(`   FK: ${f.from} -> ${f.table}.${f.to}`);
  }
}
console.log();

// --- Data valid sebagai prasyarat uji kunci asing dan keunikan ---
db.prepare(
  `INSERT INTO pengguna (username, password_hash, peran)
   VALUES ('pemilik_uji', 'hash-uji', 'pemilik')`,
).run();
db.prepare(
  `INSERT INTO vouchers
     (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
   VALUES ('Telkomsel Uji 1GB', 'Telkomsel', 5, 10000, 12000, '2026-12-31')`,
).run();
db.prepare(
  `INSERT INTO pelanggan (nama, kontak)
   VALUES ('Pak Uji', '081399887766')`,
).run();
db.prepare(
  `INSERT INTO transactions
     (waktu, jenis, nomor_tujuan, operator, harga_modal, harga_jual,
      metode_bayar, pengguna_id)
   VALUES ('2026-11-18 09:00:00', 'pulsa', '081234567890', 'Telkomsel',
           10000, 12000, 'tunai', 1)`,
).run();
db.prepare(
  `INSERT INTO transactions
     (waktu, jenis, nomor_tujuan, operator, harga_modal, harga_jual,
      metode_bayar)
   VALUES ('2026-11-18 10:00:00', 'data', '081399887766', 'Indosat',
           22000, 25000, 'kasbon')`,
).run();
db.prepare(
  `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo, status)
   VALUES (1, 1, '2026-11-25', 'belum_lunas')`,
).run();

type Kasus = { ket: string; sql: string; params?: (string | number | null)[] };

const UJI: Kasus[] = [
  {
    ket: "stok voucher negatif",
    sql: `INSERT INTO vouchers
            (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
          VALUES ('Stok Minus', 'Telkomsel', -1, 1000, 2000, '2026-12-31')`,
  },
  {
    ket: "harga jual voucher di bawah modal",
    sql: `INSERT INTO vouchers
            (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
          VALUES ('Rugi', 'Telkomsel', 1, 5000, 4000, '2026-12-31')`,
  },
  {
    ket: "tanggal expired bukan format ISO",
    sql: `INSERT INTO vouchers
            (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
          VALUES ('Tanggal Salah', 'Telkomsel', 1, 1000, 2000, '20261231')`,
  },
  {
    ket: "tanggal expired tidak ada di kalender",
    sql: `INSERT INTO vouchers
            (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
          VALUES ('30 Februari', 'Telkomsel', 1, 1000, 2000, '2026-02-30')`,
  },
  {
    ket: "voucher ganda (operator + nama_paket sama)",
    sql: `INSERT INTO vouchers
            (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
          VALUES ('Telkomsel Uji 1GB', 'Telkomsel', 1, 10000, 12000, '2026-12-31')`,
  },
  {
    ket: "username pengguna terlalu pendek",
    sql: `INSERT INTO pengguna (username, password_hash, peran)
          VALUES ('ab', 'hash', 'kasir')`,
  },
  {
    ket: "username pengguna mengandung spasi",
    sql: `INSERT INTO pengguna (username, password_hash, peran)
          VALUES ('pemilik uji', 'hash', 'kasir')`,
  },
  {
    ket: "peran pengguna tidak dikenal",
    sql: `INSERT INTO pengguna (username, password_hash, peran)
          VALUES ('admin_uji', 'hash', 'admin')`,
  },
  {
    ket: "jenis transaksi tidak dikenal",
    sql: `INSERT INTO transactions
            (waktu, jenis, nomor_tujuan, operator, harga_modal, harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'pulsa_biasa', '081234567890',
                  'Telkomsel', 1000, 2000, 'tunai')`,
  },
  {
    ket: "transaksi voucher tanpa voucher_id",
    sql: `INSERT INTO transactions
            (waktu, jenis, jumlah, harga_modal, harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'voucher', 1, 1000, 2000, 'tunai')`,
  },
  {
    ket: "transaksi pulsa memakai voucher_id",
    sql: `INSERT INTO transactions
            (waktu, jenis, nomor_tujuan, operator, voucher_id, harga_modal,
             harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'pulsa', '081234567890', 'Telkomsel',
                  1, 1000, 2000, 'tunai')`,
  },
  {
    ket: "nomor tujuan berisi huruf",
    sql: `INSERT INTO transactions
            (waktu, jenis, nomor_tujuan, operator, harga_modal, harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'pulsa', '0812ABC45678',
                  'Telkomsel', 1000, 2000, 'tunai')`,
  },
  {
    ket: "nomor tujuan terlalu pendek",
    sql: `INSERT INTO transactions
            (waktu, jenis, nomor_tujuan, operator, harga_modal, harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'pulsa', '0812',
                  'Telkomsel', 1000, 2000, 'tunai')`,
  },
  {
    ket: "harga jual transaksi di bawah modal",
    sql: `INSERT INTO transactions
            (waktu, jenis, nomor_tujuan, operator, harga_modal, harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'pulsa', '081234567890',
                  'Telkomsel', 10000, 9000, 'tunai')`,
  },
  {
    ket: "jumlah voucher nol",
    sql: `INSERT INTO transactions
            (waktu, jenis, voucher_id, jumlah, harga_modal, harga_jual, metode_bayar)
          VALUES ('2026-11-18 11:00:00', 'voucher', 1, 0, 10000, 12000, 'tunai')`,
  },
  {
    ket: "kasbon lunas tanpa tanggal_lunas",
    sql: `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo, status)
          VALUES (2, 1, '2026-11-25', 'lunas')`,
  },
  {
    ket: "kasbon belum_lunas tetapi sudah ada tanggal_lunas",
    sql: `INSERT INTO debts
            (transaction_id, pelanggan_id, tanggal_tempo, status, tanggal_lunas)
          VALUES (2, 1, '2026-11-25', 'belum_lunas', '2026-11-20')`,
  },
  {
    ket: "pelanggan yang dirujuk tidak ada (FK)",
    sql: `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo)
          VALUES (2, 999, '2026-11-25')`,
  },
  {
    ket: "tanggal tempo bukan format ISO",
    sql: `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo)
          VALUES (2, 1, '25-11-2026')`,
  },
  {
    ket: "voucher masuk dengan jumlah nol",
    sql: `INSERT INTO voucher_masuk (voucher_id, jumlah, tanggal)
          VALUES (1, 0, '2026-11-18')`,
  },
  {
    ket: "voucher masuk merujuk voucher yang tidak ada (FK)",
    sql: `INSERT INTO voucher_masuk (voucher_id, jumlah, tanggal)
          VALUES (999, 2, '2026-11-18')`,
  },
  {
    ket: "voucher masuk dengan tanggal bukan ISO",
    sql: `INSERT INTO voucher_masuk (voucher_id, jumlah, tanggal)
          VALUES (1, 2, '18-11-2026')`,
  },
];

for (const kasus of UJI) {
  try {
    db.prepare(kasus.sql).run(...(kasus.params ?? []));
    console.log("GAGAL (seharusnya ditolak):", kasus.ket);
    masalah++;
  } catch (galat) {
    console.log("OK ditolak:", kasus.ket, "->", (galat as Error).message);
  }
}

// Uji keunikan kasbon per transaksi (butuh satu baris valid lebih dulu).
try {
  db.prepare(
    `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo)
     VALUES (2, 1, '2026-11-25')`,
  ).run();
  db.prepare(
    `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo)
     VALUES (2, 1, '2026-11-26')`,
  ).run();
  console.log("GAGAL (seharusnya ditolak): dua kasbon untuk satu transaksi");
  masalah++;
} catch (galat) {
  console.log(
    "OK ditolak: dua kasbon untuk satu transaksi ->",
    (galat as Error).message,
  );
}

const jumlahTransaksi = db
  .query("SELECT COUNT(*) AS n FROM transactions")
  .get() as { n: number };
console.log(`\nTransaksi valid yang tersimpan: ${jumlahTransaksi.n} (harus 2)`);
if (jumlahTransaksi.n !== 2) masalah++;

db.close();

if (masalah > 0) {
  console.log(`\n${masalah} masalah ditemukan. Skema belum lengkap.`);
  process.exit(1);
}
console.log("\nSEMUA BATASAN SKEMA BEKERJA");
