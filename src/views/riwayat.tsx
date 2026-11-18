import { rupiah } from "../lib/format.ts";
import type { TransaksiTampil } from "../models/transaksi.ts";
import type { FilterTransaksi } from "../models/transaksi.ts";
import {
  JENIS_FILTER,
  OPERATOR_FILTER,
  STATUS_FILTER,
} from "../services/pencarian.ts";
import { Badge, BarisKosong, keteranganTransaksi } from "./komponen.tsx";
import { Layout, renderHalaman } from "./layout.tsx";
import type { PenggunaRingkas } from "./layout.tsx";

export interface PropsRiwayat {
  hariIni: string;
  transaksi: TransaksiTampil[];
  filter: FilterTransaksi;
  galat: string[];
  adaFilter: boolean;
  pengguna: PenggunaRingkas;
  batasiHariIni: boolean;
  csrf: string;
  pesan?: string;
}

export function renderRiwayat(props: PropsRiwayat): string {
  const isi = (
    <Layout
      judul="Riwayat dan Filter Transaksi — RPL Konter Sampit"
      tanggal={props.hariIni}
      aktif="Riwayat"
      pengguna={props.pengguna}
      csrf={props.csrf}
      pesan={props.pesan}
    >
      <div class="card">
        <div class="card-title">
          <span>Riwayat Transaksi</span>
          <a class="tautan-aksi" href="/">
            Kembali ke beranda
          </a>
        </div>

        {props.galat.length > 0 ? (
          <div class="galat" role="alert">
            {props.galat.map((pesan) => (
              <div>{pesan}</div>
            ))}
          </div>
        ) : null}

        {props.batasiHariIni ? (
          <p class="catatan">
            Sebagai Kasir, Anda hanya dapat melihat transaksi hari ini.
          </p>
        ) : null}

        <form method="get" action="/riwayat">
          <div class="grid-2">
            <div class="form-group">
              <label for="dari">Dari Tanggal</label>
              <input
                type="date"
                id="dari"
                name="dari"
                value={props.filter.dari}
                readonly={props.batasiHariIni}
              />
            </div>
            <div class="form-group">
              <label for="sampai">Sampai Tanggal</label>
              <input
                type="date"
                id="sampai"
                name="sampai"
                value={props.filter.sampai}
                readonly={props.batasiHariIni}
              />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="operator">Operator</label>
              <select id="operator" name="operator">
                <option value="">Semua operator</option>
                {OPERATOR_FILTER.map((operator) => (
                  <option
                    value={operator}
                    selected={props.filter.operator === operator}
                  >
                    {operator}
                  </option>
                ))}
              </select>
            </div>
            <div class="form-group">
              <label for="jenis">Jenis Transaksi</label>
              <select id="jenis" name="jenis">
                <option value="">Semua jenis</option>
                {JENIS_FILTER.map((jenis) => (
                  <option value={jenis} selected={props.filter.jenis === jenis}>
                    {jenis}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="status">Status Bayar</label>
              <select id="status" name="status">
                <option value="">Semua status</option>
                {STATUS_FILTER.map((status) => (
                  <option
                    value={status}
                    selected={props.filter.status === status}
                  >
                    {status === "lunas" ? "Lunas" : "Belum lunas / kasbon"}
                  </option>
                ))}
              </select>
            </div>
            <div class="form-group">
              <label for="q">Kata Kunci</label>
              <input
                type="search"
                id="q"
                name="q"
                maxlength={80}
                value={props.filter.q ?? ""}
                placeholder="Nomor tujuan atau nama voucher"
              />
            </div>
          </div>

          <div class="grid-2">
            <button type="submit" class="btn">
              Cari
            </button>
            <a class="btn btn-sekunder" href="/riwayat">
              Reset
            </a>
          </div>
        </form>

        <div class="tabel-wrapper">
          <table>
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Keterangan</th>
                <th>Operator</th>
                <th>Harga Jual</th>
                <th>Status</th>
                <th>Metode</th>
              </tr>
            </thead>
            <tbody>
              {props.transaksi.length === 0 ? (
                <BarisKosong
                  kolom={6}
                  teks={
                    props.adaFilter
                      ? "Tidak ada transaksi yang cocok."
                      : "Belum ada transaksi."
                  }
                />
              ) : (
                props.transaksi.map((transaksi) => {
                  const keterangan = keteranganTransaksi(transaksi);
                  return (
                    <tr>
                      <td>{transaksi.waktu.slice(0, 16)}</td>
                      <td>{keterangan}</td>
                      <td>{transaksi.operator ?? "Voucher fisik"}</td>
                      <td>{rupiah(transaksi.hargaJual)}</td>
                      <td>
                        <Badge
                          teks={transaksi.statusBayar}
                          nada={
                            transaksi.statusBayar === "lunas"
                              ? "aman"
                              : "peringatan"
                          }
                        />
                      </td>
                      <td>{transaksi.metodeBayar}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );

  return renderHalaman(isi);
}
