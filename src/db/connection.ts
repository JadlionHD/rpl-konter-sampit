import { Database } from "bun:sqlite";
import { resolve } from "node:path";

let dbAktif: Database | null = null;

/**
 * Lokasi basis data dapat diatur lewat `KONTER_DB`.
 * Pengujian menggunakan `:memory:` agar `konter.sqlite` tidak tersentuh.
 */
export function lokasiDatabase(): string {
  return process.env.KONTER_DB ?? resolve(process.cwd(), "konter.sqlite");
}

export function bukaDatabase(lokasi: string = lokasiDatabase()): Database {
  const db = new Database(lokasi, { create: true });
  db.run("PRAGMA journal_mode = WAL;");
  db.run("PRAGMA foreign_keys = ON;");
  return db;
}

/** Ganti koneksi aktif. Koneksi lama ditutup lebih dulu. */
export function inisialisasiDatabase(lokasi?: string): Database {
  if (dbAktif) {
    dbAktif.close();
    dbAktif = null;
  }
  dbAktif = bukaDatabase(lokasi);
  return dbAktif;
}

export function getDb(): Database {
  if (!dbAktif) {
    throw new Error(
      "Database belum diinisialisasi. Panggil inisialisasiDatabase() lebih dulu.",
    );
  }
  return dbAktif;
}

export function tutupDatabase(): void {
  if (!dbAktif) return;
  dbAktif.close();
  dbAktif = null;
}
