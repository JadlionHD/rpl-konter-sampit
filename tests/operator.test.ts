import { describe, expect, it } from "bun:test";
import { deteksiOperator, normalisasiNomor } from "../src/services/operator.ts";

describe("deteksiOperator (KF-02)", () => {
  it("mendeteksi Telkomsel, termasuk nomor berawalan 62", () => {
    expect(deteksiOperator("081234567890")).toBe("Telkomsel");
    expect(deteksiOperator("082199887766")).toBe("Telkomsel");
    expect(deteksiOperator("6285211223344")).toBe("Telkomsel");
  });

  it("mendeteksi Indosat", () => {
    expect(deteksiOperator("085712345678")).toBe("Indosat");
    expect(deteksiOperator("085600112233")).toBe("Indosat");
  });

  it("mendeteksi XL Axiata", () => {
    expect(deteksiOperator("087812345678")).toBe("XL Axiata");
    expect(deteksiOperator("081900112233")).toBe("XL Axiata");
  });

  it("mendeteksi Tri dan Smartfren", () => {
    expect(deteksiOperator("089612345678")).toBe("Tri (3)");
    expect(deteksiOperator("088212345678")).toBe("Smartfren");
  });

  it("mengembalikan Lainnya untuk prefix tak dikenal", () => {
    expect(deteksiOperator("080012345678")).toBe("Lainnya");
  });
});

describe("normalisasiNomor", () => {
  it("membuang spasi dan tanda hubung", () => {
    expect(normalisasiNomor("62 852-1122-3344")).toBe("085211223344");
  });

  it("mengubah awalan 62 menjadi 0", () => {
    expect(normalisasiNomor("6281234567890")).toBe("081234567890");
  });

  it("membuang karakter selain angka", () => {
    expect(normalisasiNomor("0812abc3456")).toBe("08123456");
    expect(normalisasiNomor(null)).toBe("");
  });
});
