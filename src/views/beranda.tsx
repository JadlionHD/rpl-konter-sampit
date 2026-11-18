import { rupiah } from "../lib/format.ts";
import type { KasbonAktif, RingkasanPiutang } from "../models/kasbon.ts";
import type { RekapHarian, TransaksiTampil } from "../models/transaksi.ts";
import type { VoucherTampil } from "../services/voucher.ts";
import { Badge, BarisKosong, CsrfInput, KartuStatistik, keteranganTransaksi } from "./komponen.tsx";
import { Layout, renderHalaman } from "./layout.tsx";
import type { PenggunaRingkas } from "./layout.tsx";

export interface PropsBeranda {
  hariIni: string;
  tempoBawaan: string;
  rekap: RekapHarian;
  piutang: RingkasanPiutang;
  transaksi: TransaksiTampil[];
  vouchers: VoucherTampil[];
  kasbon: KasbonAktif[];
  pengguna: PenggunaRingkas;
  csrf: string;
  isian?: Record<string, string>;
  galat?: string;
  pesan?: string;
  formAktif?: "transaksi" | "voucher";
}

function FormKasbon(props: {
  tempoBawaan: string;
  awalanId: string;
  tampil?: boolean;
  nama?: string;
  kontak?: string;
  tempo?: string;
}) {
  return (
    <div class="kotak-kasbon" data-kasbon hidden={!props.tampil}>
      <div class="form-group">
        <label for={`${props.awalanId}-nama`}>Nama Pelanggan</label>
        <input
          type="text"
          id={`${props.awalanId}-nama`}
          name="nama_pelanggan"
          maxlength={80}
          value={props.nama ?? ""}
          placeholder="Nama pelanggan yang berutang"
          data-kasbon-nama
        />
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label for={`${props.awalanId}-kontak`}>Nomor Kontak (opsional)</label>
          <input
            type="tel"
            id={`${props.awalanId}-kontak`}
            name="kontak"
            inputmode="numeric"
            maxlength={13}
            value={props.kontak ?? ""}
            placeholder="0813xxxxxxxx"
          />
        </div>
        <div class="form-group">
          <label for={`${props.awalanId}-tempo`}>Tanggal Jatuh Tempo</label>
          <input
            type="date"
            id={`${props.awalanId}-tempo`}
            name="tanggal_tempo"
            value={props.tempo ?? props.tempoBawaan}
          />
        </div>
      </div>
    </div>
  );
}

function TabelVoucher(props: { vouchers: VoucherTampil[] }) {
  return (
    <div class="card">
      <div class="card-title">
        <span>Inventaris Voucher Fisik</span>
        <span class="subjudul">
          {props.vouchers.length} produk terdaftar ·{" "}
          <a class="tautan-aksi" href="/voucher">
            Kelola voucher
          </a>
        </span>
      </div>
      <div class="tabel-wrapper">
        <table>
          <thead>
            <tr>
              <th>Paket</th>
              <th>Operator</th>
              <th>Stok</th>
              <th>Harga Jual</th>
              <th>Kedaluwarsa</th>
            </tr>
          </thead>
          <tbody>
            {props.vouchers.length === 0 ? (
              <BarisKosong kolom={5} teks="Belum ada voucher terdaftar." />
            ) : (
              props.vouchers.map((v) => (
                <tr>
                  <td>
                    <strong>{v.namaPaket}</strong>
                  </td>
                  <td>{v.operator}</td>
                  <td>
                    <Badge teks={v.stokTampil.label} nada={v.stokTampil.nada} />
                  </td>
                  <td>{rupiah(v.hargaJual)}</td>
                  <td>
                    <Badge teks={v.kedaluwarsa.label} nada={v.kedaluwarsa.nada} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabelKasbon(props: {
  kasbon: KasbonAktif[];
  csrf: string;
  hariIni: string;
}) {
  return (
    <div class="card" id="kasbon">
      <div class="card-title">
        <span>Buku Kasbon Aktif</span>
        <span class="subjudul">{props.kasbon.length} kasbon belum lunas</span>
      </div>
      <div class="tabel-wrapper">
        <table>
          <thead>
            <tr>
              <th>Pelanggan</th>
              <th>Kontak</th>
              <th>Nominal</th>
              <th>Jatuh Tempo</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {props.kasbon.length === 0 ? (
              <BarisKosong kolom={5} teks="Tidak ada kasbon aktif." />
            ) : (
              props.kasbon.map((k) => (
                <tr>
                  <td>{k.namaPelanggan}</td>
                  <td>{k.kontak ?? "—"}</td>
                  <td>{rupiah(k.nominal)}</td>
                  <td>
                    {k.tanggalTempo}{" "}
                    {k.tanggalTempo < props.hariIni ? (
                      <Badge teks="Lewat tempo" nada="bahaya" />
                    ) : null}
                  </td>
                  <td>
                    <form
                      method="post"
                      action={`/api/kasbon/${k.id}/lunas`}
                      data-konfirmasi="Tandai kasbon ini sebagai lunas?"
                    >
                      <CsrfInput token={props.csrf} />
                      <button type="submit" class="btn-kecil">
                        Tandai Lunas
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabelTransaksi(props: { transaksi: TransaksiTampil[] }) {
  return (
    <div class="card">
      <div class="card-title">
        <span>Riwayat Transaksi Hari Ini</span>
        <a class="tautan-aksi" href="/riwayat">
          Lihat semua
        </a>
      </div>
      <div class="tabel-wrapper">
        <table>
          <thead>
            <tr>
              <th>Jam</th>
              <th>Keterangan</th>
              <th>Operator</th>
              <th>Harga Jual</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {props.transaksi.length === 0 ? (
              <BarisKosong kolom={5} teks="Belum ada transaksi hari ini." />
            ) : (
              props.transaksi.map((t) => {
                const keterangan = keteranganTransaksi(t);
                return (
                  <tr>
                    <td>{t.waktu.slice(11, 19)}</td>
                    <td>{keterangan}</td>
                    <td>{t.operator ?? "Voucher fisik"}</td>
                    <td>{rupiah(t.hargaJual)}</td>
                    <td>
                      <Badge
                        teks={t.statusBayar}
                        nada={t.statusBayar === "lunas" ? "aman" : "peringatan"}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function renderBeranda(props: PropsBeranda): string {
  const untukTransaksi = props.formAktif !== "voucher";
  const nilai = (kunci: string): string =>
    untukTransaksi ? (props.isian?.[kunci] ?? "") : "";
  const nilaiVoucher = (kunci: string): string =>
    !untukTransaksi ? (props.isian?.[kunci] ?? "") : "";
  const metodeTransaksi = nilai("metode_bayar") || "tunai";
  const metodeVoucher = nilaiVoucher("metode_bayar") || "tunai";
  const pemilik = props.pengguna.peran === "pemilik";

  const isi = (
    <Layout
      judul="RPL Konter Sampit — Kasir dan Transaksi"
      tanggal={props.hariIni}
      aktif="Beranda"
      pengguna={props.pengguna}
      csrf={props.csrf}
      pesan={props.pesan}
      galat={props.galat}
    >
      <section class="stats-grid">
        <KartuStatistik
          judul="Omzet Hari Ini"
          nilai={rupiah(props.rekap.totalOmzet)}
        />
        {pemilik ? (
          <KartuStatistik
            judul="Laba Kotor"
            nilai={rupiah(props.rekap.totalLaba)}
            kelas="text-success"
          />
        ) : null}
        <KartuStatistik
          judul="Transaksi"
          nilai={`${props.rekap.totalTransaksi} trx`}
        />
        <KartuStatistik
          judul="Kasbon Aktif"
          nilai={rupiah(props.piutang.totalPiutang)}
          kelas="text-warning"
        />
      </section>
      {pemilik ? null : (
        <p class="catatan">
          Modal dan laba hanya tampil untuk peran Pemilik.
        </p>
      )}

      <div class="card">
        <div class="card-title">
          <span>Catat Transaksi Pulsa, Data, dan Token</span>
        </div>
        <form method="post" action="/api/transaksi">
          <CsrfInput token={props.csrf} />
          <input type="hidden" name="form_asal" value="transaksi" />
          <div class="form-group">
            <label for="nomor_tujuan">Nomor HP / ID Pelanggan PLN</label>
            <input
              type="tel"
              id="nomor_tujuan"
              name="nomor_tujuan"
              inputmode="numeric"
              pattern="[0-9]{10,13}"
              maxlength={13}
              value={nilai("nomor_tujuan")}
              placeholder="081234567890"
              required
              data-deteksi-operator
              data-target="operator"
            />
          </div>

          <div class="form-group">
            <label for="operator">Operator Terdeteksi</label>
            <input
              type="text"
              id="operator"
              class="readonly"
              placeholder="Terisi otomatis"
              readonly
            />
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="jenis">Jenis Transaksi</label>
              <select id="jenis" name="jenis" required>
                <option value="pulsa" selected={nilai("jenis") === "pulsa"}>
                  Pulsa Reguler
                </option>
                <option value="data" selected={nilai("jenis") === "data"}>
                  Paket Data
                </option>
                <option value="token" selected={nilai("jenis") === "token"}>
                  Token Listrik PLN
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="metode_bayar">Metode Bayar</label>
              <select
                id="metode_bayar"
                name="metode_bayar"
                required
                data-kasbon-pemicu
              >
                <option value="tunai" selected={metodeTransaksi === "tunai"}>
                  Tunai
                </option>
                <option value="qris" selected={metodeTransaksi === "qris"}>
                  QRIS Toko
                </option>
                <option value="kasbon" selected={metodeTransaksi === "kasbon"}>
                  Kasbon (Hutang)
                </option>
              </select>
            </div>
          </div>

          <FormKasbon
            tempoBawaan={props.tempoBawaan}
            awalanId="trx"
            tampil={metodeTransaksi === "kasbon"}
            nama={nilai("nama_pelanggan")}
            kontak={nilai("kontak")}
            tempo={nilai("tanggal_tempo")}
          />

          <div class="grid-2">
            <div class="form-group">
              <label for="harga_modal">Harga Modal (Rp)</label>
              <input
                type="number"
                id="harga_modal"
                name="harga_modal"
                min="0"
                step="1"
                value={nilai("harga_modal")}
                placeholder="10500"
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
                value={nilai("harga_jual")}
                placeholder="12000"
                required
              />
            </div>
          </div>

          <button type="submit" class="btn">
            Simpan Transaksi
          </button>
        </form>
      </div>

      <div class="card">
        <div class="card-title">
          <span>Jual Voucher Fisik</span>
          <span class="subjudul">Harga diambil dari master voucher</span>
        </div>
        <form method="post" action="/api/transaksi">
          <CsrfInput token={props.csrf} />
          <input type="hidden" name="form_asal" value="voucher" />
          <input type="hidden" name="jenis" value="voucher" />

          <div class="form-group">
            <label for="voucher_id">Voucher</label>
            <select id="voucher_id" name="voucher_id" required>
              <option value="">-- pilih voucher --</option>
              {props.vouchers.map((v) => (
                <option
                  value={v.id}
                  disabled={v.stok === 0}
                  selected={nilaiVoucher("voucher_id") === String(v.id)}
                >
                  {`${v.namaPaket} — ${v.operator} — ${v.stok} pcs — ${rupiah(v.hargaJual)}`}
                </option>
              ))}
            </select>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label for="jumlah_voucher">Jumlah (pcs)</label>
              <input
                type="number"
                id="jumlah_voucher"
                name="jumlah"
                min="1"
                step="1"
                value={nilaiVoucher("jumlah") || "1"}
                required
              />
            </div>
            <div class="form-group">
              <label for="metode_voucher">Metode Bayar</label>
              <select
                id="metode_voucher"
                name="metode_bayar"
                required
                data-kasbon-pemicu
              >
                <option value="tunai" selected={metodeVoucher === "tunai"}>
                  Tunai
                </option>
                <option value="qris" selected={metodeVoucher === "qris"}>
                  QRIS Toko
                </option>
                <option value="kasbon" selected={metodeVoucher === "kasbon"}>
                  Kasbon (Hutang)
                </option>
              </select>
            </div>
          </div>

          <FormKasbon
            tempoBawaan={props.tempoBawaan}
            awalanId="vcr"
            tampil={metodeVoucher === "kasbon"}
            nama={nilaiVoucher("nama_pelanggan")}
            kontak={nilaiVoucher("kontak")}
            tempo={nilaiVoucher("tanggal_tempo")}
          />

          <button type="submit" class="btn">
            Jual Voucher
          </button>
        </form>
      </div>

      <TabelVoucher vouchers={props.vouchers} />
      <TabelKasbon
        kasbon={props.kasbon}
        csrf={props.csrf}
        hariIni={props.hariIni}
      />
      <TabelTransaksi transaksi={props.transaksi} />
    </Layout>
  );

  return renderHalaman(isi);
}
