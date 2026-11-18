import type { Child } from "hono/jsx";
import { VERSI } from "../versi.ts";

export interface PenggunaRingkas {
  username: string;
  peran: "pemilik" | "kasir";
}

export interface PropsLayout {
  judul: string;
  tanggal?: string;
  aktif?: string;
  pengguna?: PenggunaRingkas | null;
  csrf?: string;
  tanpaNav?: boolean;
  pesan?: string;
  galat?: string;
  children?: Child;
}

export function Layout(props: PropsLayout) {
  const semuaTautan = [
    { nama: "Beranda", alamat: "/" },
    { nama: "Voucher", alamat: "/voucher" },
    { nama: "Voucher Masuk", alamat: "/voucher-masuk", pemilikSaja: true },
    { nama: "Riwayat", alamat: "/riwayat" },
    { nama: "Kasbon", alamat: "/#kasbon" },
    { nama: "Laporan", alamat: "/laporan", pemilikSaja: true },
  ];
  const tautan =
    props.pengguna?.peran === "pemilik"
      ? semuaTautan
      : semuaTautan.filter((item) => !item.pemilikSaja);

  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.judul}</title>
        <link rel="stylesheet" href="/style.css" />
        <script src="/app.js" defer></script>
      </head>
      <body>
        <header>
          <div>
            <h1>RPL Konter Sampit</h1>
            <p class="subjudul">Pencatatan Transaksi dan Manajemen Stok</p>
          </div>
          {props.tanggal ? <span class="badge">{props.tanggal}</span> : null}
        </header>

        {props.tanpaNav ? null : (
          <nav class="navigasi" aria-label="Navigasi utama">
            {tautan.map((item) => (
              <a
                href={item.alamat}
                class={props.aktif === item.nama ? "aktif" : undefined}
              >
                {item.nama}
              </a>
            ))}
            <span class="kanan">
              {props.pengguna ? (
                <>
                  <span class="pengguna">
                    {props.pengguna.username} ({props.pengguna.peran})
                  </span>
                  <form method="post" action="/logout">
                    <input
                      type="hidden"
                      name="csrf_token"
                      value={props.csrf ?? ""}
                    />
                    <button type="submit" class="keluar">
                      Keluar
                    </button>
                  </form>
                </>
              ) : (
                <a href="/login">Masuk</a>
              )}
            </span>
          </nav>
        )}

        <main>
          {props.pesan ? (
            <p class="pesan" role="status">
              {props.pesan}
            </p>
          ) : null}
          {props.galat ? (
            <p class="galat" role="alert">
              {props.galat}
            </p>
          ) : null}
          {props.children}
        </main>

        <footer>Versi {VERSI} — RPL Konter Sampit</footer>
      </body>
    </html>
  );
}

/** Menambahkan doctype pada hasil render JSX (Hono tidak menambahkannya). */
export function renderHalaman(komponen: unknown): string {
  return "<!DOCTYPE html>" + String(komponen);
}
