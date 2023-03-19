import { key } from "./key.ts";
import {
  create,
  verify,
  getCookies,
  setCookie,
  VerifyOptions,
  Cookie,
} from "./deps.ts";
import { createSession, Data, Session } from "./main.ts";

type CookieOptions = Omit<Cookie, "name" | "value">;

export interface CookieContainer<T extends Data> {
  fromHeaders: (headers: Headers) => Promise<Session<T>>;
  toHeaders: (headers: Headers, session: Session<T>) => Promise<Headers>;
}

export function createCookieContainer<Key extends string, Value extends Data>(
  cookieKey: Key,
  secret?: string,
  verifyOptions?: VerifyOptions,
  cookieOptions: CookieOptions = {}
) {
  let s = secret;
  if (!s) {
    console.warn("no secret provided, not secret");
    s = "not-secret";
  }

  const k = key(s);

  async function fromHeaders(headers: Headers) {
    const cookies = getCookies(headers);
    const jwt = cookies[cookieKey];
    const payload = await verify(jwt, await k, verifyOptions);
    const data: Partial<Value> = payload["data"] ?? {};
    const flashData: Partial<Value> = payload["__flash"] ?? {};
    return createSession(data, flashData);
  }

  async function toHeaders(headers: Headers, session: Session<Value>) {
    const value = await create(
      { alg: "HS512", typ: "JWT" },
      session.serlialize(),
      await k
    );
    const cookie: Cookie = {
      ...cookieOptions,
      name: cookieKey,
      value,
    };
    return setCookie(headers, cookie);
  }

  return { fromHeaders, toHeaders };
}
