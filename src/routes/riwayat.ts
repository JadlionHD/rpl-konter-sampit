import { Hono } from "hono";
import { tanggalLokalSekarang } from "../lib/waktu.ts";
import { cariTransaksi } from "../models/transaksi.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import { parseFilterTransaksi } from "../services/pencarian.ts";
import { renderRiwayat } from "../views/riwayat.tsx";

export const ruteRiwayat = new Hono<Aplikasi>();

ruteRiwayat.get("/riwayat", (c) => {
  const pengguna = c.get("pengguna");
  if (!pengguna) return c.redirect("/login", 303);

  const hariIni = tanggalLokalSekarang();
  const query = { ...c.req.query() };
  const batasiHariIni = pengguna.peran === "kasir";
  if (batasiHariIni) {
    query.dari = hariIni;
    query.sampai = hariIni;
  }

  const hasil = parseFilterTransaksi(query, hariIni);

  return c.html(
    renderRiwayat({
      hariIni,
      transaksi: cariTransaksi(hasil.filter),
      filter: hasil.filter,
      galat: hasil.galat,
      adaFilter: hasil.adaFilter,
      pengguna,
      batasiHariIni,
      csrf: c.get("csrf"),
      pesan: c.req.query("pesan"),
    }),
  );
});
