import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/app.ts";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { simpanTransaksi } from "../src/models/transaksi.ts";
import { siapkanDatabaseUji } from "./bantuan.ts";
import {
  buatPenggunaUji,
  masukSebagai,
} from "./sesi-bantuan.ts";

beforeEach(async () => {
  siapkanDatabaseUji();
  await buatPenggunaUji("pemilik", "rahasia123", "pemilik");
});

afterEach(() => {
  tutupDatabase();
});

function catat(waktu: string, modal: number, jual: number): void {
  simpanTransaksi(
    {
      waktu,
      jenis: "pulsa",
      nomorTujuan: "081234567890",
      operator: "Telkomsel",
      voucherId: null,
      jumlah: 1,
      hargaModal: modal,
      hargaJual: jual,
      metodeBayar: "tunai",
      penggunaId: 1,
    },
    null,
  );
}

describe("laporan pemilik (KF-05)", () => {
  it("menghitung omzet, modal, dan laba pada rentang tanggal", async () => {
    catat("2026-11-18 09:00:00", 10000, 12000);
    catat("2026-11-18 10:00:00", 20000, 25000);
    catat("2026-11-19 09:00:00", 4000, 5000);

    const pemilik = await masukSebagai("pemilik", "rahasia123");
    const html = await (
      await pemilik.minta("/laporan?dari=2026-11-18&sampai=2026-11-18")
    ).text();

    expect(html).toContain("Rp37.000");
    expect(html).toContain("Rp30.000");
    expect(html).toContain("Rp7.000");
    expect(html).toContain("2 trx");
    expect(html).toContain("2026-11-18");
    expect(html).not.toContain("2026-11-19");
  });

  it("menampilkan rekap per hari dan rentang lebih luas", async () => {
    catat("2026-11-18 09:00:00", 10000, 12000);
    catat("2026-11-19 09:00:00", 4000, 5000);

    const pemilik = await masukSebagai("pemilik", "rahasia123");
    const html = await (
      await pemilik.minta("/laporan?dari=2026-11-01&sampai=2026-11-30")
    ).text();

    expect(html).toContain("Rp17.000");
    expect(html).toContain("2026-11-18");
    expect(html).toContain("2026-11-19");
  });

  it("menampilkan peringatan bila tanggal akhir lebih awal", async () => {
    const pemilik = await masukSebagai("pemilik", "rahasia123");
    const html = await (
      await pemilik.minta("/laporan?dari=2026-11-19&sampai=2026-11-18")
    ).text();

    expect(html).toContain("tidak boleh sebelum");
  });

  it("menampilkan keadaan kosong pada periode tanpa transaksi", async () => {
    const pemilik = await masukSebagai("pemilik", "rahasia123");
    const html = await (
      await pemilik.minta("/laporan?dari=2025-01-01&sampai=2025-01-31")
    ).text();

    expect(html).toContain("Belum ada transaksi pada periode ini.");
  });
});

describe("aset statis", () => {
  it("menyajikan CSS dan JavaScript tanpa login", async () => {
    const responseCss = await app.request("/style.css");
    expect(responseCss.status).toBe(200);
    expect(await responseCss.text()).toContain("--primary");

    const responseJs = await app.request("/app.js");
    expect(responseJs.status).toBe(200);
    expect(await responseJs.text()).toContain("data-kasbon-pemicu");
  });
});

describe("pencatat transaksi", () => {
  it("mengisi pengguna_id dari sesi", async () => {
    const pemilik = await masukSebagai("pemilik", "rahasia123");
    await pemilik.minta("/api/transaksi", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        jenis: "pulsa",
        nomor_tujuan: "081234567890",
        harga_modal: "10000",
        harga_jual: "12000",
        metode_bayar: "tunai",
        form_asal: "transaksi",
        csrf_token: pemilik.csrf,
      }).toString(),
      redirect: "manual",
    });

    const baris = getDb()
      .query("SELECT pengguna_id FROM transactions ORDER BY id DESC LIMIT 1")
      .get() as { pengguna_id: number };
    expect(baris.pengguna_id).toBe(1);
  });
});
