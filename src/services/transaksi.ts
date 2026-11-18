import { waktuLokal } from "../lib/waktu.ts";
import { simpanTransaksi } from "../models/transaksi.ts";
import type { KasbonBaru, TransaksiBaru } from "../models/transaksi.ts";
import { ambilVoucher } from "../models/voucher.ts";
import { deteksiOperator, normalisasiNomor, PILIHAN_OPERATOR } from "./operator.ts";
import { bilangan, nomorHpValid, salahSatu, tanggalIso, teks } from "./validasi.ts";

export const JENIS_TRANSAKSI = ["pulsa", "data", "token", "voucher"] as const;
export const METODE_BAYAR = ["tunai", "qris", "kasbon"] as const;

export type JenisTransaksi = (typeof JENIS_TRANSAKSI)[number];
export type MetodeBayar = (typeof METODE_BAYAR)[number];

export interface HasilProses {
  ok: boolean;
  galat: string[];
  transaksiId?: number;
}

/**
 * Memvalidasi form lalu menyimpan transaksi (satu item per transaksi).
 * Aturan bisnis ada di sini; penulisan SQL tetap di models/.
 */
export function prosesTransaksi(
  form: Record<string, unknown>,
  waktu: string = waktuLokal(),
  penggunaId: number | null = null,
): HasilProses {
  const galat: string[] = [];

  const jenis = salahSatu(form.jenis, JENIS_TRANSAKSI);
  const metodeBayar = salahSatu(form.metode_bayar, METODE_BAYAR);
  if (!jenis) galat.push("Jenis transaksi tidak valid.");
  if (!metodeBayar) galat.push("Metode bayar tidak valid.");

  let nomorTujuan: string | null = null;
  let operator: string | null = null;
  let voucherId: number | null = null;
  let jumlah = 1;
  let hargaModal: number | null = null;
  let hargaJual: number | null = null;

  if (jenis === "voucher") {
    const idVoucher = bilangan(form.voucher_id);
    if (idVoucher === null || idVoucher === 0) {
      galat.push("Pilih voucher yang akan dijual.");
    } else {
      const voucher = ambilVoucher(idVoucher);
      if (!voucher) {
        galat.push("Voucher tidak ditemukan.");
      } else {
        voucherId = voucher.id;
        // Harga diambil dari master voucher, bukan dari isian klien.
        hargaModal = voucher.hargaModal;
        hargaJual = voucher.hargaJual;

        const qty = bilangan(form.jumlah);
        if (qty === null || qty < 1) {
          galat.push("Jumlah harus berupa angka lebih dari 0.");
        } else {
          jumlah = qty;
          if (voucher.stok === 0) {
            galat.push("Stok voucher habis!");
          } else if (qty > voucher.stok) {
            galat.push(`Stok tidak cukup: tersedia ${voucher.stok} pcs.`);
          }
        }
      }
    }
  } else if (jenis) {
    nomorTujuan = normalisasiNomor(teks(form.nomor_tujuan));
    if (!nomorHpValid(nomorTujuan)) {
      galat.push("Nomor HP tidak valid (10-13 digit angka).");
    }

    if (jenis === "token") {
      operator = "PLN";
    } else {
      operator = deteksiOperator(nomorTujuan);
      // Prefix yang tidak dikenali boleh dipilih manual pada antarmuka;
      // server hanya menerima nama operator yang dikenal.
      const operatorManual = teks(form.operator);
      if (operator === "Lainnya" && PILIHAN_OPERATOR.includes(operatorManual)) {
        operator = operatorManual;
      }
    }

    hargaModal = bilangan(form.harga_modal);
    hargaJual = bilangan(form.harga_jual);
    if (hargaModal === null) {
      galat.push("Harga modal harus berupa angka 0 atau lebih.");
    }
    if (hargaJual === null) {
      galat.push("Harga jual harus berupa angka 0 atau lebih.");
    }
    if (hargaModal !== null && hargaJual !== null && hargaJual < hargaModal) {
      galat.push("Harga jual minimal sama dengan harga modal.");
    }
  }

  let kasbon: KasbonBaru | null = null;
  if (metodeBayar === "kasbon") {
    const namaPelanggan = teks(form.nama_pelanggan);
    const kontak = normalisasiNomor(teks(form.kontak));
    const tanggalTempo = tanggalIso(form.tanggal_tempo);

    if (!namaPelanggan) {
      galat.push("Nama pelanggan wajib diisi untuk transaksi kasbon!");
    }
    if (kontak && !nomorHpValid(kontak)) {
      galat.push("Kontak pelanggan tidak valid (10-13 digit angka).");
    }
    if (!tanggalTempo) {
      galat.push("Tanggal jatuh tempo harus berformat TTTT-BB-HH.");
    }

    if (namaPelanggan && tanggalTempo) {
      kasbon = {
        namaPelanggan,
        kontak: kontak || null,
        tanggalTempo,
      };
    }
  }

  if (
    galat.length > 0 ||
    !jenis ||
    !metodeBayar ||
    hargaModal === null ||
    hargaJual === null
  ) {
    return {
      ok: false,
      galat: galat.length > 0 ? galat : ["Data transaksi tidak lengkap."],
    };
  }

  const data: TransaksiBaru = {
    waktu,
    jenis,
    nomorTujuan,
    operator,
    voucherId,
    jumlah,
    hargaModal,
    hargaJual,
    metodeBayar,
    penggunaId,
  };

  try {
    return { ok: true, galat: [], transaksiId: simpanTransaksi(data, kasbon) };
  } catch (kesalahan) {
    return { ok: false, galat: [(kesalahan as Error).message] };
  }
}
