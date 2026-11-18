import type { MiddlewareHandler } from "hono";
import { bacaSesi, hapusSesi } from "../lib/sesi.ts";
import { ambilPengguna } from "../models/pengguna.ts";
import type { Pengguna } from "../models/pengguna.ts";
import { render403 } from "../views/403.tsx";

export interface Variabel {
  pengguna: Pengguna | null;
  csrf: string;
}

export type Aplikasi = { Variables: Variabel };

function alamatLogin(c: Parameters<MiddlewareHandler<Aplikasi>>[0]): string {
  const url = new URL(c.req.url);
  const next = url.pathname + url.search;
  return `/login?next=${encodeURIComponent(next)}`;
}

/** Memuat pengguna dari cookie sesi dan memeriksa status aktif. */
export const muatPengguna: MiddlewareHandler<Aplikasi> = async (c, next) => {
  const id = await bacaSesi(c);
  if (!id) {
    c.set("pengguna", null);
    return next();
  }

  const pengguna = ambilPengguna(id);
  if (!pengguna || pengguna.aktif !== 1) {
    hapusSesi(c);
    c.set("pengguna", null);
  } else {
    c.set("pengguna", pengguna);
  }
  await next();
};

export const wajibMasuk: MiddlewareHandler<Aplikasi> = async (c, next) => {
  if (!c.get("pengguna")) {
    return c.redirect(alamatLogin(c), 303);
  }
  await next();
};

export const wajibPeran = (
  ...peran: Pengguna["peran"][]
): MiddlewareHandler<Aplikasi> => {
  return async (c, next) => {
    const pengguna = c.get("pengguna");
    if (!pengguna) {
      return c.redirect(alamatLogin(c), 303);
    }
    if (!peran.includes(pengguna.peran)) {
      return c.html(
        render403({ pengguna, csrf: c.get("csrf") }),
        403,
      );
    }
    await next();
  };
};
