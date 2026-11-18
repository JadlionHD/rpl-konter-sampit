import { getDb } from "../db/connection.ts";

export type Peran = "pemilik" | "kasir";

export interface Pengguna {
  id: number;
  username: string;
  peran: Peran;
  aktif: number;
}

export interface PenggunaDenganHash extends Pengguna {
  password_hash: string;
}

export function cariPengguna(username: string): PenggunaDenganHash | null {
  return getDb()
    .query(
      `SELECT id, username, password_hash, peran, aktif
       FROM pengguna WHERE username = ?`,
    )
    .get(username) as PenggunaDenganHash | null;
}

export function ambilPengguna(id: number): Pengguna | null {
  return getDb()
    .query("SELECT id, username, peran, aktif FROM pengguna WHERE id = ?")
    .get(id) as Pengguna | null;
}

export function tambahPengguna(
  username: string,
  passwordHash: string,
  peran: Peran,
): number {
  const hasil = getDb()
    .query(
      `INSERT INTO pengguna (username, password_hash, peran)
       VALUES (?, ?, ?)`,
    )
    .run(username, passwordHash, peran);
  return Number(hasil.lastInsertRowid);
}
