import type { Voucher } from "../models/voucher.ts";
import type { VoucherMasukTampil } from "../models/voucher-masuk.ts";
import { BarisKosong, CsrfInput } from "./komponen.tsx";
import { Layout, renderHalaman } from "./layout.tsx";
import type { PenggunaRingkas } from "./layout.tsx";

export interface PropsVoucherMasuk {
  hariIni: string;
  vouchers: Voucher[];
  daftar: VoucherMasukTampil[];
  isian: Record<string, string>;
  galat: string[];
  pengguna: PenggunaRingkas;
  csrf: string;
  pesan?: string;
}

export function renderVoucherMasuk(props: PropsVoucherMasuk): string {
  const isi = (
    <Layout
      judul="Voucher Masuk — RPL Konter Sampit"
      tanggal={props.hariIni}
      aktif="Voucher Masuk"
      pengguna={props.pengguna}
      csrf={props.csrf}
      pesan={props.pesan}
    >
      <div class="card">
        <div class="card-title">
          <span>Catat Voucher Masuk</span>
          <a class="tautan-aksi" href="/voucher">
            Daftar voucher
          </a>
        </div>
        <p class="catatan">
          Ledger dan penambahan stok disimpan dalam satu transaksi basis data.
        </p>

        {props.galat.length > 0 ? (
          <div class="galat" role="alert">
            {props.galat.map((pesan) => (
              <div>{pesan}</div>
            ))}
          </div>
        ) : null}

        <form method="post" action="/voucher-masuk">
          <CsrfInput token={props.csrf} />
          <div class="grid-2">
            <div class="form-group">
              <label for="voucher_id">Voucher (induk)</label>
              <select id="voucher_id" name="voucher_id" required>
                <option value="">-- pilih voucher --</option>
                {props.vouchers.map((voucher) => (
                  <option
                    value={voucher.id}
                    selected={props.isian.voucher_id === String(voucher.id)}
                  >
                    {`${voucher.namaPaket} — ${voucher.operator} — ${voucher.stok} pcs`}
                  </option>
                ))}
              </select>
            </div>
            <div class="form-group">
              <label for="jumlah">Jumlah Masuk (pcs)</label>
              <input
                type="number"
                id="jumlah"
                name="jumlah"
                min="1"
                step="1"
                value={props.isian.jumlah ?? ""}
                placeholder="20"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="tanggal">Tanggal</label>
            <input
              type="date"
              id="tanggal"
              name="tanggal"
              value={props.isian.tanggal ?? props.hariIni}
            />
          </div>

          <button type="submit" class="btn">
            Simpan Voucher Masuk
          </button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Riwayat Voucher Masuk</span>
          <span class="subjudul">{props.daftar.length} baris</span>
        </div>
        <div class="tabel-wrapper">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Voucher</th>
                <th>Operator</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {props.daftar.length === 0 ? (
                <BarisKosong kolom={4} teks="Belum ada voucher masuk." />
              ) : (
                props.daftar.map((baris) => (
                  <tr>
                    <td>{baris.tanggal}</td>
                    <td>{baris.namaPaket}</td>
                    <td>{baris.operator}</td>
                    <td>{baris.jumlah} pcs</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );

  return renderHalaman(isi);
}
