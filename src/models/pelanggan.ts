import { getDb } from "../db/connection.ts";

/**
 * Cari pelanggan berdasarkan (nama, kontak) atau buat baru.
 * `kontak IS ?` menangani nilai NULL dengan benar (perilaku SQLite).
 */
export function cariAtauBuatPelanggan(
  nama: string,
  kontak: string | null,
): number {
  const db = getDb();
  const ada = db
    .query("SELECT id FROM pelanggan WHERE nama = ? AND kontak IS ?")
    .get(nama, kontak) as { id: number } | null;
  if (ada) return ada.id;

  const hasil = db
    .query("INSERT INTO pelanggan (nama, kontak) VALUES (?, ?)")
    .run(nama, kontak);
  return Number(hasil.lastInsertRowid);
}
