/**
 * Menyiapkan basis data demo: akun pemilik/kasir dan beberapa transaksi.
 * Jalankan hanya untuk demo/pengembangan:
 *   DEMO_PEMILIK_PASSWORD=... DEMO_KASIR_PASSWORD=... bun run demo:siapkan
 * Kata sandi tidak disimpan di kode.
 */
import { inisialisasiDatabase, tutupDatabase } from "../src/db/connection.ts";
import { terapkanSkema } from "../src/db/schema.ts";
import { isiDataContoh } from "../src/db/seed.ts";
import { cariPengguna } from "../src/models/pengguna.ts";
import type { Peran } from "../src/models/pengguna.ts";
import { semuaVoucher } from "../src/models/voucher.ts";
import { jumlahTransaksi, simpanTransaksi } from "../src/models/transaksi.ts";
import { buatPengguna } from "../src/services/autentikasi.ts";
import {
  tambahHari,
  tanggalLokalSekarang,
  waktuLokal,
} from "../src/lib/waktu.ts";

const db = inisialisasiDatabase(process.env.KONTER_DB ?? "demo.sqlite");
terapkanSkema(db);
isiDataContoh(db);

const sandiPemilik = process.env.DEMO_PEMILIK_PASSWORD;
const sandiKasir = process.env.DEMO_KASIR_PASSWORD;
if (!sandiPemilik || !sandiKasir) {
  console.error(
    "Isi DEMO_PEMILIK_PASSWORD dan DEMO_KASIR_PASSWORD (minimal 8 karakter).",
  );
  tutupDatabase();
  process.exit(1);
}

async function pastikanPengguna(
  username: string,
  password: string,
  peran: Peran,
): Promise<number> {
  const ada = cariPengguna(username);
  if (ada) return ada.id;

  const hasil = await buatPengguna(username, password, peran);
  if (!hasil.ok) throw new Error(hasil.galat.join(" "));
  const dibuat = cariPengguna(username);
  if (!dibuat) throw new Error(`Pengguna ${username} gagal dibuat.`);
  return dibuat.id;
}

const idPemilik = await pastikanPengguna(
  "pemilik",
  sandiPemilik,
  "pemilik",
);
const idKasir = await pastikanPengguna("kasir", sandiKasir, "kasir");

if (jumlahTransaksi() === 0) {
  const vouchers = semuaVoucher();
  const voucher = vouchers[0];
  if (!voucher) throw new Error("Tidak ada voucher untuk data demo.");

  simpanTransaksi(
    {
      waktu: waktuLokal(),
      jenis: "pulsa",
      nomorTujuan: "081234567890",
      operator: "Telkomsel",
      voucherId: null,
      jumlah: 1,
      hargaModal: 10500,
      hargaJual: 12000,
      metodeBayar: "tunai",
      penggunaId: idKasir,
    },
    null,
  );

  simpanTransaksi(
    {
      waktu: waktuLokal(),
      jenis: "data",
      nomorTujuan: "081399887766",
      operator: "Indosat",
      voucherId: null,
      jumlah: 1,
      hargaModal: 22000,
      hargaJual: 25000,
      metodeBayar: "kasbon",
      penggunaId: idKasir,
    },
    {
      namaPelanggan: "Pak Andi",
      kontak: "081399887766",
      tanggalTempo: tambahHari(tanggalLokalSekarang(), 7),
    },
  );

  simpanTransaksi(
    {
      waktu: waktuLokal(),
      jenis: "voucher",
      nomorTujuan: null,
      operator: null,
      voucherId: voucher.id,
      jumlah: 1,
      hargaModal: voucher.hargaModal,
      hargaJual: voucher.hargaJual,
      metodeBayar: "qris",
      penggunaId: idKasir,
    },
    null,
  );

  simpanTransaksi(
    {
      waktu: waktuLokal(),
      jenis: "token",
      nomorTujuan: "14012345678",
      operator: "PLN",
      voucherId: null,
      jumlah: 1,
      hargaModal: 20500,
      hargaJual: 23000,
      metodeBayar: "tunai",
      penggunaId: idPemilik,
    },
    null,
  );
}

console.log("Data demo siap. Jalankan aplikasi dengan KONTER_DB=demo.sqlite.");
tutupDatabase();
