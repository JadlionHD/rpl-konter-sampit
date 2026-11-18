import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { tambahHari, tanggalLokalSekarang } from "../src/lib/waktu.ts";
import { ambilVoucher } from "../src/models/voucher.ts";
import { semuaVoucherMasuk, simpanVoucherMasuk } from "../src/models/voucher-masuk.ts";
import { siapkanDatabaseUji, tambahVoucherUji } from "./bantuan.ts";
import {
  buatPenggunaUji,
  CookieJar,
  loginUji,
} from "./sesi-bantuan.ts";

let jar: CookieJar;

beforeEach(async () => {
  siapkanDatabaseUji();
  await buatPenggunaUji("pemilik", "rahasia123", "pemilik");
  jar = new CookieJar();
  await loginUji(jar, "pemilik", "rahasia123");
});

afterEach(() => {
  tutupDatabase();
});

async function kirim(data: Record<string, string>): Promise<Response> {
  return jar.minta("/voucher-masuk", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...data,
      csrf_token: jar.csrf,
    }).toString(),
    redirect: "manual",
  });
}

function lokasi(response: Response): string {
  return decodeURIComponent(response.headers.get("location") ?? "");
}

describe("halaman voucher masuk", () => {
  it("menampilkan keadaan kosong dan pilihan induk", async () => {
    tambahVoucherUji(getDb(), { namaPaket: "Voucher Induk" });
    const html = await (await jar.minta("/voucher-masuk")).text();
    expect(html).toContain("Belum ada voucher masuk.");
    expect(html).toContain("Voucher Induk");
  });
});

describe("simpan voucher masuk (KF-10)", () => {
  it("menambah stok tepat sebesar jumlah dan menulis ledger", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });
    const response = await kirim({
      voucher_id: String(id),
      jumlah: "20",
      tanggal: tanggalLokalSekarang(),
    });

    expect(response.status).toBe(303);
    expect(lokasi(response)).toContain("stok bertambah");
    expect(ambilVoucher(id)!.stok).toBe(25);

    const daftar = semuaVoucherMasuk();
    expect(daftar).toHaveLength(1);
    expect(daftar[0].namaPaket).toBe("Voucher Uji");
    expect(daftar[0].jumlah).toBe(20);
  });

  it("menolak induk yang tidak ada tanpa meninggalkan baris", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });
    const response = await kirim({
      voucher_id: "999",
      jumlah: "2",
      tanggal: tanggalLokalSekarang(),
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("Voucher tidak ditemukan");
    expect(ambilVoucher(id)!.stok).toBe(5);
    expect(semuaVoucherMasuk()).toHaveLength(0);
  });

  it("menolak jumlah nol, negatif, dan bukan angka", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });
    for (const jumlah of ["0", "-3", "abc"]) {
      const response = await kirim({
        voucher_id: String(id),
        jumlah,
        tanggal: tanggalLokalSekarang(),
      });
      expect(response.status).toBe(422);
    }
    expect(ambilVoucher(id)!.stok).toBe(5);
    expect(semuaVoucherMasuk()).toHaveLength(0);
  });

  it("menolak tanggal yang bukan format ISO", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });
    const response = await kirim({
      voucher_id: String(id),
      jumlah: "2",
      tanggal: "18-11-2026",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("TTTT-BB-HH");
    expect(ambilVoucher(id)!.stok).toBe(5);
    expect(semuaVoucherMasuk()).toHaveLength(0);
  });

  it("memakai hari ini bila tanggal dikosongkan", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 1 });
    const response = await kirim({
      voucher_id: String(id),
      jumlah: "1",
      tanggal: "",
    });

    expect(response.status).toBe(303);
    expect(semuaVoucherMasuk()[0].tanggal).toBe(tanggalLokalSekarang());
  });

  it("rollback total saat model dipanggil dengan induk tidak ada", () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });
    expect(() =>
      simpanVoucherMasuk({
        voucherId: 999,
        jumlah: 2,
        tanggal: tambahHari(tanggalLokalSekarang(), 0),
        penggunaId: null,
      }),
    ).toThrow();
    expect(ambilVoucher(id)!.stok).toBe(5);
    expect(semuaVoucherMasuk()).toHaveLength(0);
  });
});
