import type { StatusVoucher } from "../services/voucher.ts";

export function KartuStatistik(props: {
  judul: string;
  nilai: string;
  kelas?: string;
}) {
  return (
    <div class="stat-card">
      <div class="stat-title">{props.judul}</div>
      <div class={`stat-val ${props.kelas ?? ""}`}>{props.nilai}</div>
    </div>
  );
}

export function Badge(props: { teks: string; nada: StatusVoucher["nada"] | "netral" }) {
  return <span class={`tag tag-${props.nada}`}>{props.teks}</span>;
}

export function CsrfInput(props: { token: string }) {
  return <input type="hidden" name="csrf_token" value={props.token} />;
}

export function BarisKosong(props: { kolom: number; teks: string }) {
  return (
    <tr>
      <td colspan={props.kolom} class="kosong">
        {props.teks}
      </td>
    </tr>
  );
}

/** Keterangan pendek transaksi, dipakai beranda dan riwayat. */
export function keteranganTransaksi(transaksi: {
  jenis: string;
  namaVoucher: string | null;
  nomorTujuan: string | null;
  jumlah: number;
}): string {
  if (transaksi.jenis === "voucher") {
    const jumlah =
      transaksi.jumlah > 1 ? ` x${transaksi.jumlah}` : "";
    return `${transaksi.namaVoucher ?? "Voucher"}${jumlah}`;
  }
  return transaksi.nomorTujuan ?? "-";
}
