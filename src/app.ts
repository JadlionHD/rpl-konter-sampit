import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { secureHeaders } from "hono/secure-headers";
import { getDb } from "./db/connection.ts";
import { pasangCsrf } from "./middleware/csrf.ts";
import {
  muatPengguna,
  wajibMasuk,
} from "./middleware/autentikasi.ts";
import type { Aplikasi } from "./middleware/autentikasi.ts";
import { VERSI } from "./versi.ts";
import { ruteAutentikasi } from "./routes/autentikasi.ts";
import { ruteBeranda } from "./routes/beranda.ts";
import { ruteKasbon } from "./routes/kasbon.ts";
import { ruteLaporan } from "./routes/laporan.ts";
import { ruteRiwayat } from "./routes/riwayat.ts";
import { ruteTransaksi } from "./routes/transaksi.ts";
import { ruteVoucher } from "./routes/voucher.ts";
import { ruteVoucherMasuk } from "./routes/voucher-masuk.ts";

export const app = new Hono<Aplikasi>();

app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      styleSrc: ["'self'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
    },
    xFrameOptions: "DENY",
    referrerPolicy: "no-referrer",
    crossOriginOpenerPolicy: "same-origin",
  }),
);
app.use("*", serveStatic({ root: "./public" }));
app.use("*", muatPengguna);
app.use("*", pasangCsrf);

app.get("/kesehatan", (c) => {
  try {
    getDb().query("SELECT 1 AS ok").get();
    return c.json({ status: "ok", versi: VERSI });
  } catch {
    return c.json({ status: "gagal", versi: VERSI }, 503);
  }
});

app.route("/", ruteAutentikasi);

const terlindungi = new Hono<Aplikasi>();
terlindungi.use("*", wajibMasuk);
terlindungi.route("/", ruteBeranda);
terlindungi.route("/", ruteTransaksi);
terlindungi.route("/", ruteVoucher);
terlindungi.route("/", ruteVoucherMasuk);
terlindungi.route("/", ruteRiwayat);
terlindungi.route("/", ruteLaporan);
terlindungi.route("/", ruteKasbon);

app.route("/", terlindungi);

app.notFound((c) => c.text("Halaman tidak ditemukan.", 404));

app.onError((kesalahan, c) => {
  console.error(kesalahan);
  return c.text("Terjadi kesalahan pada server.", 500);
});
