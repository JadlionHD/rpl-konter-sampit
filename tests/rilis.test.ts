import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { app } from "../src/app.ts";
import { konfigurasi } from "../src/config.ts";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { cadangkanDatabase } from "../src/lib/backup.ts";
import { VERSI } from "../src/versi.ts";
import { siapkanDatabaseUji } from "./bantuan.ts";
import {
  buatPenggunaUji,
  masukSebagai,
} from "./sesi-bantuan.ts";

const envAsli = {
  APP_ENV: process.env.APP_ENV,
  SECRET_KEY: process.env.SECRET_KEY,
  COOKIE_SECURE: process.env.COOKIE_SECURE,
};

beforeEach(() => {
  siapkanDatabaseUji();
});

afterEach(() => {
  tutupDatabase();
  if (envAsli.APP_ENV === undefined) delete process.env.APP_ENV;
  else process.env.APP_ENV = envAsli.APP_ENV;
  if (envAsli.SECRET_KEY === undefined) delete process.env.SECRET_KEY;
  else process.env.SECRET_KEY = envAsli.SECRET_KEY;
  if (envAsli.COOKIE_SECURE === undefined) delete process.env.COOKIE_SECURE;
  else process.env.COOKIE_SECURE = envAsli.COOKIE_SECURE;
});

describe("versi rilis", () => {
  it("menyamakan package.json dan konstanta VERSI", () => {
    const paket = JSON.parse(
      readFileSync(new URL("../package.json", import.meta.url), "utf8"),
    ) as { version: string };
    expect(VERSI).toBe("1.0.0");
    expect(paket.version).toBe(VERSI);
  });

  it("menampilkan versi di footer halaman", async () => {
    await buatPenggunaUji("pemilik", "rahasia123", "pemilik");
    const jar = await masukSebagai("pemilik", "rahasia123");
    const html = await (await jar.minta("/")).text();
    expect(html).toContain("Versi 1.0.0");
  });
});

describe("health check", () => {
  it("melaporkan status dan versi", async () => {
    const response = await app.request("/kesehatan");
    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      status: string;
      versi: string;
    };
    expect(data.status).toBe("ok");
    expect(data.versi).toBe(VERSI);
  });
});

describe("cadangan", () => {
  it("membuat berkas cadangan yang dapat dibuka", () => {
    const db = getDb();
    db.query(
      `INSERT INTO vouchers
         (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
       VALUES ('Voucher Cadangan', 'Telkomsel', 5, 10000, 12000, '2027-12-31')`,
    ).run();

    const folder = mkdtempSync(join(tmpdir(), "konter-cadangan-"));
    const tujuan = join(folder, "cadangan.sqlite");

    try {
      cadangkanDatabase(db, tujuan);
      const cadangan = new Database(tujuan);
      const baris = cadangan
        .query("SELECT COUNT(*) AS n FROM vouchers")
        .get() as { n: number };
      expect(Number(baris.n)).toBe(1);
      cadangan.close();
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });

  it("menolak menimpa berkas cadangan yang sudah ada", () => {
    const folder = mkdtempSync(join(tmpdir(), "konter-cadangan-"));
    const tujuan = join(folder, "cadangan.sqlite");
    try {
      cadangkanDatabase(getDb(), tujuan);
      expect(() => cadangkanDatabase(getDb(), tujuan)).toThrow();
    } finally {
      rmSync(folder, { recursive: true, force: true });
    }
  });
});

describe("konfigurasi produksi", () => {
  it("menolak SECRET_KEY hilang atau terlalu pendek", () => {
    process.env.APP_ENV = "production";
    delete process.env.SECRET_KEY;

    expect(() => konfigurasi()).toThrow();

    process.env.SECRET_KEY = "pendek";
    expect(() => konfigurasi()).toThrow();

    process.env.SECRET_KEY = "k".repeat(64);
    process.env.COOKIE_SECURE = "1";
    const konf = konfigurasi();
    expect(konf.appEnv).toBe("production");
    expect(konf.cookieSecure).toBe(true);
  });
});
