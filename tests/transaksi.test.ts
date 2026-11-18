import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { getDb, tutupDatabase } from "../src/db/connection.ts";
import { tambahHari, tanggalLokalSekarang, waktuLokal } from "../src/lib/waktu.ts";
import { kasbonAktif, ringkasanPiutang } from "../src/models/kasbon.ts";
import {
  daftarTransaksiHari,
  jumlahTransaksi,
  rekapHari,
  simpanTransaksi,
} from "../src/models/transaksi.ts";
import { ambilVoucher } from "../src/models/voucher.ts";
import { siapkanDatabaseUji, tambahVoucherUji } from "./bantuan.ts";
import {
  buatPenggunaUji,
  CookieJar,
  loginUji,
} from "./sesi-bantuan.ts";

const hariIni = tanggalLokalSekarang();
let jar: CookieJar;

beforeEach(async () => {
  siapkanDatabaseUji();
  await buatPenggunaUji("pemilik", "rahasia123", "pemilik");
  jar = new CookieJar();
  await loginUji(jar, "pemilik", "rahasia123");
});

afterEach(() => {
  tutupDatabase();
});

async function kirimForm(
  data: Record<string, string>,
  alamat = "/api/transaksi",
): Promise<Response> {
  return jar.minta(alamat, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...data,
      csrf_token: jar.csrf,
    }).toString(),
    redirect: "manual",
  });
}

function lokasi(response: Response): string {
  return decodeURIComponent(response.headers.get("location") ?? "");
}

describe("beranda", () => {
  it("menampilkan keadaan kosong saat belum ada data", async () => {
    const response = await jar.minta("/");
    expect(response.status).toBe(200);
    const html = await response.text();
    expect(html).toContain("Belum ada transaksi hari ini.");
    expect(html).toContain("Belum ada voucher terdaftar.");
    expect(html).toContain("Tidak ada kasbon aktif.");
  });

  it("menyajikan daftar voucher sebagai JSON", async () => {
    tambahVoucherUji(getDb(), { namaPaket: "Voucher JSON" });
    const response = await jar.minta("/api/vouchers");
    expect(response.status).toBe(200);
    const data = (await response.json()) as { namaPaket: string }[];
    expect(data).toHaveLength(1);
    expect(data[0].namaPaket).toBe("Voucher JSON");
  });
});

describe("transaksi pulsa dan token (KF-01, KF-02)", () => {
  it("menyimpan transaksi pulsa, mendeteksi operator, dan menghitung laba", async () => {
    const response = await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "081234567890",
      harga_modal: "10500",
      harga_jual: "12000",
      metode_bayar: "tunai",
    });

    expect(response.status).toBe(303);
    expect(lokasi(response)).toContain("Transaksi berhasil disimpan");

    expect(rekapHari(hariIni)).toEqual({
      totalOmzet: 12000,
      totalModal: 10500,
      totalLaba: 1500,
      totalTransaksi: 1,
    });

    const [transaksi] = daftarTransaksiHari(hariIni);
    expect(transaksi.operator).toBe("Telkomsel");
    expect(transaksi.nomorTujuan).toBe("081234567890");
    expect(transaksi.statusBayar).toBe("lunas");
  });

  it("menetapkan operator PLN untuk token listrik", async () => {
    await kirimForm({
      jenis: "token",
      nomor_tujuan: "14012345678",
      harga_modal: "20500",
      harga_jual: "23000",
      metode_bayar: "qris",
    });

    const [transaksi] = daftarTransaksiHari(hariIni);
    expect(transaksi.operator).toBe("PLN");
  });

  it("menolak nomor HP yang kurang dari 10 digit", async () => {
    const response = await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "0812",
      harga_modal: "1000",
      harga_jual: "2000",
      metode_bayar: "tunai",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("Nomor HP tidak valid");
    expect(jumlahTransaksi()).toBe(0);
  });

  it("menolak harga jual di bawah harga modal", async () => {
    const response = await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "081234567890",
      harga_modal: "10000",
      harga_jual: "9000",
      metode_bayar: "tunai",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain(
      "Harga jual minimal sama dengan harga modal",
    );
    expect(jumlahTransaksi()).toBe(0);
  });

  it("mempertahankan isian saat validasi gagal", async () => {
    const response = await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "0812",
      harga_modal: "1000",
      harga_jual: "2000",
      metode_bayar: "tunai",
    });
    const html = await response.text();

    expect(response.status).toBe(422);
    expect(html).toContain('value="0812"');
    expect(html).toContain('value="1000"');
    expect(html).toContain('value="2000"');
    expect(html).toContain("Nomor HP tidak valid");
  });
});

describe("penjualan voucher (KF-03, KF-04)", () => {
  it("memotong stok dan memakai harga dari master voucher", async () => {
    const id = tambahVoucherUji(getDb(), {
      namaPaket: "Telkomsel Uji",
      stok: 2,
      hargaModal: 10000,
      hargaJual: 12000,
    });

    const response = await kirimForm({
      jenis: "voucher",
      voucher_id: String(id),
      jumlah: "1",
      metode_bayar: "tunai",
      // Nilai harga dari klien harus diabaikan.
      harga_modal: "1",
      harga_jual: "1",
    });

    expect(response.status).toBe(303);
    expect(ambilVoucher(id)!.stok).toBe(1);

    const [transaksi] = daftarTransaksiHari(hariIni);
    expect(transaksi.hargaJual).toBe(12000);
    expect(transaksi.nomorTujuan).toBeNull();
    expect(transaksi.namaVoucher).toBe("Telkomsel Uji");
  });

  it("menolak voucher dengan stok habis", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 0 });
    const response = await kirimForm({
      jenis: "voucher",
      voucher_id: String(id),
      jumlah: "1",
      metode_bayar: "tunai",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("Stok voucher habis!");
    expect(jumlahTransaksi()).toBe(0);
    expect(ambilVoucher(id)!.stok).toBe(0);
  });

  it("menolak jumlah yang melebihi stok", async () => {
    const id = tambahVoucherUji(getDb(), { stok: 1 });
    const response = await kirimForm({
      jenis: "voucher",
      voucher_id: String(id),
      jumlah: "2",
      metode_bayar: "tunai",
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain("Stok tidak cukup: tersedia 1 pcs.");
    expect(jumlahTransaksi()).toBe(0);
    expect(ambilVoucher(id)!.stok).toBe(1);
  });

  it("membatalkan seluruh perubahan bila penyimpanan kasbon gagal", () => {
    const id = tambahVoucherUji(getDb(), { stok: 5 });

    expect(() =>
      simpanTransaksi(
        {
          waktu: "2026-11-18 10:00:00",
          jenis: "voucher",
          nomorTujuan: null,
          operator: null,
          voucherId: id,
          jumlah: 2,
          hargaModal: 10000,
          hargaJual: 12000,
          metodeBayar: "kasbon",
          penggunaId: null,
        },
        {
          namaPelanggan: "Bu Sari",
          kontak: null,
          tanggalTempo: "2026-02-30", // ditolak CHECK tanggal
        },
      ),
    ).toThrow();

    expect(ambilVoucher(id)!.stok).toBe(5);
    expect(jumlahTransaksi()).toBe(0);
  });
});

describe("kasbon (KF-06, KF-07)", () => {
  it("mencatat kasbon, menampilkan piutang, lalu melunasinya", async () => {
    const response = await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "081399887766",
      harga_modal: "22000",
      harga_jual: "25000",
      metode_bayar: "kasbon",
      nama_pelanggan: "Pak Andi",
      kontak: "081399887766",
      tanggal_tempo: tambahHari(hariIni, 7),
    });

    expect(response.status).toBe(303);

    const aktif = kasbonAktif();
    expect(aktif).toHaveLength(1);
    expect(aktif[0].namaPelanggan).toBe("Pak Andi");
    expect(aktif[0].nominal).toBe(25000);
    expect(ringkasanPiutang()).toEqual({
      totalPiutang: 25000,
      jumlahDebitur: 1,
    });

    const [transaksi] = daftarTransaksiHari(hariIni);
    expect(transaksi.statusBayar).toBe("belum_lunas");

    const pelunasan = await kirimForm({}, "/api/kasbon/1/lunas");
    expect(pelunasan.status).toBe(303);

    const baris = getDb()
      .query("SELECT status, tanggal_lunas FROM debts WHERE id = 1")
      .get() as { status: string; tanggal_lunas: string };
    expect(baris.status).toBe("lunas");
    expect(baris.tanggal_lunas).toBe(hariIni);
    expect(kasbonAktif()).toHaveLength(0);

    const ulang = await kirimForm({}, "/api/kasbon/1/lunas");
    expect(lokasi(ulang)).toContain("Kasbon sudah lunas.");
  });

  it("menandai kasbon yang sudah lewat tempo", async () => {
    simpanTransaksi(
      {
        waktu: waktuLokal(),
        jenis: "pulsa",
        nomorTujuan: "081399887766",
        operator: "Indosat",
        voucherId: null,
        jumlah: 1,
        hargaModal: 22000,
        hargaJual: 25000,
        metodeBayar: "kasbon",
        penggunaId: 1,
      },
      {
        namaPelanggan: "Bu Sari",
        kontak: null,
        tanggalTempo: tambahHari(hariIni, -1),
      },
    );

    const html = await (await jar.minta("/")).text();
    expect(html).toContain("Lewat tempo");
  });

  it("menolak kasbon tanpa nama pelanggan", async () => {
    const response = await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "081399887766",
      harga_modal: "22000",
      harga_jual: "25000",
      metode_bayar: "kasbon",
      nama_pelanggan: "",
      tanggal_tempo: tambahHari(hariIni, 7),
    });

    expect(response.status).toBe(422);
    expect(await response.text()).toContain(
      "Nama pelanggan wajib diisi untuk transaksi kasbon",
    );
    expect(jumlahTransaksi()).toBe(0);
    expect(kasbonAktif()).toHaveLength(0);
  });
});

describe("keamanan dan tampilan", () => {
  it("meng-escape nama pelanggan yang berisi HTML", async () => {
    await kirimForm({
      jenis: "pulsa",
      nomor_tujuan: "081399887766",
      harga_modal: "1000",
      harga_jual: "2000",
      metode_bayar: "kasbon",
      nama_pelanggan: "<script>alert(1)</script>",
      tanggal_tempo: tambahHari(hariIni, 7),
    });

    const html = await (await jar.minta("/")).text();
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  it("memberi label peringatan untuk voucher yang mendekati kedaluwarsa", async () => {
    const db = getDb();
    tambahVoucherUji(db, {
      namaPaket: "Segera Expired",
      stok: 1,
      tanggalExpired: tambahHari(hariIni, 3),
    });
    tambahVoucherUji(db, {
      namaPaket: "Sudah Expired",
      stok: 1,
      tanggalExpired: tambahHari(hariIni, -1),
    });

    const html = await (await jar.minta("/")).text();
    expect(html).toContain("Perhatian: Expired Dalam 3 Hari");
    expect(html).toContain("Kedaluwarsa");
  });
});
