import type { FilterTransaksi } from "../models/transaksi.ts";
import { selisihHari, tanggalLokalSekarang } from "../lib/waktu.ts";
import { PILIHAN_OPERATOR } from "./operator.ts";
import { tanggalIso, teks } from "./validasi.ts";

export const OPERATOR_FILTER = [
  ...PILIHAN_OPERATOR,
  "PLN",
  "Lainnya",
] as const;
export const JENIS_FILTER = ["pulsa", "data", "token", "voucher"] as const;
export const STATUS_FILTER = ["lunas", "belum_lunas"] as const;

export interface HasilFilterTransaksi {
  filter: FilterTransaksi;
  galat: string[];
  adaFilter: boolean;
}

/**
 * Membaca query string menjadi filter yang aman. Nilai tidak valid tidak
 * pernah masuk ke SQL: nilainya diabaikan dan pengguna diberi pesan.
 */
export function parseFilterTransaksi(
  query: Record<string, string | undefined>,
  hariIni: string = tanggalLokalSekarang(),
): HasilFilterTransaksi {
  const galat: string[] = [];

  const mentahDari = teks(query.dari);
  const mentahSampai = teks(query.sampai);
  let dari = tanggalIso(mentahDari) ?? hariIni;
  let sampai = tanggalIso(mentahSampai) ?? hariIni;

  if (mentahDari && !tanggalIso(mentahDari)) {
    galat.push("Tanggal awal tidak valid; memakai hari ini.");
  }
  if (mentahSampai && !tanggalIso(mentahSampai)) {
    galat.push("Tanggal akhir tidak valid; memakai hari ini.");
  }
  if (selisihHari(dari, sampai) < 0) {
    galat.push("Tanggal akhir tidak boleh sebelum tanggal awal.");
    sampai = dari;
  }

  const mentahOperator = teks(query.operator);
  let operator: string | undefined;
  if (mentahOperator) {
    if ((OPERATOR_FILTER as readonly string[]).includes(mentahOperator)) {
      operator = mentahOperator;
    } else {
      galat.push("Filter operator tidak dikenal; diabaikan.");
    }
  }

  const mentahJenis = teks(query.jenis);
  let jenis: string | undefined;
  if (mentahJenis) {
    if ((JENIS_FILTER as readonly string[]).includes(mentahJenis)) {
      jenis = mentahJenis;
    } else {
      galat.push("Filter jenis transaksi tidak dikenal; diabaikan.");
    }
  }

  const mentahStatus = teks(query.status);
  let status: "lunas" | "belum_lunas" | undefined;
  if (mentahStatus) {
    if ((STATUS_FILTER as readonly string[]).includes(mentahStatus)) {
      status = mentahStatus as "lunas" | "belum_lunas";
    } else {
      galat.push("Filter status tidak dikenal; diabaikan.");
    }
  }

  const q = teks(query.q).slice(0, 80);
  const adaFilter = Boolean(
    mentahDari || mentahSampai || mentahOperator || mentahJenis || mentahStatus || q,
  );

  return {
    filter: {
      dari,
      sampai,
      q: q || undefined,
      operator,
      jenis,
      status,
    },
    galat,
    adaFilter,
  };
}
