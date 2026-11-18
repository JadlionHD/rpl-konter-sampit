/**
 * Deteksi operator dari prefix nomor HP (KF-02).
 *
 * Nomor dinormalisasi lebih dulu: karakter selain angka dibuang dan awalan
 * negara `62` diubah menjadi `0`, sehingga `6281234567890` dan `081234567890`
 * menghasilkan operator yang sama.
 */
const PREFIX_OPERATOR: Record<string, string[]> = {
  Telkomsel: ["0811", "0812", "0813", "0821", "0822", "0823", "0851", "0852", "0853"],
  Indosat: ["0814", "0815", "0816", "0855", "0856", "0857", "0858"],
  "XL Axiata": ["0817", "0818", "0819", "0859", "0877", "0878"],
  "Tri (3)": ["0895", "0896", "0897", "0898", "0899"],
  Smartfren: ["0881", "0882", "0883", "0884", "0885", "0886", "0887", "0888", "0889"],
};

export function normalisasiNomor(nomor: string | null | undefined): string {
  let bersih = String(nomor ?? "").replace(/[^0-9]/g, "");
  if (bersih.startsWith("62")) bersih = "0" + bersih.slice(2);
  return bersih;
}

export function deteksiOperator(nomor: string): string {
  const prefix = normalisasiNomor(nomor).slice(0, 4);
  for (const [operator, daftar] of Object.entries(PREFIX_OPERATOR)) {
    if (daftar.includes(prefix)) return operator;
  }
  return "Lainnya";
}

/** Operator yang dapat dipilih manual bila prefix tidak dikenali (UC-01 3a). */
export const PILIHAN_OPERATOR = Object.keys(PREFIX_OPERATOR);
