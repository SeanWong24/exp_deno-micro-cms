import { Router } from "oak";
import { errors } from "$oak/deps.ts";
import config from "./service/config.ts";
import authRouter from "./api/auth.ts";
import infoRouter from "./api/info.ts";
import blobRouter from "./api/blob.ts";

const apiRouter = new Router({ prefix: '/api' });
apiRouter.use("/auth", authRouter.routes(), authRouter.allowedMethods())
  .use("/info", infoRouter.routes(), infoRouter.allowedMethods())
  .use("/blob", blobRouter.routes(), blobRouter.allowedMethods())

const staticRouter = new Router();
if (config.ADMIN_UI) {
  const [filePath, indexPath, fallbackPath] = config.ADMIN_UI.split(',');
  staticRouter.get(
    '/admin(/.*)?',
    async ctx => {
      try {
        await ctx.send({ root: filePath, index: indexPath || void 0, path: ctx.request.url.pathname.substring('/admin'.length) })
      } catch (e) {
        if (e instanceof errors.NotFound) {
          await ctx.send({ root: filePath, path: fallbackPath || void 0 })
        }
      }
    }
  )
}

const router = new Router();

router
  .use(apiRouter.routes())
  .use(staticRouter.routes(), staticRouter.allowedMethods());

export default router;
