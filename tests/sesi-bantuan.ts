import { app } from "../src/app.ts";
import { buatPengguna } from "../src/services/autentikasi.ts";
import type { Peran } from "../src/models/pengguna.ts";

/** Penyimpan cookie sederhana untuk uji alur HTTP. */
export class CookieJar {
  private cookies = new Map<string, string>();
  csrf = "";

  simpan(response: Response): void {
    const headers = response.headers as Headers & {
      getSetCookie?: () => string[];
    };
    const daftar = headers.getSetCookie?.() ?? [];
    const tunggal = response.headers.get("set-cookie");
    if (daftar.length === 0 && tunggal) daftar.push(tunggal);

    for (const header of daftar) {
      const pasangan = header.split(";")[0] ?? "";
      const pemisah = pasangan.indexOf("=");
      if (pemisah <= 0) continue;
      const nama = pasangan.slice(0, pemisah);
      const nilai = pasangan.slice(pemisah + 1);
      if (nilai === "") this.cookies.delete(nama);
      else this.cookies.set(nama, nilai);
    }
  }

  simpanTokenDariHtml(html: string): void {
    const cocok = html.match(/name="csrf_token" value="([^"]+)"/);
    if (cocok) this.csrf = cocok[1];
  }

  header(): string {
    return [...this.cookies.entries()]
      .map(([nama, nilai]) => `${nama}=${nilai}`)
      .join("; ");
  }

  async minta(alamat: string, init: RequestInit = {}): Promise<Response> {
    const headers = new Headers(init.headers);
    const cookie = this.header();
    if (cookie) headers.set("cookie", cookie);

    const response = await app.request(alamat, { ...init, headers });
    this.simpan(response);

    if ((response.headers.get("content-type") ?? "").includes("text/html")) {
      this.simpanTokenDariHtml(await response.clone().text());
    }

    return response;
  }
}

export async function buatPenggunaUji(
  username = "pemilik",
  password = "rahasia123",
  peran: Peran = "pemilik",
): Promise<void> {
  const hasil = await buatPengguna(username, password, peran);
  if (!hasil.ok) throw new Error(hasil.galat.join(" "));
}

export async function loginUji(
  jar: CookieJar,
  username: string,
  password: string,
  next = "",
): Promise<Response> {
  if (!jar.csrf) {
    await jar.minta("/login");
  }

  return jar.minta("/login", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username,
      password,
      next,
      csrf_token: jar.csrf,
    }).toString(),
    redirect: "manual",
  });
}

export async function masukSebagai(
  username: string,
  password: string,
  next = "",
): Promise<CookieJar> {
  const jar = new CookieJar();
  const response = await loginUji(jar, username, password, next);
  if (response.status !== 303) {
    throw new Error(`Login uji gagal: status ${response.status}`);
  }
  return jar;
}
