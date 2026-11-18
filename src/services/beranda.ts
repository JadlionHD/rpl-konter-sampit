import { tambahHari, tanggalLokalSekarang } from "../lib/waktu.ts";
import { kasbonAktif, ringkasanPiutang } from "../models/kasbon.ts";
import {
  daftarTransaksiHari,
  rekapHari,
} from "../models/transaksi.ts";
import { daftarVoucherTampil } from "./voucher.ts";

/** Data yang dibutuhkan halaman beranda, dipakai GET dan render galat POST. */
export function dataBeranda(hariIni: string = tanggalLokalSekarang()) {
  return {
    hariIni,
    tempoBawaan: tambahHari(hariIni, 7),
    rekap: rekapHari(hariIni),
    piutang: ringkasanPiutang(),
    transaksi: daftarTransaksiHari(hariIni),
    vouchers: daftarVoucherTampil(hariIni),
    kasbon: kasbonAktif(),
  };
}
