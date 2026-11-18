import { describe, expect, it } from "bun:test";
import {
  statusKedaluwarsa,
  statusStok,
} from "../src/services/voucher.ts";

const hariIni = "2026-11-18";

describe("status kedaluwarsa (KF-09, TC-EXP)", () => {
  it("memberi peringatan tepat 7 hari", () => {
    expect(statusKedaluwarsa("2026-11-25", hariIni)).toEqual({
      label: "Perhatian: Expired Dalam 7 Hari",
      nada: "peringatan",
    });
  });

  it("menganggap 8 hari masih aman", () => {
    expect(statusKedaluwarsa("2026-11-26", hariIni)).toEqual({
      label: "Aman",
      nada: "aman",
    });
  });

  it("memberi peringatan pada hari kedaluwarsa", () => {
    expect(statusKedaluwarsa("2026-11-18", hariIni)).toEqual({
      label: "Perhatian: Expired Hari Ini",
      nada: "peringatan",
    });
  });

  it("menandai voucher yang sudah lewat", () => {
    expect(statusKedaluwarsa("2026-11-17", hariIni)).toEqual({
      label: "Kedaluwarsa",
      nada: "bahaya",
    });
  });

  it("menandai stok habis", () => {
    expect(statusStok(0)).toEqual({ label: "Habis", nada: "bahaya" });
    expect(statusStok(5)).toEqual({ label: "5 pcs", nada: "aman" });
  });
});
