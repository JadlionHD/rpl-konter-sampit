/**
 * Menghitung proporsi keputusan dan tag pada jurnal Vibe Coding.
 * Jalankan: bun run rekap:jurnal
 */
import { readFileSync } from "node:fs";

const berkas = process.argv[2] ?? "jurnal-vibe-coding.md";
const baris = readFileSync(berkas, "utf8").split(/\r?\n/);

const entri = baris
  .filter((baris) => /^\|\s*\d+\s*\|/.test(baris))
  .map((baris) =>
    baris
      .split("|")
      .slice(1, -1)
      .map((sel) => sel.trim()),
  );

const total = entri.length;
const keputusan = new Map<string, number>([
  ["Terima", 0],
  ["Ubah", 0],
  ["Tolak", 0],
  ["Belum diisi", 0],
]);

let debug = 0;
let galat = 0;

for (const kolom of entri) {
  const nilai = kolom[4] ?? "";
  if (keputusan.has(nilai)) {
    keputusan.set(nilai, (keputusan.get(nilai) ?? 0) + 1);
  } else {
    keputusan.set("Belum diisi", (keputusan.get("Belum diisi") ?? 0) + 1);
  }

  const teks = `${kolom[1] ?? ""} ${kolom[3] ?? ""}`;
  if (teks.includes("[Debug]")) debug++;
  if (teks.includes("[Galat:")) galat++;
}

const persen = (n: number): string =>
  total === 0 ? "0%" : `${Math.round((n / total) * 100)}%`;

console.log(`# Rekap Jurnal Vibe Coding`);
console.log();
console.log(`Total entri: **${total}**`);
console.log();
console.log("| Keputusan | Jumlah | Proporsi |");
console.log("|---|---:|---:|");
for (const [nama, jumlah] of keputusan) {
  console.log(`| ${nama} | ${jumlah} | ${persen(jumlah)} |`);
}
console.log();
console.log(`Entri bertanda [Debug]: **${debug}**`);
console.log(`Entri bertanda [Galat: ...]: **${galat}**`);
console.log();
console.log(
  "Catatan: proporsi dihitung dari jurnal yang diisi; bukan ukuran kualitas AI.",
);
