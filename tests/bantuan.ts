import type { Database } from "bun:sqlite";
import { inisialisasiDatabase } from "../src/db/connection.ts";
import { terapkanSkema } from "../src/db/schema.ts";
import { kosongkanBatasLogin } from "../src/services/batas-login.ts";

process.env.SECRET_KEY ??=
  "kunci-uji-32-karakter-lebih-aman-untuk-cookie-sesi";

/** Basis data in-memory baru + skema. Tidak menyentuh konter.sqlite. */
export function siapkanDatabaseUji(): Database {
  kosongkanBatasLogin();
  const db = inisialisasiDatabase(":memory:");
  terapkanSkema(db);
  return db;
}

export interface DataVoucherUji {
  namaPaket?: string;
  operator?: string;
  stok?: number;
  hargaModal?: number;
  hargaJual?: number;
  tanggalExpired?: string;
}

export function tambahVoucherUji(
  db: Database,
  data: DataVoucherUji = {},
): number {
  const hasil = db
    .query(
      `INSERT INTO vouchers
         (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      data.namaPaket ?? "Voucher Uji",
      data.operator ?? "Telkomsel",
      data.stok ?? 5,
      data.hargaModal ?? 10000,
      data.hargaJual ?? 12000,
      data.tanggalExpired ?? "2027-12-31",
    );
  return Number(hasil.lastInsertRowid);
}
