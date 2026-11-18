const MAKS_GAGAL = 5;
const JEDA_MS = 15 * 60 * 1000;

interface Entri {
  gagal: number;
  sampai: number;
}

const peta = new Map<string, Entri>();

export function kunciBatasLogin(username: string, ip: string): string {
  return `${(username ?? "").trim().toLowerCase()}|${ip}`;
}

export function cekBatasLogin(
  kunci: string,
  sekarang: number = Date.now(),
): { diblokir: boolean; sisaDetik: number } {
  const entri = peta.get(kunci);
  if (!entri) return { diblokir: false, sisaDetik: 0 };

  if (sekarang >= entri.sampai) {
    peta.delete(kunci);
    return { diblokir: false, sisaDetik: 0 };
  }

  return {
    diblokir: entri.gagal >= MAKS_GAGAL,
    sisaDetik: Math.max(1, Math.ceil((entri.sampai - sekarang) / 1000)),
  };
}

export function catatGagalLogin(
  kunci: string,
  sekarang: number = Date.now(),
): void {
  const entri = peta.get(kunci);
  if (!entri || sekarang >= entri.sampai) {
    peta.set(kunci, { gagal: 1, sampai: sekarang + JEDA_MS });
    return;
  }
  peta.set(kunci, {
    gagal: entri.gagal + 1,
    sampai: entri.sampai,
  });
}

export function resetBatasLogin(kunci: string): void {
  peta.delete(kunci);
}

/** Hanya untuk pengujian; jangan dipakai di route. */
export function kosongkanBatasLogin(): void {
  peta.clear();
}
