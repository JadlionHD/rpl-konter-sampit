import { rupiah } from "../lib/format.ts";
import type { VoucherTampil } from "../services/voucher.ts";
import { PILIHAN_OPERATOR } from "../services/operator.ts";
import { Badge, BarisKosong, CsrfInput } from "./komponen.tsx";
import { Layout, renderHalaman } from "./layout.tsx";
import type { PenggunaRingkas } from "./layout.tsx";

export interface PropsDaftarVoucher {
  hariIni: string;
  vouchers: VoucherTampil[];
  pengguna: PenggunaRingkas;
  bolehUbah: boolean;
  csrf: string;
  pesan?: string;
  galat?: string;
}

export function renderDaftarVoucher(props: PropsDaftarVoucher): string {
  const kolom = props.bolehUbah ? 7 : 6;
  const isi = (
    <Layout
      judul="Inventaris Voucher — RPL Konter Sampit"
      tanggal={props.hariIni}
      aktif="Voucher"
      pengguna={props.pengguna}
      csrf={props.csrf}
      pesan={props.pesan}
      galat={props.galat}
    >
      <div class="card">
        <div class="card-title">
          <span>Inventaris Voucher Fisik</span>
          {props.bolehUbah ? (
            <span>
              <a class="btn-kecil" href="/voucher-masuk">
                + Voucher Masuk
              </a>{" "}
              <a class="btn-kecil" href="/voucher/tambah">
                + Tambah Voucher
              </a>
            </span>
          ) : (
            <span class="tag tag-netral">Hanya lihat</span>
          )}
        </div>
        <p class="catatan">
          Stok berkurang lewat transaksi penjualan dan bertambah lewat voucher masuk.
        </p>
        <div class="tabel-wrapper">
          <table>
            <thead>
              <tr>
                <th>Paket</th>
                <th>Operator</th>
                <th>Stok</th>
                <th>Harga Modal</th>
                <th>Harga Jual</th>
                <th>Kedaluwarsa</th>
                {props.bolehUbah ? <th>Aksi</th> : null}
              </tr>
            </thead>
            <tbody>
              {props.vouchers.length === 0 ? (
                <BarisKosong kolom={kolom} teks="Belum ada voucher terdaftar." />
              ) : (
                props.vouchers.map((voucher) => (
                  <tr>
                    <td>
                      <strong>{voucher.namaPaket}</strong>
                    </td>
                    <td>{voucher.operator}</td>
                    <td>
                      <Badge
                        teks={voucher.stokTampil.label}
                        nada={voucher.stokTampil.nada}
                      />
                    </td>
                    <td>{rupiah(voucher.hargaModal)}</td>
                    <td>{rupiah(voucher.hargaJual)}</td>
                    <td>
                      <Badge
                        teks={voucher.kedaluwarsa.label}
                        nada={voucher.kedaluwarsa.nada}
                      />
                    </td>
                    {props.bolehUbah ? (
                      <td>
                        <a
                          class="tautan-aksi"
                          href={`/voucher/${voucher.id}/ubah`}
                        >
                          Ubah
                        </a>
                        <form
                          method="post"
                          action={`/voucher/${voucher.id}/hapus`}
                          class="aksi-baris"
                          data-konfirmasi="Hapus voucher ini?"
                        >
                          <CsrfInput token={props.csrf} />
                          <button type="submit" class="tautan-hapus">
                            Hapus
                          </button>
                        </form>
                      </td>
                    ) : null}
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

export interface PropsFormVoucher {
  hariIni: string;
  mode: "tambah" | "ubah";
  id?: number;
  isian: Record<string, string>;
  galat: string[];
  pengguna: PenggunaRingkas;
  csrf: string;
}

export function renderFormVoucher(props: PropsFormVoucher): string {
  const judul =
    props.mode === "tambah" ? "Tambah Voucher" : "Ubah Voucher";
  const aksi =
    props.mode === "tambah"
      ? "/voucher/tambah"
      : `/voucher/${props.id ?? 0}/ubah`;

  const isi = (
    <Layout
      judul={`${judul} — RPL Konter Sampit`}
      tanggal={props.hariIni}
      aktif="Voucher"
      pengguna={props.pengguna}
      csrf={props.csrf}
    >
      <div class="card">
        <div class="card-title">
          <span>{judul}</span>
        </div>

        {props.galat.length > 0 ? (
          <div class="galat" role="alert">
            {props.galat.map((pesan) => (
              <div>{pesan}</div>
            ))}
          </div>
        ) : null}

        <form method="post" action={aksi}>
          <CsrfInput token={props.csrf} />
          <div class="form-group">
            <label for="nama_paket">Nama Paket</label>
            <input
              type="text"
              id="nama_paket"
              name="nama_paket"
              maxlength={100}
              value={props.isian.nama_paket ?? ""}
              placeholder="XL Xtra Combo 12GB"
              required
            />
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="operator">Operator</label>
              <select id="operator" name="operator" required>
                {PILIHAN_OPERATOR.map((operator) => (
                  <option
                    value={operator}
                    selected={props.isian.operator === operator}
                  >
                    {operator}
                  </option>
                ))}
              </select>
            </div>

            {props.mode === "tambah" ? (
              <div class="form-group">
                <label for="stok">Stok Awal (pcs)</label>
                <input
                  type="number"
                  id="stok"
                  name="stok"
                  min="0"
                  step="1"
                  value={props.isian.stok ?? "0"}
                  required
                />
              </div>
            ) : (
              <div class="form-group">
                <label>Stok Saat Ini</label>
                <input
                  type="text"
                  value={props.isian.stok ?? "0"}
                  class="readonly"
                  readonly
                />
                <p class="catatan">
                  Stok hanya berubah lewat transaksi atau voucher masuk.
                </p>
              </div>
            )}
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="harga_modal">Harga Modal (Rp)</label>
              <input
                type="number"
                id="harga_modal"
                name="harga_modal"
                min="0"
                step="1"
                value={props.isian.harga_modal ?? ""}
                placeholder="36000"
                required
              />
            </div>
            <div class="form-group">
              <label for="harga_jual">Harga Jual (Rp)</label>
              <input
                type="number"
                id="harga_jual"
                name="harga_jual"
                min="0"
                step="1"
                value={props.isian.harga_jual ?? ""}
                placeholder="40000"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="tanggal_expired">Tanggal Kedaluwarsa</label>
            <input
              type="date"
              id="tanggal_expired"
              name="tanggal_expired"
              value={props.isian.tanggal_expired ?? ""}
              required
            />
          </div>

          <button type="submit" class="btn">
            Simpan Voucher
          </button>
          <p class="tengah">
            <a href="/voucher">Batal dan kembali ke daftar</a>
          </p>
        </form>
      </div>
    </Layout>
  );

  return renderHalaman(isi);
}
