import { Hono } from "hono";
import { bacaFormCsrf } from "../lib/csrf.ts";
import { waktuLokal } from "../lib/waktu.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import { dataBeranda } from "../services/beranda.ts";
import { prosesTransaksi } from "../services/transaksi.ts";
import { renderBeranda } from "../views/beranda.tsx";

export const ruteTransaksi = new Hono<Aplikasi>();

ruteTransaksi.post("/api/transaksi", async (c) => {
  const pengguna = c.get("pengguna");
  if (!pengguna) return c.redirect("/login", 303);

  const { form, valid } = await bacaFormCsrf(c);
  const formAktif = form.form_asal === "voucher" ? "voucher" : "transaksi";
  const csrf = c.get("csrf");

  if (!valid) {
    return c.html(
      renderBeranda({
        ...dataBeranda(),
        pengguna,
        csrf,
        isian: form,
        galat: "Sesi form kedaluwarsa. Muat ulang halaman lalu coba lagi.",
        formAktif,
      }),
      403,
    );
  }

  const hasil = prosesTransaksi(form, waktuLokal(), pengguna.id);

  if (!hasil.ok) {
    return c.html(
      renderBeranda({
        ...dataBeranda(),
        pengguna,
        csrf,
        isian: form,
        galat: hasil.galat.join(" "),
        formAktif,
      }),
      422,
    );
  }

  return c.redirect(
    `/?pesan=${encodeURIComponent("Transaksi berhasil disimpan.")}`,
    303,
  );
});
