import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { waktuLokal } from "../src/lib/waktu.ts";
import { ambilVoucher, semuaVoucher } from "../src/models/voucher.ts";
import { simpanTransaksi } from "../src/models/transaksi.ts";
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

async function kirim(
  alamat: string,
  data: Record<string, string>,
): Promise<Response> {
  return jar.minta(alamat, {
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

const voucherValid = {
  nama_paket: "XL Uji 12GB",
  operator: "XL Axiata",
  stok: "5",
  harga_modal: "36000",
  harga_jual: "40000",
  tanggal_expired: "2027-12-31",
};

describe("daftar voucher", () => {
  it("menampilkan keadaan kosong", async () => {
    const html = await (await jar.minta("/voucher")).text();
    expect(html).toContain("Belum ada voucher terdaftar.");
    expect(html).toContain("+ Tambah Voucher");
  });

  it("tetap menyajikan API JSON voucher", async () => {
    tambahVoucherUji(getDb(), { namaPaket: "Voucher JSON" });
    const response = await jar.minta("/api/vouchers");
    const data = (await response.json()) as { namaPaket: string }[];
    expect(data[0].namaPaket).toBe("Voucher JSON");
  });
});

describe("tambah voucher (KF-10)", () => {
  it("menyimpan voucher valid dan mengalihkan ke daftar", async () => {
    const response = await kirim("/voucher/tambah", voucherValid);

    expect(response.status).toBe(303);
    expect(lokasi(response)).toContain("/voucher?pesan=");
    expect(semuaVoucher()).toHaveLength(1);
    expect(semuaVoucher()[0].namaPaket).toBe("XL Uji 12GB");
  });

  it("menolak nama kosong dan mempertahankan isian", async () => {
    const response = await kirim("/voucher/tambah", {
      ...voucherValid,
      nama_paket: "",
    });
    const html = await response.text();

    expect(response.status).toBe(422);
    expect(html).toContain("Nama paket wajib diisi");
    expect(html).toContain("XL Axiata");
    expect(semuaVoucher()).toHaveLength(0);
  });

  it("menolak harga jual di bawah modal", async () => {
    const response = await kirim("/voucher/tambah", {
      ...voucherValid,
      harga_modal: "40000",
      harga_jual: "36000",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain(
      "Harga jual minimal sama dengan harga modal",
    );
    expect(semuaVoucher()).toHaveLength(0);
  });

  it("menolak operator di luar allowlist", async () => {
    const response = await kirim("/voucher/tambah", {
      ...voucherValid,
      operator: "Operator Palsu",
    });

    expect(response.status).toBe(422);
    expect(semuaVoucher()).toHaveLength(0);
  });

  it("menolak tanggal kedaluwarsa yang tidak valid", async () => {
    const response = await kirim("/voucher/tambah", {
      ...voucherValid,
      tanggal_expired: "2026-02-30",
    });

    expect(response.status).toBe(422);
    expect(semuaVoucher()).toHaveLength(0);
  });

  it("menolak voucher ganda dan tidak membuat duplikat", async () => {
    await kirim("/voucher/tambah", voucherValid);
    const response = await kirim("/voucher/tambah", {
      ...voucherValid,
      stok: "9",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("sudah ada");
    expect(semuaVoucher()).toHaveLength(1);
  });
});

describe("ubah voucher", () => {
  it("mengubah data tanpa mengubah stok", async () => {
    const id = tambahVoucherUji(getDb(), {
      namaPaket: "Lama",
      operator: "Telkomsel",
      stok: 5,
      hargaModal: 10000,
      hargaJual: 12000,
      tanggalExpired: "2027-01-01",
    });

    const response = await kirim(`/voucher/${id}/ubah`, {
      nama_paket: "Baru",
      operator: "Indosat",
      stok: "999",
      harga_modal: "11000",
      harga_jual: "13000",
      tanggal_expired: "2027-02-28",
    });

    expect(response.status).toBe(303);
    const voucher = ambilVoucher(id)!;
    expect(voucher.namaPaket).toBe("Baru");
    expect(voucher.operator).toBe("Indosat");
    expect(voucher.hargaJual).toBe(13000);
    expect(voucher.stok).toBe(5);
  });

  it("menampilkan 404 untuk id yang tidak ada", async () => {
    expect((await jar.minta("/voucher/999/ubah")).status).toBe(404);
    expect((await jar.minta("/voucher/abc/ubah")).status).toBe(404);
  });
});

describe("hapus voucher", () => {
  it("menghapus voucher yang belum dipakai", async () => {
    const id = tambahVoucherUji(getDb());
    const response = await kirim(`/voucher/${id}/hapus`, {});

    expect(response.status).toBe(303);
    expect(semuaVoucher()).toHaveLength(0);
  });

  it("menolak hapus voucher yang sudah dipakai transaksi", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });
    simpanTransaksi(
      {
        waktu: waktuLokal(),
        jenis: "voucher",
        nomorTujuan: null,
        operator: null,
        voucherId: id,
        jumlah: 1,
        hargaModal: 10000,
        hargaJual: 12000,
        metodeBayar: "tunai",
        penggunaId: null,
      },
      null,
    );

    const response = await kirim(`/voucher/${id}/hapus`, {});

    expect(response.status).toBe(303);
    expect(lokasi(response)).toContain("tidak dapat dihapus");
    expect(semuaVoucher()).toHaveLength(1);
  });

  it("tidak menghapus lewat GET", async () => {
    const id = tambahVoucherUji(getDb());
    expect((await jar.minta(`/voucher/${id}/hapus`)).status).toBe(404);
    expect(semuaVoucher()).toHaveLength(1);
  });
});

describe("keamanan tampilan voucher", () => {
  it("meng-escape nama paket yang berisi HTML", async () => {
    tambahVoucherUji(getDb(), {
      namaPaket: "<script>alert(1)</script>",
    });
    const html = await (await jar.minta("/voucher")).text();

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });
});
