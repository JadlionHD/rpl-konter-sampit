import { getDb } from "../db/connection.ts";

export interface VoucherMasukTampil {
  id: number;
  tanggal: string;
  voucherId: number;
  namaPaket: string;
  operator: string;
  jumlah: number;
}

export interface VoucherMasukBaru {
  voucherId: number;
  jumlah: number;
  tanggal: string;
  penggunaId: number | null;
}

export function semuaVoucherMasuk(): VoucherMasukTampil[] {
  return getDb()
    .query(
      `SELECT
         vm.id,
         vm.tanggal,
         vm.voucher_id AS voucherId,
         v.nama_paket AS namaPaket,
         v.operator,
         vm.jumlah
       FROM voucher_masuk vm
       JOIN vouchers v ON v.id = vm.voucher_id
       ORDER BY vm.tanggal DESC, vm.id DESC`,
    )
    .all() as VoucherMasukTampil[];
}

/**
 * Menulis ledger dan menambah stok dalam satu transaksi basis data.
 * Bila salah satu langkah gagal, keduanya dibatalkan.
 */
export function simpanVoucherMasuk(data: VoucherMasukBaru): number {
  const db = getDb();

  const jalankan = db.transaction(() => {
    const voucher = db
      .query("SELECT id FROM vouchers WHERE id = ?")
      .get(data.voucherId) as { id: number } | null;
    if (!voucher) throw new Error("Voucher tidak ditemukan.");

    const hasil = db
      .query(
        `INSERT INTO voucher_masuk (voucher_id, jumlah, tanggal, pengguna_id)
         VALUES (?, ?, ?, ?)`,
      )
      .run(data.voucherId, data.jumlah, data.tanggal, data.penggunaId);

    const ubah = db
      .query("UPDATE vouchers SET stok = stok + ? WHERE id = ?")
      .run(data.jumlah, data.voucherId);
    if (ubah.changes !== 1) {
      throw new Error("Gagal menambah stok voucher.");
    }

    return Number(hasil.lastInsertRowid);
  });

  return jalankan();
}
