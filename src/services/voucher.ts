import { selisihHari, tanggalLokalSekarang } from "../lib/waktu.ts";
import {
  ambilVoucher,
  hapusVoucher,
  semuaVoucher,
  tambahVoucher,
  ubahVoucher,
  voucherDipakai,
} from "../models/voucher.ts";
import type { Voucher, VoucherBaru, VoucherUbah } from "../models/voucher.ts";
import { PILIHAN_OPERATOR } from "./operator.ts";
import { bilangan, tanggalIso, teks } from "./validasi.ts";

export type NadaStatus = "bahaya" | "peringatan" | "aman";

export interface StatusVoucher {
  label: string;
  nada: NadaStatus;
}

/** Peringatan kedaluwarsa (KF-09): ≤ 7 hari, hari ini, atau sudah lewat. */
export function statusKedaluwarsa(
  tanggalExpired: string,
  hariIni: string = tanggalLokalSekarang(),
): StatusVoucher {
  const sisa = selisihHari(hariIni, tanggalExpired);
  if (Number.isNaN(sisa)) return { label: "Tanggal tidak valid", nada: "bahaya" };
  if (sisa < 0) return { label: "Kedaluwarsa", nada: "bahaya" };
  if (sisa === 0) return { label: "Perhatian: Expired Hari Ini", nada: "peringatan" };
  if (sisa <= 7) {
    return { label: `Perhatian: Expired Dalam ${sisa} Hari`, nada: "peringatan" };
  }
  return { label: "Aman", nada: "aman" };
}

export function statusStok(stok: number): StatusVoucher {
  return stok === 0
    ? { label: "Habis", nada: "bahaya" }
    : { label: `${stok} pcs`, nada: "aman" };
}

export interface HasilVoucher {
  ok: boolean;
  galat: string[];
  id?: number;
}

interface DataValidasi {
  namaPaket: string;
  operator: string;
  stok: number;
  hargaModal: number;
  hargaJual: number;
  tanggalExpired: string;
}

/** Validasi form voucher. `denganStok` hanya untuk mode tambah. */
export function validasiVoucher(
  form: Record<string, unknown>,
  denganStok: boolean,
): { data: DataValidasi | null; galat: string[] } {
  const galat: string[] = [];
  const namaPaket = teks(form.nama_paket);
  const operator = teks(form.operator);
  const hargaModal = bilangan(form.harga_modal);
  const hargaJual = bilangan(form.harga_jual);
  const tanggalExpired = tanggalIso(form.tanggal_expired);
  const stok = denganStok ? bilangan(form.stok) : 0;

  if (namaPaket.length < 1 || namaPaket.length > 100) {
    galat.push("Nama paket wajib diisi (1-100 karakter).");
  }
  if (!PILIHAN_OPERATOR.includes(operator)) {
    galat.push(`Operator harus salah satu: ${PILIHAN_OPERATOR.join(", ")}.`);
  }
  if (denganStok && stok === null) {
    galat.push("Stok awal harus berupa angka 0 atau lebih.");
  }
  if (hargaModal === null) {
    galat.push("Harga modal harus berupa angka 0 atau lebih.");
  }
  if (hargaJual === null) {
    galat.push("Harga jual harus berupa angka 0 atau lebih.");
  }
  if (hargaModal !== null && hargaJual !== null && hargaJual < hargaModal) {
    galat.push("Harga jual minimal sama dengan harga modal.");
  }
  if (!tanggalExpired) {
    galat.push("Tanggal kedaluwarsa harus berformat TTTT-BB-HH.");
  }

  if (galat.length > 0) return { data: null, galat };

  return {
    data: {
      namaPaket,
      operator,
      stok: stok ?? 0,
      hargaModal: hargaModal as number,
      hargaJual: hargaJual as number,
      tanggalExpired: tanggalExpired as string,
    },
    galat: [],
  };
}

function pesanKesalahan(kesalahan: unknown): string {
  const pesan = String((kesalahan as Error).message ?? "");
  if (pesan.includes("UNIQUE")) {
    return "Voucher dengan operator dan nama paket tersebut sudah ada.";
  }
  if (pesan.includes("FOREIGN KEY")) {
    return "Voucher tidak dapat dihapus karena sudah dipakai transaksi atau voucher masuk.";
  }
  return "Voucher gagal disimpan.";
}

export function simpanVoucherBaru(form: Record<string, unknown>): HasilVoucher {
  const { data, galat } = validasiVoucher(form, true);
  if (!data) return { ok: false, galat };

  try {
    const id = tambahVoucher(data as VoucherBaru);
    return { ok: true, galat: [], id };
  } catch (kesalahan) {
    return { ok: false, galat: [pesanKesalahan(kesalahan)] };
  }
}

export function perbaruiVoucher(
  id: number,
  form: Record<string, unknown>,
): HasilVoucher {
  const { data, galat } = validasiVoucher(form, false);
  if (!data) return { ok: false, galat };

  try {
    const berhasil = ubahVoucher(id, data as VoucherUbah);
    return berhasil
      ? { ok: true, galat: [] }
      : { ok: false, galat: ["Voucher tidak ditemukan."] };
  } catch (kesalahan) {
    return { ok: false, galat: [pesanKesalahan(kesalahan)] };
  }
}

export function hapusVoucherAman(id: number): HasilVoucher {
  const voucher = ambilVoucher(id);
  if (!voucher) return { ok: false, galat: ["Voucher tidak ditemukan."] };
  if (voucherDipakai(id)) {
    return {
      ok: false,
      galat: ["Voucher tidak dapat dihapus karena sudah dipakai transaksi atau voucher masuk."],
    };
  }

  try {
    return hapusVoucher(id)
      ? { ok: true, galat: [] }
      : { ok: false, galat: ["Voucher tidak ditemukan."] };
  } catch (kesalahan) {
    return { ok: false, galat: [pesanKesalahan(kesalahan)] };
  }
}

/** Data untuk tampilan daftar: voucher + status stok/kedaluwarsa. */
export interface VoucherTampil extends Voucher {
  kedaluwarsa: StatusVoucher;
  stokTampil: StatusVoucher;
}

export function daftarVoucherTampil(
  hariIni: string = tanggalLokalSekarang(),
): VoucherTampil[] {
  return semuaVoucher().map((voucher) => ({
    ...voucher,
    kedaluwarsa: statusKedaluwarsa(voucher.tanggalExpired, hariIni),
    stokTampil: statusStok(voucher.stok),
  }));
}
