import { getDb } from "../db/connection.ts";

export interface Voucher {
  id: number;
  namaPaket: string;
  operator: string;
  stok: number;
  hargaModal: number;
  hargaJual: number;
  tanggalExpired: string;
}

const KOLOM = `
  id,
  nama_paket      AS namaPaket,
  operator,
  stok,
  harga_modal     AS hargaModal,
  harga_jual      AS hargaJual,
  tanggal_expired AS tanggalExpired
`;

export interface VoucherBaru {
  namaPaket: string;
  operator: string;
  stok: number;
  hargaModal: number;
  hargaJual: number;
  tanggalExpired: string;
}

export interface VoucherUbah {
  namaPaket: string;
  operator: string;
  hargaModal: number;
  hargaJual: number;
  tanggalExpired: string;
}

export function semuaVoucher(): Voucher[] {
  return getDb()
    .query(`SELECT ${KOLOM} FROM vouchers ORDER BY operator, nama_paket`)
    .all() as Voucher[];
}

export function ambilVoucher(id: number): Voucher | null {
  return getDb()
    .query(`SELECT ${KOLOM} FROM vouchers WHERE id = ?`)
    .get(id) as Voucher | null;
}

export function tambahVoucher(data: VoucherBaru): number {
  const hasil = getDb()
    .query(
      `INSERT INTO vouchers
         (nama_paket, operator, stok, harga_modal, harga_jual, tanggal_expired)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      data.namaPaket,
      data.operator,
      data.stok,
      data.hargaModal,
      data.hargaJual,
      data.tanggalExpired,
    );
  return Number(hasil.lastInsertRowid);
}

export function ubahVoucher(id: number, data: VoucherUbah): boolean {
  const hasil = getDb()
    .query(
      `UPDATE vouchers
       SET nama_paket = ?, operator = ?, harga_modal = ?, harga_jual = ?,
           tanggal_expired = ?
       WHERE id = ?`,
    )
    .run(
      data.namaPaket,
      data.operator,
      data.hargaModal,
      data.hargaJual,
      data.tanggalExpired,
      id,
    );
  return hasil.changes === 1;
}

export function hapusVoucher(id: number): boolean {
  const hasil = getDb().query("DELETE FROM vouchers WHERE id = ?").run(id);
  return hasil.changes === 1;
}

/** Voucher yang sudah dipakai transaksi atau ledger masuk tidak boleh dihapus. */
export function voucherDipakai(id: number): boolean {
  const baris = getDb()
    .query(
      `SELECT
         (SELECT COUNT(*) FROM transactions WHERE voucher_id = ?) +
         (SELECT COUNT(*) FROM voucher_masuk WHERE voucher_id = ?) AS n`,
    )
    .get(id, id) as { n: number };
  return Number(baris.n) > 0;
}

/**
 * Memotong stok hanya bila stok mencukupi. `changes = 0` berarti gagal;
 * pemanggil berada di dalam transaksi sehingga kegagalan akan di-rollback.
 */
export function kurangiStokVoucher(id: number, jumlah: number): boolean {
  const hasil = getDb()
    .query("UPDATE vouchers SET stok = stok - ? WHERE id = ? AND stok >= ?")
    .run(jumlah, id, jumlah);
  return hasil.changes === 1;
}
