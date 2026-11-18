import { Hono } from "hono";
import {
  awalBulan,
  selisihHari,
  tanggalLokalSekarang,
} from "../lib/waktu.ts";
import { wajibPeran } from "../middleware/autentikasi.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import {
  rekapHarianPeriode,
  rekapPeriode,
} from "../models/transaksi.ts";
import { tanggalIso } from "../services/validasi.ts";
import { renderLaporan } from "../views/laporan.tsx";

export const ruteLaporan = new Hono<Aplikasi>();

ruteLaporan.get("/laporan", wajibPeran("pemilik"), (c) => {
  const hariIni = tanggalLokalSekarang();
  const galat: string[] = [];

  const mentahDari = c.req.query("dari") ?? "";
  const mentahSampai = c.req.query("sampai") ?? "";
  let dari = tanggalIso(mentahDari) ?? awalBulan(hariIni);
  let sampai = tanggalIso(mentahSampai) ?? hariIni;

  if (mentahDari && !tanggalIso(mentahDari)) {
    galat.push("Tanggal awal tidak valid; memakai awal bulan.");
  }
  if (mentahSampai && !tanggalIso(mentahSampai)) {
    galat.push("Tanggal akhir tidak valid; memakai hari ini.");
  }
  if (selisihHari(dari, sampai) < 0) {
    galat.push("Tanggal akhir tidak boleh sebelum tanggal awal.");
    sampai = dari;
  }

  const pengguna = c.get("pengguna");
  if (!pengguna) return c.redirect("/login", 303);

  return c.html(
    renderLaporan({
      hariIni,
      dari,
      sampai,
      rekap: rekapPeriode(dari, sampai),
      harian: rekapHarianPeriode(dari, sampai),
      galat,
      pengguna,
      csrf: c.get("csrf"),
    }),
  );
});
