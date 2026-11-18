/**
 * Utilitas waktu untuk aplikasi konter.
 *
 * Semua pencatatan memakai zona Asia/Jakarta (WIB), bukan UTC. Ini penting:
 * `new Date().toISOString()` masih tanggal kemarin antara pukul 00.00–06.59 WIB,
 * sehingga rekap harian bisa salah.
 */
const ZONA_WAKTU = process.env.KONTER_ZONA_WAKTU ?? "Asia/Jakarta";

const PEMFORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA_WAKTU,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function bagianWaktu(waktu: Date): Record<string, string> {
  const bagian: Record<string, string> = {};
  for (const item of PEMFORMAT.formatToParts(waktu)) {
    if (item.type !== "literal") bagian[item.type] = item.value;
  }
  return bagian;
}

/** `2026-11-18 14:05:09` dalam zona waktu aplikasi. */
export function waktuLokal(waktu: Date = new Date()): string {
  const b = bagianWaktu(waktu);
  return `${b.year}-${b.month}-${b.day} ${b.hour}:${b.minute}:${b.second}`;
}

/** `2026-11-18` dalam zona waktu aplikasi. */
export function tanggalLokal(waktu: Date = new Date()): string {
  const b = bagianWaktu(waktu);
  return `${b.year}-${b.month}-${b.day}`;
}

export function tanggalLokalSekarang(): string {
  return tanggalLokal();
}

/** Hari pertama bulan dari tanggal ISO `YYYY-MM-DD`. */
export function awalBulan(tanggal: string): string {
  return `${tanggal.slice(0, 7)}-01`;
}

/** Menambah/mengurangi hari pada tanggal ISO `YYYY-MM-DD`. */
export function tambahHari(tanggal: string, hari: number): string {
  const dasar = new Date(`${tanggal}T00:00:00Z`);
  if (Number.isNaN(dasar.getTime())) {
    throw new Error(`Tanggal tidak valid: ${tanggal}`);
  }
  dasar.setUTCDate(dasar.getUTCDate() + hari);
  return dasar.toISOString().slice(0, 10);
}

/** Selisih hari `sampai - dari`; negatif bila `sampai` sudah lewat. */
export function selisihHari(dari: string, sampai: string): number {
  const a = Date.parse(`${dari}T00:00:00Z`);
  const b = Date.parse(`${sampai}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;
  return Math.round((b - a) / 86_400_000);
}

/** Rentang setengah terbuka untuk query satu hari: `>= mulai` dan `< selesai`. */
export function rentangHari(tanggal: string): { mulai: string; selesai: string } {
  return {
    mulai: `${tanggal} 00:00:00`,
    selesai: `${tambahHari(tanggal, 1)} 00:00:00`,
  };
}
