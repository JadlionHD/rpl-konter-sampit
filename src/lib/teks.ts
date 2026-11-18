/** Netralkan karakter khusus LIKE agar dicari sebagai huruf biasa. */
export function escapeLike(nilai: string): string {
  return nilai
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_");
}
