import type { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { konfigurasi } from "../config.ts";

const NAMA_CSRF = "konter_csrf";

/** Ambil token CSRF dari cookie bertanda tangan, atau buat baru. */
export async function tokenCsrf(c: Context): Promise<string> {
  const konf = konfigurasi();
  const ada = await getSignedCookie(c, konf.secretKey, NAMA_CSRF);
  if (ada) return ada;

  const token = crypto.randomUUID();
  await setSignedCookie(c, NAMA_CSRF, token, konf.secretKey, {
    httpOnly: true,
    sameSite: "Lax",
    secure: konf.cookieSecure,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  return token;
}

/** Bandingkan token yang dikirim form dengan cookie. */
export async function periksaCsrf(
  c: Context,
  form: Record<string, unknown>,
): Promise<boolean> {
  const cookie = await getSignedCookie(
    c,
    konfigurasi().secretKey,
    NAMA_CSRF,
  );
  const dikirim = String(form.csrf_token ?? "");
  return Boolean(cookie) && cookie === dikirim;
}

/** Baca form dan verifikasi CSRF dalam satu langkah. */
export async function bacaFormCsrf(
  c: Context,
): Promise<{ form: Record<string, string>; valid: boolean }> {
  const form = (await c.req.parseBody()) as Record<string, string>;
  return { form, valid: await periksaCsrf(c, form) };
}
