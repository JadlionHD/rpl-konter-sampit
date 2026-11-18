/**
 * Membuat akun pengguna baru.
 * Jalankan: bun run buat:pengguna
 * Kata sandi dibaca dari terminal dan tidak ditulis ke kode/repositori.
 */
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { inisialisasiDatabase, tutupDatabase } from "../src/db/connection.ts";
import { terapkanSkema } from "../src/db/schema.ts";
import { buatPengguna } from "../src/services/autentikasi.ts";

async function bacaSandi(prompt: string): Promise<string> {
  if (!input.isTTY) {
    const rl = createInterface({ input, output });
    const jawab = await rl.question(prompt);
    rl.close();
    return jawab;
  }

  output.write(prompt);
  input.setRawMode?.(true);
  input.resume();
  input.setEncoding("utf8");

  return new Promise((resolve, reject) => {
    let data = "";

    const selesai = (): void => {
      input.setRawMode?.(false);
      input.pause();
      input.off("data", onData);
      output.write("\n");
      resolve(data);
    };

    const onData = (potongan: string): void => {
      for (const karakter of potongan) {
        if (karakter === "\r" || karakter === "\n") {
          selesai();
          return;
        }
        if (karakter === "\u0003") {
          input.setRawMode?.(false);
          input.pause();
          input.off("data", onData);
          output.write("\n");
          reject(new Error("Dibatalkan."));
          return;
        }
        if (karakter === "\u007f" || karakter === "\b") {
          if (data.length > 0) {
            data = data.slice(0, -1);
            output.write("\b \b");
          }
          continue;
        }
        data += karakter;
        output.write("*");
      }
    };

    input.on("data", onData);
  });
}

async function main(): Promise<void> {
  const db = inisialisasiDatabase();
  terapkanSkema(db);

  const rl = createInterface({ input, output });
  const username = (await rl.question("Nama pengguna: ")).trim();
  const peran = (await rl.question("Peran (pemilik/kasir): ")).trim();
  rl.close();

  try {
    const password = await bacaSandi("Kata sandi (min. 8 karakter): ");
    const ulangi = await bacaSandi("Ulangi kata sandi: ");

    if (password !== ulangi) {
      console.error("Kata sandi tidak sama.");
      process.exitCode = 1;
      return;
    }

    const hasil = await buatPengguna(username, password, peran);
    if (!hasil.ok) {
      console.error(hasil.galat.join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log("Akun berhasil dibuat.");
  } finally {
    tutupDatabase();
  }
}

main().catch((kesalahan) => {
  console.error("Gagal membuat akun:", (kesalahan as Error).message);
  process.exitCode = 1;
});
