import type { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Satu-satunya berkas DDL proyek (Jobsheet 6). */
const BERKAS_SKEMA = join(import.meta.dir, "..", "..", "docs", "desain", "schema.sql");

export function terapkanSkema(db: Database): void {
  db.exec(readFileSync(BERKAS_SKEMA, "utf8"));
}
