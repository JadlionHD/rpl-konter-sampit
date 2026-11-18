import { app } from "./app.ts";
import { konfigurasi } from "./config.ts";
import { inisialisasiDatabase } from "./db/connection.ts";
import { terapkanSkema } from "./db/schema.ts";
import { isiDataContoh } from "./db/seed.ts";

const konf = konfigurasi();
const db = inisialisasiDatabase(konf.konterDb);
terapkanSkema(db);

// Data contoh hanya untuk pengembangan/demo, bukan instalasi produksi.
if (konf.appEnv !== "production") {
  isiDataContoh(db);
}

export default {
  port: konf.port,
  hostname: konf.host,
  fetch: app.fetch,
};
