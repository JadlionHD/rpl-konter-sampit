/**
 * Membuat cadangan basis data ke folder `backup/`.
 * Jalankan: bun run cadangkan
 */
import { join } from "node:path";
import { konfigurasi } from "../src/config.ts";
import { bukaDatabase, tutupDatabase } from "../src/db/connection.ts";
import { cadangkanDatabase } from "../src/lib/backup.ts";
import { tanggalLokal, waktuLokal } from "../src/lib/waktu.ts";

const konf = konfigurasi();
const db = bukaDatabase(konf.konterDb);

try {
  const stempel = `${tanggalLokal()}-${waktuLokal().slice(11, 19)}`
    .replaceAll(":", "-");
  const tujuan = join("backup", `konter-${stempel}.sqlite`);
  cadangkanDatabase(db, tujuan);
  console.log(`Cadangan dibuat: ${tujuan}`);
} finally {
  tutupDatabase();
}
