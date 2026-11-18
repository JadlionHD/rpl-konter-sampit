const FORMAT_ANGKA = new Intl.NumberFormat("id-ID");

/** Rupiah tanpa desimal, contoh: `Rp12.000`. */
export function rupiah(nilai: number): string {
  return `Rp${FORMAT_ANGKA.format(nilai)}`;
}
