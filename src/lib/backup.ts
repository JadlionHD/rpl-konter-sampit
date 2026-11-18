import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Membuat cadangan konsisten dengan `VACUUM INTO`. Tujuan tidak boleh ada
 * agar tidak menimpa cadangan lain tanpa sengaja.
 */
export function cadangkanDatabase(db: Database, tujuan: string): string {
  if (existsSync(tujuan)) {
    throw new Error(`Berkas cadangan sudah ada: ${tujuan}`);
  }
  mkdirSync(dirname(tujuan), { recursive: true });
  const aman = tujuan.replaceAll("'", "''");
  db.run(`VACUUM INTO '${aman}'`);
  return tujuan;
}
