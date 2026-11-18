import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/app.ts";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { jumlahTransaksi } from "../src/models/transaksi.ts";
import {
  catatGagalLogin,
  cekBatasLogin,
  kunciBatasLogin,
} from "../src/services/batas-login.ts";
import { siapkanDatabaseUji } from "./bantuan.ts";
import {
  buatPenggunaUji,
  CookieJar,
  loginUji,
  masukSebagai,
} from "./sesi-bantuan.ts";

beforeEach(async () => {
  siapkanDatabaseUji();
  await buatPenggunaUji("pemilik", "rahasia123", "pemilik");
});

afterEach(() => {
  tutupDatabase();
});

const transaksiValid = {
  jenis: "pulsa",
  nomor_tujuan: "081234567890",
  harga_modal: "10000",
  harga_jual: "12000",
  metode_bayar: "tunai",
  form_asal: "transaksi",
};

async function kirimTransaksi(
  jar: CookieJar,
  data: Record<string, string>,
): Promise<Response> {
  return jar.minta("/api/transaksi", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data).toString(),
    redirect: "manual",
  });
}

describe("CSRF (T-01)", () => {
  it("menolak POST tanpa token dan tidak menyimpan data", async () => {
    const jar = await masukSebagai("pemilik", "rahasia123");
    const response = await kirimTransaksi(jar, transaksiValid);

    expect(response.status).toBe(403);
    expect(await response.text()).toContain("kedaluwarsa");
    expect(jumlahTransaksi()).toBe(0);
  });

  it("menolak POST dengan token yang salah", async () => {
    const jar = await masukSebagai("pemilik", "rahasia123");
    const response = await kirimTransaksi(jar, {
      ...transaksiValid,
      csrf_token: "token-palsu",
    });

    expect(response.status).toBe(403);
    expect(jumlahTransaksi()).toBe(0);
  });

  it("menerima POST dengan token yang cocok", async () => {
    const jar = await masukSebagai("pemilik", "rahasia123");
    const response = await kirimTransaksi(jar, {
      ...transaksiValid,
      csrf_token: jar.csrf,
    });

    expect(response.status).toBe(303);
    expect(jumlahTransaksi()).toBe(1);
  });

  it("menolak logout tanpa token", async () => {
    const jar = await masukSebagai("pemilik", "rahasia123");
    const response = await jar.minta("/logout", {
      method: "POST",
      redirect: "manual",
    });
    expect(response.status).toBe(403);
  });
});

describe("rate limit login (T-02)", () => {
  it("memblokir setelah lima kegagalan dan memakai pesan generik", async () => {
    for (let i = 0; i < 5; i++) {
      const response = await loginUji(
        new CookieJar(),
        "pemilik",
        "kata-sandi-salah",
      );
      expect(response.status).toBe(401);
    }

    const diblokir = await loginUji(
      new CookieJar(),
      "pemilik",
      "rahasia123",
    );
    expect(diblokir.status).toBe(429);
    expect(await diblokir.text()).toContain("Terlalu banyak percobaan login");
  });

  it("membuka blokir setelah jendela waktu lewat", () => {
    const kunci = kunciBatasLogin("jendela-uji", "ip");
    const mulai = 1_000_000;

    for (let i = 0; i < 5; i++) catatGagalLogin(kunci, mulai);

    expect(cekBatasLogin(kunci, mulai).diblokir).toBe(true);
    expect(
      cekBatasLogin(kunci, mulai + 16 * 60 * 1000).diblokir,
    ).toBe(false);
  });
});

describe("header keamanan dan CSP (T-03)", () => {
  it("mengirim header keamanan dan CSP tanpa unsafe-inline", async () => {
    const response = await app.request("/login");
    expect(response.status).toBe(200);

    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");

    const csp = response.headers.get("content-security-policy") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain("unsafe-inline");
  });

  it("tidak memakai gaya atau penanganan peristiwa sebaris", async () => {
    const html = await (await app.request("/login")).text();
    expect(html).not.toContain("style=");
    expect(html).not.toContain("onclick=");
    expect(html).not.toContain("onsubmit=");
    expect(html).toContain('src="/app.js"');
  });
});
