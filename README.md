# YASS
Yet another session storage is a full strongly typed session storage for Fetch API in Deno.

This library is fairly barebones atm but is being used in production.

### Example Usage

```ts
// in fresh project _middleware.ts
import { createFreshMiddleware, createJWTContainer } from "https://deno.land/x/yass/mod.ts"
import { ZodIssue } from "zod";

export type Schema = {
  errors: ZodIssue[]
  partial: Record<string, any>
  success: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }
}

const container = createJWTContainer<"data", Schema>("data", Deno.env.get("MY_JWT_SIGNING_SECRET"))

export const handler = createFreshMiddleware(container)
```

```ts
// in fresh route file
import { Context } from "https://deno.land/x/yass/mod.ts";
type PageData = {
  fullName: string;
  email: string;
  phone: string;
};

export const handler: Handlers<PageData, Context<Schema>> = {
  GET: (req, ctx) => {
    const success = ctx.state.session.get("success");
    if (!success) {
      return new Response(null, {
        headers: { Location: "/contact" },
        status: 302,
      });
    }
    return ctx.render({
      fullName: success.firstName,
      email: success.email,
      phone: success.phone,
    });
  },
};

```
