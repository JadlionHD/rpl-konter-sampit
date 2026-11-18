import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { tanggalLokalSekarang } from "../src/lib/waktu.ts";
import { cariTransaksi, simpanTransaksi } from "../src/models/transaksi.ts";
import { parseFilterTransaksi } from "../src/services/pencarian.ts";
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

function pulsa(
  waktu: string,
  nomor: string,
  operator: string,
  metode: "tunai" | "kasbon" = "tunai",
  jual = 12000,
): number {
  return simpanTransaksi(
    {
      waktu,
      jenis: "pulsa",
      nomorTujuan: nomor,
      operator,
      voucherId: null,
      jumlah: 1,
      hargaModal: 10000,
      hargaJual: jual,
      metodeBayar: metode,
      penggunaId: null,
    },
    metode === "kasbon"
      ? { namaPelanggan: "Pak Andi", kontak: null, tanggalTempo: "2026-12-01" }
      : null,
  );
}

function transaksiVoucher(waktu: string, namaPaket: string): number {
  const voucherId = tambahVoucherUji(getDb(), {
    namaPaket,
    operator: "Telkomsel",
    stok: 5,
  });
  return simpanTransaksi(
    {
      waktu,
      jenis: "voucher",
      nomorTujuan: null,
      operator: null,
      voucherId,
      jumlah: 1,
      hargaModal: 10000,
      hargaJual: 12000,
      metodeBayar: "tunai",
      penggunaId: null,
    },
    null,
  );
}

function siapkanData(): void {
  pulsa("2026-11-18 09:00:00", "081234567890", "Telkomsel");
  pulsa("2026-11-18 10:00:00", "081399887766", "Indosat", "kasbon", 25000);
  simpanTransaksi(
    {
      waktu: "2026-11-19 08:00:00",
      jenis: "token",
      nomorTujuan: "14012345678",
      operator: "PLN",
      voucherId: null,
      jumlah: 1,
      hargaModal: 20500,
      hargaJual: 23000,
      metodeBayar: "tunai",
      penggunaId: null,
    },
    null,
  );
  transaksiVoucher("2026-11-18 11:00:00", "Diskon 100%");
  transaksiVoucher("2026-11-18 12:00:00", "Paket_5GB");
}

describe("cariTransaksi (KF-11)", () => {
  it("membatasi hasil pada rentang tanggal inklusif", () => {
    siapkanData();
    const hasil = cariTransaksi({ dari: "2026-11-18", sampai: "2026-11-18" });
    expect(hasil).toHaveLength(4);
    expect(hasil.every((t) => t.waktu.startsWith("2026-11-18"))).toBe(true);

    const besok = cariTransaksi({ dari: "2026-11-19", sampai: "2026-11-19" });
    expect(besok).toHaveLength(1);
    expect(besok[0].operator).toBe("PLN");
  });

  it("memfilter operator secara persis", () => {
    siapkanData();
    const hasil = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      operator: "Telkomsel",
    });
    expect(hasil).toHaveLength(1);
    expect(hasil[0].nomorTujuan).toBe("081234567890");
  });

  it("mencari nomor tujuan dengan kata kunci", () => {
    siapkanData();
    const hasil = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      q: "0812",
    });
    expect(hasil).toHaveLength(1);
    expect(hasil[0].nomorTujuan).toBe("081234567890");
  });

  it("memperlakukan % dan _ sebagai huruf biasa", () => {
    siapkanData();
    const persen = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      q: "%",
    });
    expect(persen).toHaveLength(1);
    expect(persen[0].namaVoucher).toBe("Diskon 100%");

    const garisBawah = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      q: "_",
    });
    expect(garisBawah).toHaveLength(1);
    expect(garisBawah[0].namaVoucher).toBe("Paket_5GB");
  });

  it("tidak rentan terhadap injeksi LIKE", () => {
    siapkanData();
    const hasil = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      q: "' OR 1=1 --",
    });
    expect(hasil).toHaveLength(0);
  });

  it("memfilter status lunas dan kasbon", () => {
    siapkanData();
    const lunas = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      status: "lunas",
    });
    expect(lunas).toHaveLength(4);

    const kasbon = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-19",
      status: "belum_lunas",
    });
    expect(kasbon).toHaveLength(1);
    expect(kasbon[0].statusBayar).toBe("belum_lunas");
  });

  it("menggabungkan beberapa filter", () => {
    siapkanData();
    const hasil = cariTransaksi({
      dari: "2026-11-18",
      sampai: "2026-11-18",
      operator: "Indosat",
      status: "belum_lunas",
      q: "0813",
    });
    expect(hasil).toHaveLength(1);
    expect(hasil[0].nomorTujuan).toBe("081399887766");
  });
});

describe("parseFilterTransaksi", () => {
  it("memakai hari ini sebagai default", () => {
    const hariIni = tanggalLokalSekarang();
    const hasil = parseFilterTransaksi({}, hariIni);
    expect(hasil.filter.dari).toBe(hariIni);
    expect(hasil.filter.sampai).toBe(hariIni);
    expect(hasil.adaFilter).toBe(false);
  });

  it("mengabaikan operator yang tidak dikenal dan memberi pesan", () => {
    const hasil = parseFilterTransaksi(
      { operator: "Operator Palsu" },
      "2026-11-18",
    );
    expect(hasil.filter.operator).toBeUndefined();
    expect(hasil.galat.join(" ")).toContain("operator tidak dikenal");
  });

  it("menukar tanggal akhir yang lebih awal dan memberi pesan", () => {
    const hasil = parseFilterTransaksi(
      { dari: "2026-11-19", sampai: "2026-11-18" },
      "2026-11-18",
    );
    expect(hasil.filter.dari).toBe("2026-11-19");
    expect(hasil.filter.sampai).toBe("2026-11-19");
    expect(hasil.galat.join(" ")).toContain("tidak boleh sebelum");
  });
});

describe("halaman riwayat", () => {
  it("menampilkan hasil dan keadaan kosong yang berbeda", async () => {
    siapkanData();
    const ada = await (await jar.minta("/riwayat?dari=2026-11-18&sampai=2026-11-18")).text();
    expect(ada).toContain("081234567890");
    expect(ada).not.toContain("Tidak ada transaksi yang cocok.");

    const kosong = await (
      await jar.minta("/riwayat?dari=2026-11-18&sampai=2026-11-18&q=zzz")
    ).text();
    expect(kosong).toContain("Tidak ada transaksi yang cocok.");
  });

  it("menampilkan peringatan filter tidak valid", async () => {
    const html = await (
      await jar.minta("/riwayat?operator=Operator+Palsu")
    ).text();
    expect(html).toContain("Filter operator tidak dikenal");
  });
});
