import { VERSI } from "./versi.ts";

export interface Konfigurasi {
  appEnv: "development" | "production";
  secretKey: string;
  konterDb: string;
  port: number;
  host: string;
  cookieSecure: boolean;
  versi: string;
}

let secretDev: string | null = null;
let sudahPeringatan = false;

/**
 * Konfigurasi dibaca dari lingkungan. Di produksi `SECRET_KEY` wajib kuat;
 * di pengembangan, secret acak dibuat sekali per proses (tidak ditulis ke kode).
 */
export function konfigurasi(): Konfigurasi {
  const appEnv =
    process.env.APP_ENV === "production" ? "production" : "development";

  let secretKey = (process.env.SECRET_KEY ?? "").trim();
  if (!secretKey) {
    if (appEnv === "production") {
      throw new Error(
        "SECRET_KEY wajib diatur di produksi (minimal 32 karakter acak).",
      );
    }
    secretDev ??= crypto.randomUUID() + crypto.randomUUID();
    secretKey = secretDev;
    if (!sudahPeringatan) {
      sudahPeringatan = true;
      console.warn(
        "PERINGATAN: SECRET_KEY tidak diatur; memakai secret acak sementara untuk pengembangan.",
      );
    }
  }

  if (appEnv === "production" && secretKey.length < 32) {
    throw new Error("SECRET_KEY produksi minimal 32 karakter.");
  }

  const port = Number(process.env.PORT ?? 3000);
  const cookieSecure =
    process.env.COOKIE_SECURE === "1" ||
    (process.env.COOKIE_SECURE === undefined && appEnv === "production");

  return {
    appEnv,
    secretKey,
    konterDb: process.env.KONTER_DB ?? "konter.sqlite",
    port: Number.isSafeInteger(port) && port > 0 ? port : 3000,
    host: process.env.HOST ?? "127.0.0.1",
    cookieSecure,
    versi: VERSI,
  };
}
