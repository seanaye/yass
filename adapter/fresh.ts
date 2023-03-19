import { type CookieContainer } from "../cookie.ts";
import { type Session, type Data, createSession } from "../main.ts";
import { MiddlewareHandler } from "../deps.ts";

export function createFreshCookieMiddleware<T extends Data>(
  container: CookieContainer<T>
): MiddlewareHandler<{ session: Session<T> }> {
  return async function (req, ctx) {
    try {
      const session = await container.fromHeaders(req.headers);
      ctx.state.session = session;
    } catch {
      ctx.state.session = createSession({}, {});
    }

    const response = await ctx.next();

    await container.toHeaders(response.headers, ctx.state.session);
    return response;
  };
}

export type Context<T extends Data> = { session: Session<T> }

