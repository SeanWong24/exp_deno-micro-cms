import { Context, Status } from "oak";

export default async (ctx: Context) => {
  const authenticated = await ctx.cookies.get("authenticated");
  if (!authenticated) {
    ctx.throw(Status.Forbidden);
  }
};
