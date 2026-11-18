import { rupiah } from "../lib/format.ts";
import type {
  RekapHarian,
  RekapHarianBaris,
} from "../models/transaksi.ts";
import { BarisKosong, KartuStatistik } from "./komponen.tsx";
import { Layout, renderHalaman } from "./layout.tsx";
import type { PenggunaRingkas } from "./layout.tsx";

export interface PropsLaporan {
  hariIni: string;
  dari: string;
  sampai: string;
  rekap: RekapHarian;
  harian: RekapHarianBaris[];
  galat: string[];
  pengguna: PenggunaRingkas;
  csrf: string;
}

export function renderLaporan(props: PropsLaporan): string {
  const isi = (
    <Layout
      judul="Laporan — RPL Konter Sampit"
      tanggal={props.hariIni}
      aktif="Laporan"
      pengguna={props.pengguna}
      csrf={props.csrf}
    >
      <div class="card">
        <div class="card-title">
          <span>Laporan Omzet, Modal, dan Laba</span>
          <span class="tag tag-netral">Khusus Pemilik</span>
        </div>

        {props.galat.length > 0 ? (
          <div class="galat" role="alert">
            {props.galat.map((pesan) => (
              <div>{pesan}</div>
            ))}
          </div>
        ) : null}

        <form method="get" action="/laporan">
          <div class="grid-2">
            <div class="form-group">
              <label for="dari">Dari Tanggal</label>
              <input type="date" id="dari" name="dari" value={props.dari} />
            </div>
            <div class="form-group">
              <label for="sampai">Sampai Tanggal</label>
              <input
                type="date"
                id="sampai"
                name="sampai"
                value={props.sampai}
              />
            </div>
          </div>
          <button type="submit" class="btn">
            Tampilkan
          </button>
        </form>
      </div>

      <section class="stats-grid">
        <KartuStatistik
          judul="Omzet Periode"
          nilai={rupiah(props.rekap.totalOmzet)}
        />
        <KartuStatistik
          judul="Modal Periode"
          nilai={rupiah(props.rekap.totalModal)}
        />
        <KartuStatistik
          judul="Laba Kotor"
          nilai={rupiah(props.rekap.totalLaba)}
          kelas="text-success"
        />
        <KartuStatistik
          judul="Transaksi"
          nilai={`${props.rekap.totalTransaksi} trx`}
        />
      </section>

      <div class="card">
        <div class="card-title">
          <span>Rekap per Hari</span>
          <span class="subjudul">
            {props.dari} sampai {props.sampai}
          </span>
        </div>
        <div class="tabel-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Omzet</th>
                <th>Modal</th>
                <th>Laba</th>
                <th>Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {props.harian.length === 0 ? (
                <BarisKosong kolom={5} teks="Belum ada transaksi pada periode ini." />
              ) : (
                props.harian.map((baris) => (
                  <tr>
                    <td>{baris.tanggal}</td>
                    <td>{rupiah(baris.totalOmzet)}</td>
                    <td>{rupiah(baris.totalModal)}</td>
                    <td>{rupiah(baris.totalLaba)}</td>
                    <td>{baris.totalTransaksi}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p class="catatan">
          Angka dihitung dari transaksi; laba tidak disimpan sebagai kolom.
        </p>
      </div>
    </Layout>
  );

  return renderHalaman(isi);
}
