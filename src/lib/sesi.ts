import type { Context } from "hono";
import {
  deleteCookie,
  getSignedCookie,
  setSignedCookie,
} from "hono/cookie";
import { konfigurasi } from "../config.ts";

const NAMA_SESI = "konter_sesi";

export async function simpanSesi(
  c: Context,
  penggunaId: number,
): Promise<void> {
  const konf = konfigurasi();
  await setSignedCookie(c, NAMA_SESI, String(penggunaId), konf.secretKey, {
    httpOnly: true,
    sameSite: "Lax",
    secure: konf.cookieSecure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function bacaSesi(c: Context): Promise<number | null> {
  const nilai = await getSignedCookie(c, konfigurasi().secretKey, NAMA_SESI);
  if (!nilai) return null;
  const id = Number(nilai);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function hapusSesi(c: Context): void {
  deleteCookie(c, NAMA_SESI, { path: "/" });
}
