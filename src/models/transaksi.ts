import { getDb } from "../db/connection.ts";
import { escapeLike } from "../lib/teks.ts";
import { rentangHari, tambahHari } from "../lib/waktu.ts";
import { cariAtauBuatPelanggan } from "./pelanggan.ts";
import { kurangiStokVoucher } from "./voucher.ts";

export interface TransaksiBaru {
  waktu: string;
  jenis: string;
  nomorTujuan: string | null;
  operator: string | null;
  voucherId: number | null;
  jumlah: number;
  hargaModal: number;
  hargaJual: number;
  metodeBayar: string;
  penggunaId: number | null;
}

export interface KasbonBaru {
  namaPelanggan: string;
  kontak: string | null;
  tanggalTempo: string;
}

export interface RekapHarian {
  totalOmzet: number;
  totalModal: number;
  totalLaba: number;
  totalTransaksi: number;
}

export interface RekapHarianBaris extends RekapHarian {
  tanggal: string;
}

export interface TransaksiTampil {
  id: number;
  waktu: string;
  jenis: string;
  nomorTujuan: string | null;
  operator: string | null;
  jumlah: number;
  hargaJual: number;
  metodeBayar: string;
  statusBayar: string;
  namaVoucher: string | null;
}

/**
 * Menyimpan transaksi, memotong stok voucher, dan (bila kasbon) membuat
 * pelanggan + kasbon dalam SATU transaksi basis data. Bila salah satu langkah
 * gagal, seluruh perubahan dibatalkan.
 */
export function simpanTransaksi(
  data: TransaksiBaru,
  kasbon: KasbonBaru | null,
): number {
  const db = getDb();

  const jalankan = db.transaction(() => {
    const hasil = db
      .query(
        `INSERT INTO transactions
           (waktu, jenis, nomor_tujuan, operator, voucher_id, jumlah,
            harga_modal, harga_jual, metode_bayar, pengguna_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        data.waktu,
        data.jenis,
        data.nomorTujuan,
        data.operator,
        data.voucherId,
        data.jumlah,
        data.hargaModal,
        data.hargaJual,
        data.metodeBayar,
        data.penggunaId,
      );

    const transaksiId = Number(hasil.lastInsertRowid);

    if (data.voucherId !== null && !kurangiStokVoucher(data.voucherId, data.jumlah)) {
      throw new Error("Stok voucher tidak mencukupi saat menyimpan.");
    }

    if (kasbon) {
      const pelangganId = cariAtauBuatPelanggan(kasbon.namaPelanggan, kasbon.kontak);
      db.query(
        `INSERT INTO debts (transaction_id, pelanggan_id, tanggal_tempo)
         VALUES (?, ?, ?)`,
      ).run(transaksiId, pelangganId, kasbon.tanggalTempo);
    }

    return transaksiId;
  });

  return jalankan();
}

export function rekapHari(tanggal: string): RekapHarian {
  const { mulai, selesai } = rentangHari(tanggal);
  const baris = getDb()
    .query(
      `SELECT
         COALESCE(SUM(harga_jual), 0)              AS totalOmzet,
         COALESCE(SUM(harga_modal), 0)             AS totalModal,
         COALESCE(SUM(harga_jual - harga_modal), 0) AS totalLaba,
         COUNT(*)                                  AS totalTransaksi
       FROM transactions
       WHERE waktu >= ? AND waktu < ?`,
    )
    .get(mulai, selesai) as RekapHarian;

  return {
    totalOmzet: Number(baris.totalOmzet),
    totalModal: Number(baris.totalModal),
    totalLaba: Number(baris.totalLaba),
    totalTransaksi: Number(baris.totalTransaksi),
  };
}

export function rekapPeriode(dari: string, sampai: string): RekapHarian {
  const mulai = `${dari} 00:00:00`;
  const selesai = `${tambahHari(sampai, 1)} 00:00:00`;
  const baris = getDb()
    .query(
      `SELECT
         COALESCE(SUM(harga_jual), 0)              AS totalOmzet,
         COALESCE(SUM(harga_modal), 0)             AS totalModal,
         COALESCE(SUM(harga_jual - harga_modal), 0) AS totalLaba,
         COUNT(*)                                  AS totalTransaksi
       FROM transactions
       WHERE waktu >= ? AND waktu < ?`,
    )
    .get(mulai, selesai) as RekapHarian;

  return {
    totalOmzet: Number(baris.totalOmzet),
    totalModal: Number(baris.totalModal),
    totalLaba: Number(baris.totalLaba),
    totalTransaksi: Number(baris.totalTransaksi),
  };
}

export function rekapHarianPeriode(
  dari: string,
  sampai: string,
): RekapHarianBaris[] {
  const mulai = `${dari} 00:00:00`;
  const selesai = `${tambahHari(sampai, 1)} 00:00:00`;
  return getDb()
    .query(
      `SELECT
         substr(waktu, 1, 10)                      AS tanggal,
         COALESCE(SUM(harga_jual), 0)              AS totalOmzet,
         COALESCE(SUM(harga_modal), 0)             AS totalModal,
         COALESCE(SUM(harga_jual - harga_modal), 0) AS totalLaba,
         COUNT(*)                                  AS totalTransaksi
       FROM transactions
       WHERE waktu >= ? AND waktu < ?
       GROUP BY substr(waktu, 1, 10)
       ORDER BY tanggal DESC`,
    )
    .all(mulai, selesai) as RekapHarianBaris[];
}

export function daftarTransaksiHari(
  tanggal: string,
  batas = 10,
): TransaksiTampil[] {
  const { mulai, selesai } = rentangHari(tanggal);
  return getDb()
    .query(
      `SELECT
         t.id,
         t.waktu,
         t.jenis,
         t.nomor_tujuan AS nomorTujuan,
         t.operator,
         t.jumlah,
         t.harga_jual   AS hargaJual,
         t.metode_bayar AS metodeBayar,
         CASE WHEN d.id IS NULL THEN 'lunas' ELSE d.status END AS statusBayar,
         v.nama_paket   AS namaVoucher
       FROM transactions t
       LEFT JOIN debts d    ON d.transaction_id = t.id
       LEFT JOIN vouchers v ON v.id = t.voucher_id
       WHERE t.waktu >= ? AND t.waktu < ?
       ORDER BY t.id DESC
       LIMIT ?`,
    )
    .all(mulai, selesai, batas) as TransaksiTampil[];
}

export function jumlahTransaksi(): number {
  const baris = getDb()
    .query("SELECT COUNT(*) AS n FROM transactions")
    .get() as { n: number };
  return Number(baris.n);
}

export interface FilterTransaksi {
  dari: string;
  sampai: string;
  q?: string;
  operator?: string;
  jenis?: string;
  status?: "lunas" | "belum_lunas";
  batas?: number;
}

/**
 * Pencarian dan penyaringan riwayat (KF-11).
 * Semua nilai masuk sebagai parameter; potongan SQL yang dirakit hanya
 * fragmen tetap yang ditulis programmer.
 */
export function cariTransaksi(filter: FilterTransaksi): TransaksiTampil[] {
  const mulai = `${filter.dari} 00:00:00`;
  const selesai = `${tambahHari(filter.sampai, 1)} 00:00:00`;
  const potongan: string[] = ["t.waktu >= ?", "t.waktu < ?"];
  const parameter: (string | number)[] = [mulai, selesai];

  if (filter.operator) {
    potongan.push("t.operator = ?");
    parameter.push(filter.operator);
  }
  if (filter.jenis) {
    potongan.push("t.jenis = ?");
    parameter.push(filter.jenis);
  }
  if (filter.status === "lunas") {
    potongan.push("(d.id IS NULL OR d.status = 'lunas')");
  } else if (filter.status === "belum_lunas") {
    potongan.push("d.status = 'belum_lunas'");
  }
  if (filter.q) {
    const pola = `%${escapeLike(filter.q)}%`;
    potongan.push(
      "(t.nomor_tujuan LIKE ? ESCAPE '\\' OR v.nama_paket LIKE ? ESCAPE '\\')",
    );
    parameter.push(pola, pola);
  }

  parameter.push(filter.batas ?? 200);

  return getDb()
    .query(
      `SELECT
         t.id,
         t.waktu,
         t.jenis,
         t.nomor_tujuan AS nomorTujuan,
         t.operator,
         t.jumlah,
         t.harga_jual   AS hargaJual,
         t.metode_bayar AS metodeBayar,
         CASE WHEN d.id IS NULL THEN 'lunas' ELSE d.status END AS statusBayar,
         v.nama_paket   AS namaVoucher
       FROM transactions t
       LEFT JOIN debts d    ON d.transaction_id = t.id
       LEFT JOIN vouchers v ON v.id = t.voucher_id
       WHERE ${potongan.join(" AND ")}
       ORDER BY t.id DESC
       LIMIT ?`,
    )
    .all(...parameter) as TransaksiTampil[];
}
