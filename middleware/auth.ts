import { type Context, type Next, Status } from "../deps/oak.ts";

export default async (ctx: Context, next: Next) => {
  const authenticated = await ctx.cookies.get("authenticated");
  if (!authenticated) {
    ctx.throw(Status.Forbidden);
  }
  await next();
};
