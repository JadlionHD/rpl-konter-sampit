import { CsrfInput } from "./komponen.tsx";
import { Layout, renderHalaman } from "./layout.tsx";

export interface PropsLogin {
  galat: string[];
  username: string;
  next: string;
  csrf: string;
}

export function renderLogin(props: PropsLogin): string {
  const aksi = props.next
    ? `/login?next=${encodeURIComponent(props.next)}`
    : "/login";

  const isi = (
    <Layout judul="Masuk — RPL Konter Sampit" tanpaNav>
      <div class="card kartu-sempit">
        <div class="card-title">
          <span>Masuk ke Sistem</span>
        </div>
        <p class="catatan">Gunakan akun Pemilik atau Kasir.</p>

        {props.galat.length > 0 ? (
          <div class="galat" role="alert">
            {props.galat.map((pesan) => (
              <div>{pesan}</div>
            ))}
          </div>
        ) : null}

        <form method="post" action={aksi}>
          <CsrfInput token={props.csrf} />
          <input type="hidden" name="next" value={props.next} />
          <div class="form-group">
            <label for="username">Nama pengguna</label>
            <input
              type="text"
              id="username"
              name="username"
              maxlength={30}
              value={props.username}
              autocomplete="username"
              autofocus
              required
            />
          </div>
          <div class="form-group">
            <label for="password">Kata sandi</label>
            <input
              type="password"
              id="password"
              name="password"
              autocomplete="current-password"
              required
            />
          </div>
          <button type="submit" class="btn">
            Masuk
          </button>
        </form>

        <p class="catatan tengah">
          Tidak ada akun? Hubungi pemilik untuk dibuatkan akun.
        </p>
      </div>
    </Layout>
  );

  return renderHalaman(isi);
}
