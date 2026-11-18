import { cariPengguna, tambahPengguna } from "../models/pengguna.ts";
import type { Pengguna, Peran } from "../models/pengguna.ts";

export const PERAN = ["pemilik", "kasir"] as const;

export interface HasilAutentikasi {
  ok: boolean;
  galat: string[];
  pengguna?: Pengguna;
}

export interface HasilBuatPengguna {
  ok: boolean;
  galat: string[];
}

const PESAN_LOGIN = "Nama pengguna atau kata sandi salah.";
let hashPalsu: string | null = null;

async function dapatkanHashPalsu(): Promise<string> {
  hashPalsu ??= await Bun.password.hash("kata-sandi-palsu-tidak-dipakai");
  return hashPalsu;
}

export function validasiPenggunaBaru(
  username: string,
  password: string,
  peran: string,
): string[] {
  const galat: string[] = [];
  if (!/^[A-Za-z0-9_]{3,30}$/.test(username)) {
    galat.push("Nama pengguna 3-30 karakter: huruf, angka, atau garis bawah.");
  }
  if ((password ?? "").length < 8) {
    galat.push("Kata sandi minimal 8 karakter.");
  }
  if (!(PERAN as readonly string[]).includes(peran)) {
    galat.push("Peran harus pemilik atau kasir.");
  }
  return galat;
}

export async function buatPengguna(
  usernameMentah: string,
  password: string,
  peranMentah: string,
): Promise<HasilBuatPengguna> {
  const username = (usernameMentah ?? "").trim();
  const peran = (peranMentah ?? "").trim();
  const galat = validasiPenggunaBaru(username, password ?? "", peran);
  if (galat.length > 0) return { ok: false, galat };

  try {
    const hash = await Bun.password.hash(password, { algorithm: "argon2id" });
    tambahPengguna(username, hash, peran as Peran);
    return { ok: true, galat: [] };
  } catch (kesalahan) {
    const pesan = String((kesalahan as Error).message ?? "");
    if (pesan.includes("UNIQUE")) {
      return { ok: false, galat: ["Nama pengguna sudah dipakai."] };
    }
    return { ok: false, galat: ["Pengguna gagal disimpan."] };
  }
}

/**
 * Pesan galat sengaja sama untuk username tidak ada dan kata sandi salah.
 * Saat username tidak ada, hash dummy tetap diverifikasi agar waktu respons
 * tidak membocorkan keberadaan akun.
 */
export async function autentikasi(
  usernameMentah: string,
  password: string,
): Promise<HasilAutentikasi> {
  const username = (usernameMentah ?? "").trim();
  const pengguna = cariPengguna(username);
  const hash = pengguna?.password_hash ?? (await dapatkanHashPalsu());

  let cocok = false;
  try {
    cocok = await Bun.password.verify(password ?? "", hash);
  } catch {
    cocok = false;
  }

  if (!pengguna || !cocok) {
    return { ok: false, galat: [PESAN_LOGIN] };
  }

  if (pengguna.aktif !== 1) {
    return {
      ok: false,
      galat: ["Akun Anda telah dinonaktifkan. Hubungi pemilik."],
    };
  }

  const { password_hash: _, ...aman } = pengguna;
  return { ok: true, galat: [], pengguna: aman };
}
