import { getDb } from "../db/connection.ts";

export interface KasbonAktif {
  id: number;
  namaPelanggan: string;
  kontak: string | null;
  nominal: number;
  tanggalTempo: string;
  status: string;
}

export interface RingkasanPiutang {
  totalPiutang: number;
  jumlahDebitur: number;
}

export function kasbonAktif(): KasbonAktif[] {
  return getDb()
    .query(
      `SELECT
         d.id,
         p.nama          AS namaPelanggan,
         p.kontak,
         t.harga_jual    AS nominal,
         d.tanggal_tempo AS tanggalTempo,
         d.status
       FROM debts d
       JOIN pelanggan p    ON p.id = d.pelanggan_id
       JOIN transactions t ON t.id = d.transaction_id
       WHERE d.status = 'belum_lunas'
       ORDER BY d.tanggal_tempo, d.id`,
    )
    .all() as KasbonAktif[];
}

export function ringkasanPiutang(): RingkasanPiutang {
  const baris = getDb()
    .query(
      `SELECT
         COALESCE(SUM(t.harga_jual), 0) AS totalPiutang,
         COUNT(*)                       AS jumlahDebitur
       FROM debts d
       JOIN transactions t ON t.id = d.transaction_id
       WHERE d.status = 'belum_lunas'`,
    )
    .get() as RingkasanPiutang;
  return {
    totalPiutang: Number(baris.totalPiutang),
    jumlahDebitur: Number(baris.jumlahDebitur),
  };
}

export function ambilKasbon(id: number): { id: number; status: string } | null {
  return getDb()
    .query("SELECT id, status FROM debts WHERE id = ?")
    .get(id) as { id: number; status: string } | null;
}

export function lunaskanKasbon(id: number, tanggalLunas: string): boolean {
  const hasil = getDb()
    .query(
      `UPDATE debts
       SET status = 'lunas', tanggal_lunas = ?
       WHERE id = ? AND status = 'belum_lunas'`,
    )
    .run(tanggalLunas, id);
  return hasil.changes === 1;
}
