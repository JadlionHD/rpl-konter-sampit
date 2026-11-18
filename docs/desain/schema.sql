-- Skema Basis Data — RPL Konter Sampit
-- Jobsheet 6 (Perancangan Basis Data dan Arsitektur Aplikasi)
-- SQLite 3; dipakai oleh bun:sqlite (aplikasi) dan skrip uji tests/cek_skema.ts.
--
-- Catatan: PRAGMA foreign_keys bersifat per koneksi. Baris di bawah diperlukan
-- agar skrip uji menegakkan kunci asing; aplikasi juga mengaktifkannya pada
-- setiap koneksi di src/db/connection.ts.

PRAGMA foreign_keys = ON;

-- 1. Pengguna: autentikasi dan peran (KF-08, UC-05)
CREATE TABLE IF NOT EXISTS pengguna (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL UNIQUE
                        CHECK (
                          length(username) BETWEEN 3 AND 30
                          AND username NOT GLOB '*[^A-Za-z0-9_]*'
                        ),
  password_hash TEXT    NOT NULL,
  peran         TEXT    NOT NULL CHECK (peran IN ('pemilik', 'kasir')),
  aktif         INTEGER NOT NULL DEFAULT 1 CHECK (aktif IN (0, 1))
);

-- 2. Voucher fisik: inventaris dan harga (KF-03, KF-04, KF-09, KF-10)
CREATE TABLE IF NOT EXISTS vouchers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nama_paket      TEXT    NOT NULL CHECK (length(trim(nama_paket)) > 0),
  operator        TEXT    NOT NULL CHECK (length(trim(operator)) > 0),
  stok            INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
  harga_modal     INTEGER NOT NULL CHECK (harga_modal >= 0),
  harga_jual      INTEGER NOT NULL CHECK (harga_jual >= harga_modal),
  tanggal_expired TEXT    NOT NULL
                          CHECK (
                            tanggal_expired GLOB
                              '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                            AND tanggal_expired IS date(tanggal_expired)
                          ),
  UNIQUE (operator, nama_paket)
);

-- 3. Voucher masuk: ledger penambahan stok (KF-10, Jobsheet 10)
CREATE TABLE IF NOT EXISTS voucher_masuk (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  voucher_id INTEGER NOT NULL REFERENCES vouchers(id),
  jumlah     INTEGER NOT NULL CHECK (jumlah > 0),
  tanggal    TEXT    NOT NULL
                     CHECK (
                       tanggal GLOB
                         '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                       AND tanggal IS date(tanggal)
                     ),
  pengguna_id INTEGER REFERENCES pengguna(id)
);

-- 4. Pelanggan kasbon (KF-06). Dipisah agar nama/kontak tidak berulang.
CREATE TABLE IF NOT EXISTS pelanggan (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  nama   TEXT NOT NULL CHECK (length(trim(nama)) > 0),
  kontak TEXT,
  UNIQUE (nama, kontak)
);

-- 5. Transaksi: satu baris = satu item terjual (KF-01, KF-02, KF-03, KF-06)
--    laba dan status bayar TIDAK disimpan karena merupakan nilai turunan.
CREATE TABLE IF NOT EXISTS transactions (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  waktu        TEXT    NOT NULL
                       CHECK (
                         waktu GLOB
                           '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]'
                         AND waktu IS datetime(waktu)
                       ),
  jenis        TEXT    NOT NULL
                       CHECK (jenis IN ('pulsa', 'data', 'token', 'voucher')),
  nomor_tujuan TEXT,
  operator     TEXT,
  voucher_id   INTEGER REFERENCES vouchers(id),
  jumlah       INTEGER NOT NULL DEFAULT 1 CHECK (jumlah > 0),
  harga_modal  INTEGER NOT NULL CHECK (harga_modal >= 0),
  harga_jual   INTEGER NOT NULL CHECK (harga_jual >= harga_modal),
  metode_bayar TEXT    NOT NULL
                       CHECK (metode_bayar IN ('tunai', 'qris', 'kasbon')),
  pengguna_id  INTEGER REFERENCES pengguna(id),

  -- Nomor/operator hanya untuk transaksi non-voucher; voucher memakai voucher_id.
  CHECK (
    (
      jenis = 'voucher'
      AND voucher_id IS NOT NULL
      AND nomor_tujuan IS NULL
      AND operator IS NULL
    )
    OR
    (
      jenis <> 'voucher'
      AND voucher_id IS NULL
      AND nomor_tujuan IS NOT NULL
      AND operator IS NOT NULL
    )
  ),

  -- Satu transaksi pulsa/data/token selalu berjumlah satu item.
  CHECK (jenis = 'voucher' OR jumlah = 1),

  -- Nomor tujuan hanya digit, 10-13 karakter (nomor HP / ID pelanggan PLN).
  CHECK (
    nomor_tujuan IS NULL
    OR (
      nomor_tujuan NOT GLOB '*[^0-9]*'
      AND length(nomor_tujuan) BETWEEN 10 AND 13
    )
  )
);

-- 6. Kasbon: relasi 1:1 dengan transaksi bermetode bayar 'kasbon' (KF-06, KF-07)
CREATE TABLE IF NOT EXISTS debts (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL UNIQUE REFERENCES transactions(id),
  pelanggan_id   INTEGER NOT NULL REFERENCES pelanggan(id),
  tanggal_tempo  TEXT    NOT NULL
                         CHECK (
                           tanggal_tempo GLOB
                             '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                           AND tanggal_tempo IS date(tanggal_tempo)
                         ),
  status         TEXT    NOT NULL DEFAULT 'belum_lunas'
                         CHECK (status IN ('belum_lunas', 'lunas')),
  tanggal_lunas  TEXT    CHECK (
                           tanggal_lunas IS NULL
                           OR (
                             tanggal_lunas GLOB
                               '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'
                             AND tanggal_lunas IS date(tanggal_lunas)
                           )
                         ),

  -- status dan tanggal_lunas tidak boleh saling bertentangan.
  CHECK (
    (status = 'belum_lunas' AND tanggal_lunas IS NULL)
    OR (status = 'lunas' AND tanggal_lunas IS NOT NULL)
  )
);

-- Indeks untuk query harian, status kasbon, dan peringatan kedaluwarsa.
CREATE INDEX IF NOT EXISTS idx_transactions_waktu
  ON transactions (waktu);
CREATE INDEX IF NOT EXISTS idx_transactions_voucher
  ON transactions (voucher_id);
CREATE INDEX IF NOT EXISTS idx_debts_status
  ON debts (status);
CREATE INDEX IF NOT EXISTS idx_vouchers_expired
  ON vouchers (tanggal_expired);
CREATE INDEX IF NOT EXISTS idx_voucher_masuk_voucher
  ON voucher_masuk (voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_masuk_tanggal
  ON voucher_masuk (tanggal);
