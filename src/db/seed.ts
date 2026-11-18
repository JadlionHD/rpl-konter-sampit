import type { Database } from "bun:sqlite";
import { tambahHari, tanggalLokalSekarang } from "../lib/waktu.ts";

/**
 * Data contoh untuk pengembangan (bukan data klien).
 * Tanggal kedaluwarsa dihitung dari hari ini agar peringatan KF-09 selalu
 * dapat didemonstrasikan.
 */
export function isiDataContoh(db: Database): void {
  const jumlah = db.query("SELECT COUNT(*) AS n FROM vouchers").get() as {
    n: number;
  };
  if (jumlah.n > 0) return;

  const hariIni = tanggalLokalSekarang();
  const contoh: [string, string, number, number, number, string][] = [
    ["Telkomsel 2.5GB 5 Hari", "Telkomsel", 15, 10500, 12000, tambahHari(hariIni, 45)],
    ["Indosat Freedom 3GB 30 Hari", "Indosat", 8, 22000, 25000, tambahHari(hariIni, 20)],
    ["XL Xtra Combo Flex 12GB", "XL Axiata", 5, 36000, 40000, tambahHari(hariIni, 5)],
    ["Tri Happy 6GB 30 Hari", "Tri (3)", 0, 18000, 20000, tambahHari(hariIni, 60)],
  ];

  const simpan = db.prepare(`
    INSERT INTO vouchers
      (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const baris of contoh) simpan.run(...baris);
}
