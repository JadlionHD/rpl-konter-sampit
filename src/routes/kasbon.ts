import { Hono } from "hono";
import { bacaFormCsrf } from "../lib/csrf.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import { prosesPelunasan } from "../services/kasbon.ts";
import { render403 } from "../views/403.tsx";

export const ruteKasbon = new Hono<Aplikasi>();

ruteKasbon.post("/api/kasbon/:id/lunas", async (c) => {
  const pengguna = c.get("pengguna");
  if (!pengguna) return c.redirect("/login", 303);

  const { valid } = await bacaFormCsrf(c);
  if (!valid) {
    return c.html(
      render403({
        pengguna,
        csrf: c.get("csrf"),
        pesan: "Sesi form kedaluwarsa. Muat ulang halaman lalu coba lagi.",
      }),
      403,
    );
  }

  const hasil = prosesPelunasan(c.req.param("id"));

  if (!hasil.ok) {
    return c.redirect(
      `/?galat=${encodeURIComponent(hasil.galat.join(" "))}`,
      303,
    );
  }

  return c.redirect(
    `/?pesan=${encodeURIComponent("Kasbon ditandai lunas.")}`,
    303,
  );
});
