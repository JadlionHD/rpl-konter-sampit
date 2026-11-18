import { Hono } from "hono";
import { bacaFormCsrf } from "../lib/csrf.ts";
import { tanggalLokalSekarang } from "../lib/waktu.ts";
import { wajibPeran } from "../middleware/autentikasi.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import { semuaVoucher } from "../models/voucher.ts";
import { semuaVoucherMasuk } from "../models/voucher-masuk.ts";
import { prosesVoucherMasuk } from "../services/voucher-masuk.ts";
import { renderVoucherMasuk } from "../views/voucher-masuk.tsx";
import type { PenggunaRingkas } from "../views/layout.tsx";

export const ruteVoucherMasuk = new Hono<Aplikasi>();

function halaman(
  hariIni: string,
  pengguna: PenggunaRingkas,
  csrf: string,
  isian: Record<string, string>,
  galat: string[],
  pesan?: string,
): string {
  return renderVoucherMasuk({
    hariIni,
    vouchers: semuaVoucher(),
    daftar: semuaVoucherMasuk(),
    isian,
    galat,
    pengguna,
    csrf,
    pesan,
  });
}

ruteVoucherMasuk.get("/voucher-masuk", wajibPeran("pemilik"), (c) => {
  const hariIni = tanggalLokalSekarang();
  return c.html(
    halaman(
      hariIni,
      c.get("pengguna")!,
      c.get("csrf"),
      { tanggal: hariIni },
      [],
      c.req.query("pesan"),
    ),
  );
});

ruteVoucherMasuk.post("/voucher-masuk", wajibPeran("pemilik"), async (c) => {
  const hariIni = tanggalLokalSekarang();
  const pengguna = c.get("pengguna")!;
  const { form, valid } = await bacaFormCsrf(c);

  if (!valid) {
    return c.html(
      halaman(hariIni, pengguna, c.get("csrf"), form, [
        "Sesi form kedaluwarsa. Muat ulang halaman lalu coba lagi.",
      ]),
      403,
    );
  }

  const hasil = prosesVoucherMasuk(form, pengguna.id, hariIni);

  if (!hasil.ok) {
    return c.html(
      halaman(hariIni, pengguna, c.get("csrf"), form, hasil.galat),
      422,
    );
  }

  return c.redirect(
    `/voucher-masuk?pesan=${encodeURIComponent(
      "Voucher masuk disimpan dan stok bertambah.",
    )}`,
    303,
  );
});
