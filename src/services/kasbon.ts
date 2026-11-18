import { tanggalLokalSekarang } from "../lib/waktu.ts";
import { ambilKasbon, lunaskanKasbon } from "../models/kasbon.ts";
import { bilangan } from "./validasi.ts";

export interface HasilPelunasan {
  ok: boolean;
  galat: string[];
}

/** Menandai kasbon lunas; menolak id yang tidak ada atau sudah lunas. */
export function prosesPelunasan(
  idMentah: unknown,
  tanggalLunas: string = tanggalLokalSekarang(),
): HasilPelunasan {
  const id = bilangan(idMentah);
  if (id === null || id === 0) {
    return { ok: false, galat: ["Kasbon tidak ditemukan."] };
  }

  const kasbon = ambilKasbon(id);
  if (!kasbon) return { ok: false, galat: ["Kasbon tidak ditemukan."] };
  if (kasbon.status === "lunas") {
    return { ok: false, galat: ["Kasbon sudah lunas."] };
  }

  if (!lunaskanKasbon(id, tanggalLunas)) {
    return { ok: false, galat: ["Kasbon tidak dapat dilunasi."] };
  }
  return { ok: true, galat: [] };
}
