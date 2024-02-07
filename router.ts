import { Router } from "oak";
import infoRouter from "./api/info.ts";
import blobRouter from "./api/blob.ts";

const router = new Router();

router
  .use("/api/info", infoRouter.routes(), infoRouter.allowedMethods())
  .use("/api/blob", blobRouter.routes(), blobRouter.allowedMethods())
  .get("/(.*)", (ctx) => {
    ctx.response.body = "Woo";
  });

export default router;
