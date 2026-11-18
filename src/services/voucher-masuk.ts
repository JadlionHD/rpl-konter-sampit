import { tanggalLokalSekarang } from "../lib/waktu.ts";
import { ambilVoucher } from "../models/voucher.ts";
import { simpanVoucherMasuk } from "../models/voucher-masuk.ts";
import { bilangan, tanggalIso } from "./validasi.ts";

export interface HasilVoucherMasuk {
  ok: boolean;
  galat: string[];
  id?: number;
}

/** Validasi lalu simpan voucher masuk + tambah stok secara atomik. */
export function prosesVoucherMasuk(
  form: Record<string, unknown>,
  penggunaId: number | null = null,
  hariIni: string = tanggalLokalSekarang(),
): HasilVoucherMasuk {
  const galat: string[] = [];
  const voucherId = bilangan(form.voucher_id);
  const jumlah = bilangan(form.jumlah);
  const tanggal = tanggalIso(form.tanggal) ?? hariIni;

  if (voucherId === null || voucherId === 0) {
    galat.push("Pilih voucher yang akan ditambah stoknya.");
  } else if (!ambilVoucher(voucherId)) {
    galat.push("Voucher tidak ditemukan.");
  }

  if (jumlah === null || jumlah < 1) {
    galat.push("Jumlah harus berupa angka lebih dari 0.");
  }

  if (!tanggalIso(form.tanggal) && String(form.tanggal ?? "").trim() !== "") {
    galat.push("Tanggal harus berformat TTTT-BB-HH.");
  }

  if (galat.length > 0) return { ok: false, galat };

  try {
    const id = simpanVoucherMasuk({
      voucherId: voucherId as number,
      jumlah: jumlah as number,
      tanggal,
      penggunaId,
    });
    return { ok: true, galat: [], id };
  } catch (kesalahan) {
    return { ok: false, galat: [(kesalahan as Error).message] };
  }
}
