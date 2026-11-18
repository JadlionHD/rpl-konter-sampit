import { describe, expect, it } from "bun:test";
import {
  bilangan,
  nomorHpValid,
  salahSatu,
  tanggalIso,
  teks,
} from "../src/services/validasi.ts";

describe("bilangan", () => {
  const kasus: [string, unknown, number | null][] = [
    ["nol diterima", "0", 0],
    ["bilangan biasa", "65000", 65000],
    ["spasi dipangkas", " 500 ", 500],
    ["negatif ditolak", "-1", null],
    ["pecahan ditolak", "12.5", null],
    ["huruf ditolak", "abc", null],
    ["kosong ditolak", "", null],
    ["angka Unicode ditolak", "²", null],
    ["angka 30 digit ditolak", "9".repeat(30), null],
  ];

  for (const [nama, masukan, harapan] of kasus) {
    it(nama, () => expect(bilangan(masukan)).toBe(harapan));
  }
});

describe("tanggalIso", () => {
  it("menerima tanggal ISO yang valid", () => {
    expect(tanggalIso("2026-11-18")).toBe("2026-11-18");
  });

  it("menolak tanggal yang tidak ada di kalender", () => {
    expect(tanggalIso("2026-02-30")).toBeNull();
  });

  it("menolak format lain", () => {
    expect(tanggalIso("20261108")).toBeNull();
    expect(tanggalIso("08-11-2026")).toBeNull();
    expect(tanggalIso("")).toBeNull();
  });
});

describe("nomorHpValid", () => {
  it("menerima 10 sampai 13 digit", () => {
    expect(nomorHpValid("0812345678")).toBe(true);
    expect(nomorHpValid("0812345678901")).toBe(true);
  });

  it("menolak panjang atau karakter yang salah", () => {
    expect(nomorHpValid("081234567")).toBe(false);
    expect(nomorHpValid("08123456789012")).toBe(false);
    expect(nomorHpValid("0812ABC45678")).toBe(false);
  });
});

describe("salahSatu dan teks", () => {
  it("mengembalikan nilai yang diizinkan saja", () => {
    expect(salahSatu("pulsa", ["pulsa", "data"])).toBe("pulsa");
    expect(salahSatu("token", ["pulsa", "data"])).toBeNull();
  });

  it("merapikan teks", () => {
    expect(teks("  Semen  ")).toBe("Semen");
    expect(teks(null)).toBe("");
    expect(teks(undefined)).toBe("");
  });
});
