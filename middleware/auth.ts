import { Context, Next, Status } from "oak";

export default async (ctx: Context, next: Next) => {
  const authenticated = await ctx.cookies.get("authenticated");
  if (!authenticated) {
    ctx.throw(Status.Forbidden);
  }
  await next();
};
