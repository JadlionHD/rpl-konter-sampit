import { Hono } from "hono";
import { bacaFormCsrf } from "../lib/csrf.ts";
import { tanggalLokalSekarang } from "../lib/waktu.ts";
import { wajibPeran } from "../middleware/autentikasi.ts";
import type { Aplikasi } from "../middleware/autentikasi.ts";
import { ambilVoucher, semuaVoucher } from "../models/voucher.ts";
import type { Voucher } from "../models/voucher.ts";
import { bilangan } from "../services/validasi.ts";
import {
  daftarVoucherTampil,
  hapusVoucherAman,
  perbaruiVoucher,
  simpanVoucherBaru,
} from "../services/voucher.ts";
import { render403 } from "../views/403.tsx";
import {
  renderDaftarVoucher,
  renderFormVoucher,
} from "../views/voucher.tsx";

export const ruteVoucher = new Hono<Aplikasi>();

const PESAN_CSRF =
  "Sesi form kedaluwarsa. Muat ulang halaman lalu coba lagi.";

function isianDari(voucher: Voucher): Record<string, string> {
  return {
    nama_paket: voucher.namaPaket,
    operator: voucher.operator,
    stok: String(voucher.stok),
    harga_modal: String(voucher.hargaModal),
    harga_jual: String(voucher.hargaJual),
    tanggal_expired: voucher.tanggalExpired,
  };
}

function idDari(nilai: string): number | null {
  const id = bilangan(nilai);
  return id !== null && id > 0 ? id : null;
}

ruteVoucher.get("/voucher", (c) => {
  const pengguna = c.get("pengguna")!;
  return c.html(
    renderDaftarVoucher({
      hariIni: tanggalLokalSekarang(),
      vouchers: daftarVoucherTampil(),
      pengguna,
      bolehUbah: pengguna.peran === "pemilik",
      csrf: c.get("csrf"),
      pesan: c.req.query("pesan"),
      galat: c.req.query("galat"),
    }),
  );
});

ruteVoucher.get("/voucher/tambah", wajibPeran("pemilik"), (c) =>
  c.html(
    renderFormVoucher({
      hariIni: tanggalLokalSekarang(),
      mode: "tambah",
      isian: { stok: "0" },
      galat: [],
      pengguna: c.get("pengguna")!,
      csrf: c.get("csrf"),
    }),
  ),
);

ruteVoucher.post(
  "/voucher/tambah",
  wajibPeran("pemilik"),
  async (c) => {
    const { form, valid } = await bacaFormCsrf(c);

    if (!valid) {
      return c.html(
        renderFormVoucher({
          hariIni: tanggalLokalSekarang(),
          mode: "tambah",
          isian: form,
          galat: [PESAN_CSRF],
          pengguna: c.get("pengguna")!,
          csrf: c.get("csrf"),
        }),
        403,
      );
    }

    const hasil = simpanVoucherBaru(form);
    if (!hasil.ok) {
      return c.html(
        renderFormVoucher({
          hariIni: tanggalLokalSekarang(),
          mode: "tambah",
          isian: form,
          galat: hasil.galat,
          pengguna: c.get("pengguna")!,
          csrf: c.get("csrf"),
        }),
        422,
      );
    }

    return c.redirect(
      `/voucher?pesan=${encodeURIComponent("Voucher berhasil ditambahkan.")}`,
      303,
    );
  },
);

ruteVoucher.get(
  "/voucher/:id/ubah",
  wajibPeran("pemilik"),
  (c) => {
    const id = idDari(c.req.param("id"));
    if (id === null) return c.notFound();

    const voucher = ambilVoucher(id);
    if (!voucher) return c.notFound();

    return c.html(
      renderFormVoucher({
        hariIni: tanggalLokalSekarang(),
        mode: "ubah",
        id,
        isian: isianDari(voucher),
        galat: [],
        pengguna: c.get("pengguna")!,
        csrf: c.get("csrf"),
      }),
    );
  },
);

ruteVoucher.post(
  "/voucher/:id/ubah",
  wajibPeran("pemilik"),
  async (c) => {
    const id = idDari(c.req.param("id"));
    if (id === null) return c.notFound();

    const voucher = ambilVoucher(id);
    if (!voucher) return c.notFound();

    const { form, valid } = await bacaFormCsrf(c);

    if (!valid) {
      return c.html(
        renderFormVoucher({
          hariIni: tanggalLokalSekarang(),
          mode: "ubah",
          id,
          isian: { ...isianDari(voucher), ...form },
          galat: [PESAN_CSRF],
          pengguna: c.get("pengguna")!,
          csrf: c.get("csrf"),
        }),
        403,
      );
    }

    const hasil = perbaruiVoucher(id, form);
    if (!hasil.ok) {
      const isian = { ...isianDari(voucher), ...form };
      return c.html(
        renderFormVoucher({
          hariIni: tanggalLokalSekarang(),
          mode: "ubah",
          id,
          isian,
          galat: hasil.galat,
          pengguna: c.get("pengguna")!,
          csrf: c.get("csrf"),
        }),
        422,
      );
    }

    return c.redirect(
      `/voucher?pesan=${encodeURIComponent("Voucher berhasil diubah.")}`,
      303,
    );
  },
);

ruteVoucher.post(
  "/voucher/:id/hapus",
  wajibPeran("pemilik"),
  async (c) => {
    const id = idDari(c.req.param("id"));
    if (id === null) return c.notFound();

    if (!ambilVoucher(id)) return c.notFound();

    const { valid } = await bacaFormCsrf(c);
    if (!valid) {
      return c.html(
        render403({
          pengguna: c.get("pengguna")!,
          csrf: c.get("csrf"),
          pesan: PESAN_CSRF,
        }),
        403,
      );
    }

    const hasil = hapusVoucherAman(id);
    if (!hasil.ok) {
      return c.redirect(
        `/voucher?galat=${encodeURIComponent(hasil.galat.join(" "))}`,
        303,
      );
    }

    return c.redirect(
      `/voucher?pesan=${encodeURIComponent("Voucher berhasil dihapus.")}`,
      303,
    );
  },
);

ruteVoucher.get("/api/vouchers", (c) => c.json(semuaVoucher()));
