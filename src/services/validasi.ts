/** Pembaca nilai form yang aman dan konsisten. */

export function teks(nilai: unknown): string {
  if (nilai === null || nilai === undefined) return "";
  return String(nilai).trim();
}

/**
 * Bilangan bulat >= 0, atau null bila bukan digit ASCII.
 * Hanya menerima digit 0-9 supaya `"²"` dan angka 30 digit tidak lolos.
 */
export function bilangan(nilai: unknown): number | null {
  const isian = teks(nilai);
  if (!/^[0-9]+$/.test(isian)) return null;
  const angka = Number(isian);
  return Number.isSafeInteger(angka) ? angka : null;
}

/** Tanggal `YYYY-MM-DD` yang benar-benar ada di kalender. */
export function tanggalIso(nilai: unknown): string | null {
  const isian = teks(nilai);
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(isian)) return null;
  const tanggal = new Date(`${isian}T00:00:00Z`);
  if (Number.isNaN(tanggal.getTime())) return null;
  return tanggal.toISOString().slice(0, 10) === isian ? isian : null;
}

export function salahSatu<T extends string>(
  nilai: unknown,
  pilihan: readonly T[],
): T | null {
  const isian = teks(nilai) as T;
  return pilihan.includes(isian) ? isian : null;
}

/** Nomor HP / ID pelanggan PLN: 10-13 digit angka. */
export function nomorHpValid(nomor: string): boolean {
  return /^[0-9]{10,13}$/.test(nomor);
}
