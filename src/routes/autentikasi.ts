import { Hono } from "hono";
import type { Context } from "hono";
import { bacaFormCsrf } from "../lib/csrf.ts";
import { bacaSesi, hapusSesi, simpanSesi } from "../lib/sesi.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import {
  catatGagalLogin,
  cekBatasLogin,
  kunciBatasLogin,
  resetBatasLogin,
} from "../services/batas-login.ts";
import { autentikasi } from "../services/autentikasi.ts";
import { renderLogin } from "../views/login.tsx";

export const ruteAutentikasi = new Hono<Aplikasi>();

/** Menerima hanya alamat internal; menolak open redirect. */
export function tujuanAman(nilai: string | undefined): string {
  const next = (nilai ?? "").trim();
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  if (next.includes("\\")) return "/";
  return next;
}

function alamatIp(c: Context): string {
  // Header klien tidak dipercaya kecuali server berada di belakang proxy tepercaya.
  if (process.env.TRUST_PROXY === "1") {
    return (
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || "lokal"
    );
  }
  return "lokal";
}

ruteAutentikasi.get("/login", async (c) => {
  if (c.get("pengguna")) return c.redirect("/", 303);
  const id = await bacaSesi(c);
  if (id) return c.redirect("/", 303);

  return c.html(
    renderLogin({
      galat: [],
      username: "",
      next: tujuanAman(c.req.query("next")),
      csrf: c.get("csrf"),
    }),
  );
});

ruteAutentikasi.post("/login", async (c) => {
  const { form, valid } = await bacaFormCsrf(c);
  const username = String(form.username ?? "");
  const password = String(form.password ?? "");
  const next = tujuanAman(
    String(form.next ?? "") || c.req.query("next") || "",
  );
  const csrf = c.get("csrf");

  if (!valid) {
    return c.html(
      renderLogin({
        galat: ["Sesi form kedaluwarsa. Muat ulang halaman lalu coba lagi."],
        username,
        next,
        csrf,
      }),
      403,
    );
  }

  const kunci = kunciBatasLogin(username, alamatIp(c));
  const batas = cekBatasLogin(kunci);
  if (batas.diblokir) {
    const menit = Math.max(1, Math.ceil(batas.sisaDetik / 60));
    return c.html(
      renderLogin({
        galat: [
          `Terlalu banyak percobaan login. Coba lagi dalam ${menit} menit.`,
        ],
        username,
        next,
        csrf,
      }),
      429,
    );
  }

  const hasil = await autentikasi(username, password);
  if (!hasil.ok || !hasil.pengguna) {
    catatGagalLogin(kunci);
    return c.html(
      renderLogin({ galat: hasil.galat, username, next, csrf }),
      401,
    );
  }

  resetBatasLogin(kunci);
  await simpanSesi(c, hasil.pengguna.id);
  return c.redirect(next, 303);
});

ruteAutentikasi.post("/logout", async (c) => {
  const { valid } = await bacaFormCsrf(c);
  if (!valid) {
    return c.text(
      "Sesi form kedaluwarsa. Muat ulang halaman lalu coba lagi.",
      403,
    );
  }

  hapusSesi(c);
  return c.redirect("/login", 303);
});
