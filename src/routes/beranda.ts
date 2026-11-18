import { Hono } from "hono";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import { dataBeranda } from "../services/beranda.ts";
import { renderBeranda } from "../views/beranda.tsx";

export const ruteBeranda = new Hono<Aplikasi>();

ruteBeranda.get("/", (c) => {
  const pengguna = c.get("pengguna");
  if (!pengguna) return c.redirect("/login", 303);

  return c.html(
    renderBeranda({
      ...dataBeranda(),
      pengguna,
      csrf: c.get("csrf"),
      pesan: c.req.query("pesan"),
    }),
  );
});
