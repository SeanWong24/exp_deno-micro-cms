import { Router, Status } from "oak";
import config from "../service/config.ts";
import authMiddleware from "../middleware/auth.ts";
import { getOriginalHostWithoutPort } from "../service/utils.ts";

const router = new Router();

router
  .get("/", authMiddleware, (ctx) => {
    ctx.response.body = true;
  })
  .post("/sign-in", (ctx) => {
    const domain = getOriginalHostWithoutPort(ctx.request);
    const passcode = ctx.request.url.searchParams.get("passcode");
    if (passcode != config.PASSCODE) {
      ctx.throw(Status.Forbidden);
    }
    ctx.cookies.set("authenticated", "1", {
      domain,
      path: "/",
      httpOnly: true,
      sameSite: config.CORS ? "none" : "lax",
    });
    ctx.response.body = "Signed in.";
  })
  .post("/sign-out", (ctx) => {
    const domain = getOriginalHostWithoutPort(ctx.request);
    ctx.cookies.delete("authenticated", {
      domain,
      path: "/",
      httpOnly: true,
      sameSite: config.CORS ? "none" : "lax",
    });
    ctx.response.body = "Signed out.";
  });

export default router;
