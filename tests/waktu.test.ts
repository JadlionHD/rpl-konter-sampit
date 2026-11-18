import { describe, expect, it } from "bun:test";
import {
  rentangHari,
  selisihHari,
  tambahHari,
  tanggalLokal,
  waktuLokal,
} from "../src/lib/waktu.ts";

describe("waktu lokal Asia/Jakarta", () => {
  it("memakai tanggal WIB, bukan UTC, pada dini hari", () => {
    const diniHari = new Date("2026-11-17T17:30:00Z"); // 00:30 WIB, 18 Nov
    expect(tanggalLokal(diniHari)).toBe("2026-11-18");
    expect(waktuLokal(diniHari)).toBe("2026-11-18 00:30:00");
  });

  it("menampilkan jam 23 tanpa berubah menjadi 24", () => {
    const malam = new Date("2026-11-18T16:59:59Z"); // 23:59:59 WIB
    expect(waktuLokal(malam)).toBe("2026-11-18 23:59:59");
  });
});

describe("aritmetika tanggal", () => {
  it("menambah hari melewati batas bulan", () => {
    expect(tambahHari("2026-11-30", 1)).toBe("2026-12-01");
    expect(tambahHari("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("menangani tahun kabisat", () => {
    expect(tambahHari("2024-02-28", 1)).toBe("2024-02-29");
  });

  it("menghitung selisih hari", () => {
    expect(selisihHari("2026-11-18", "2026-11-25")).toBe(7);
    expect(selisihHari("2026-11-18", "2026-11-17")).toBe(-1);
    expect(selisihHari("2026-11-18", "2026-11-18")).toBe(0);
  });

  it("membuat rentang setengah terbuka untuk satu hari", () => {
    expect(rentangHari("2026-11-18")).toEqual({
      mulai: "2026-11-18 00:00:00",
      selesai: "2026-11-19 00:00:00",
    });
  });
});
