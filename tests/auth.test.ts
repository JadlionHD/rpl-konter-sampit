import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { semuaVoucher } from "../src/models/voucher.ts";
import { siapkanDatabaseUji, tambahVoucherUji } from "./bantuan.ts";
import {
  buatPenggunaUji,
  CookieJar,
  loginUji,
  masukSebagai,
} from "./sesi-bantuan.ts";

beforeEach(async () => {
  siapkanDatabaseUji();
  await buatPenggunaUji("pemilik", "rahasia123", "pemilik");
  await buatPenggunaUji("kasir", "rahasia123", "kasir");
});

afterEach(() => {
  tutupDatabase();
});

describe("login dan sesi (KF-08)", () => {
  it("mengalihkan tamu ke login dengan next internal", async () => {
    const jar = new CookieJar();
    const response = await jar.minta("/voucher");

    expect(response.status).toBe(303);
    const lokasi = decodeURIComponent(response.headers.get("location") ?? "");
    expect(lokasi).toContain("/login?next=");
    expect(lokasi).toContain("/voucher");
  });

  it("memberi pesan yang sama untuk kata sandi salah dan username tidak ada", async () => {
    const salah = await loginUji(
      new CookieJar(),
      "pemilik",
      "kata-sandi-salah",
    );
    const tidakAda = await loginUji(
      new CookieJar(),
      "tidak_ada",
      "kata-sandi-salah",
    );

    expect(salah.status).toBe(401);
    expect(tidakAda.status).toBe(401);
    const htmlSalah = await salah.text();
    const htmlTidakAda = await tidakAda.text();
    expect(htmlSalah).toContain("Nama pengguna atau kata sandi salah.");
    expect(htmlTidakAda).toContain("Nama pengguna atau kata sandi salah.");
    expect(htmlSalah).toContain('value="pemilik"');
  });

  it("membuat sesi saat kredensial benar", async () => {
    const jar = new CookieJar();
    const response = await loginUji(jar, "pemilik", "rahasia123");

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
    expect(jar.header()).toContain("konter_sesi");

    const html = await (await jar.minta("/")).text();
    expect(html).toContain("pemilik (pemilik)");
  });

  it("menolak akun yang dinonaktifkan setelah kredensial benar", async () => {
    await buatPenggunaUji("nonaktif", "rahasia123", "kasir");
    getDb()
      .query("UPDATE pengguna SET aktif = 0 WHERE username = ?")
      .run("nonaktif");

    const response = await loginUji(
      new CookieJar(),
      "nonaktif",
      "rahasia123",
    );

    expect(response.status).toBe(401);
    expect(await response.text()).toContain("dinonaktifkan");
  });

  it("menyimpan kata sandi sebagai hash Argon2, bukan teks asli", async () => {
    const baris = getDb()
      .query("SELECT password_hash FROM pengguna WHERE username = ?")
      .get("pemilik") as { password_hash: string };

    expect(baris.password_hash).not.toBe("rahasia123");
    expect(baris.password_hash.startsWith("$argon2")).toBe(true);
  });

  it("mengabaikan next ke situs luar dan menerima path internal", async () => {
    const luar = new CookieJar();
    const responseLuar = await loginUji(
      luar,
      "pemilik",
      "rahasia123",
      "https://jahat.example",
    );
    expect(responseLuar.headers.get("location")).toBe("/");

    const dalam = new CookieJar();
    const responseDalam = await loginUji(
      dalam,
      "pemilik",
      "rahasia123",
      "/voucher",
    );
    expect(responseDalam.headers.get("location")).toBe("/voucher");
  });

  it("menolak next dengan // atau backslash", async () => {
    for (const next of ["//jahat.example", "/\\jahat.example"]) {
      const response = await loginUji(
        new CookieJar(),
        "pemilik",
        "rahasia123",
        next,
      );
      expect(response.headers.get("location")).toBe("/");
    }
  });

  it("logout hanya lewat POST dan menghapus sesi", async () => {
    const jar = await masukSebagai("pemilik", "rahasia123");
    expect((await jar.minta("/")).status).toBe(200);

    const keluar = await jar.minta("/logout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrf_token: jar.csrf }).toString(),
      redirect: "manual",
    });
    expect(keluar.status).toBe(303);
    expect(keluar.headers.get("location")).toBe("/login");

    const setelah = await jar.minta("/");
    expect(setelah.status).toBe(303);
  });

  it("halaman login dialihkan bila sudah masuk", async () => {
    const jar = await masukSebagai("pemilik", "rahasia123");
    const response = await jar.minta("/login");
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/");
  });
});

describe("otorisasi peran (KF-08)", () => {
  it("kasir mendapat 403 pada halaman Pemilik", async () => {
    const kasir = await masukSebagai("kasir", "rahasia123");

    for (const alamat of ["/voucher/tambah", "/voucher-masuk", "/laporan"]) {
      const response = await kasir.minta(alamat);
      expect(response.status).toBe(403);
      expect(await response.text()).toContain("Akses ditolak");
    }
  });

  it("kasir tidak dapat menghapus voucher lewat POST", async () => {
    const id = tambahVoucherUji(getDb());
    const kasir = await masukSebagai("kasir", "rahasia123");

    const response = await kasir.minta(`/voucher/${id}/hapus`, {
      method: "POST",
      redirect: "manual",
    });

    expect(response.status).toBe(403);
    expect(semuaVoucher()).toHaveLength(1);
  });

  it("kasir melihat daftar voucher tanpa aksi ubah/hapus", async () => {
    tambahVoucherUji(getDb(), { namaPaket: "Voucher Kasir" });
    const kasir = await masukSebagai("kasir", "rahasia123");
    const html = await (await kasir.minta("/voucher")).text();

    expect(html).toContain("Voucher Kasir");
    expect(html).toContain("Hanya lihat");
    expect(html).not.toContain("+ Tambah Voucher");
    expect(html).not.toContain(">Ubah<");
    expect(html).not.toContain(">Hapus<");
  });

  it("dashboard kasir menyembunyikan modal dan laba", async () => {
    const kasir = await masukSebagai("kasir", "rahasia123");
    const html = await (await kasir.minta("/")).text();

    expect(html).not.toContain("Laba Kotor");
    expect(html).toContain("Modal dan laba hanya tampil");
  });

  it("pemilik dapat membuka halaman pengelolaan", async () => {
    const pemilik = await masukSebagai("pemilik", "rahasia123");

    for (const alamat of ["/voucher/tambah", "/voucher-masuk", "/laporan"]) {
      const response = await pemilik.minta(alamat);
      expect(response.status).toBe(200);
    }
  });

  it("kasir hanya melihat riwayat hari ini", async () => {
    const kasir = await masukSebagai("kasir", "rahasia123");
    const html = await (
      await kasir.minta("/riwayat?dari=2026-01-01&sampai=2026-12-31")
    ).text();

    expect(html).toContain("hanya dapat melihat transaksi hari ini");
    expect(html).not.toContain("2026-01-01");
  });
});
