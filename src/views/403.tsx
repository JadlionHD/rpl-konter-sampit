import { Layout, renderHalaman } from "./layout.tsx";
import type { PenggunaRingkas } from "./layout.tsx";

export interface Props403 {
  pengguna: PenggunaRingkas;
  csrf: string;
  pesan?: string;
}

export function render403(props: Props403): string {
  const isi = (
    <Layout
      judul="Akses ditolak — RPL Konter Sampit"
      tanggal=""
      pengguna={props.pengguna}
      csrf={props.csrf}
    >
      <div class="card kartu-sempit">
        <div class="card-title">
          <span>Akses ditolak</span>
        </div>
        <p class="galat" role="alert">
          {props.pesan ??
            "Peran Anda tidak diizinkan membuka halaman ini."}
        </p>
        <a class="btn" href="/">
          Kembali ke Beranda
        </a>
      </div>
    </Layout>
  );

  return renderHalaman(isi);
}
