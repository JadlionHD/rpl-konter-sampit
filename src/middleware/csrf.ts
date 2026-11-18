import type { MiddlewareHandler } from "hono";
import { tokenCsrf } from "../lib/csrf.ts";
import type { Aplikasi } from "./autentikasi.ts";

/** Memastikan setiap respons memiliki token CSRF dan menyimpannya di context. */
export const pasangCsrf: MiddlewareHandler<Aplikasi> = async (c, next) => {
  const token = await tokenCsrf(c);
  c.set("csrf", token);
  await next();
};
