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

function createCookieContainer<Value extends Data, Key extends string>(
  cookieKey: Key,
  cryptoKey: CryptoKey,
  verifyOptions?: VerifyOptions,
  cookieOptions: CookieOptions = {}
) {
  async function fromHeaders(headers: Headers) {
    const cookies = getCookies(headers);
    const jwt = cookies[cookieKey];
    const payload = await verify(jwt, cryptoKey, verifyOptions);
    const data: Partial<Value> = payload["data"] ?? {};
    const flashData: Partial<Value> = payload["__flash"] ?? {};
    return createSession(data, flashData);
  }

  async function toHeaders(headers: Headers, session: Session<Value>) {
    const value = await create(
      { alg: "HS512", typ: "JWT" },
      session.serlialize(),
      cryptoKey
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
