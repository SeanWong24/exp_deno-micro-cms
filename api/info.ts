import { Router } from "oak";
import authMiddleware from "../middleware/auth.ts";
import {
  createInfo,
  deleteInfo,
  getInfo,
  updateInfo,
} from "../service/info.ts";
import { ResponseBody } from "https://deno.land/x/oak@v12.6.2/response.ts";

const router = new Router();

router
  .get("/:key", async (ctx) => {
    ctx.response.body = (await getInfo(ctx.params.key)) as ResponseBody;
  })
  .post("/:key", authMiddleware, async (ctx) => {
    ctx.response.body = (await createInfo(
      ctx.params.key,
      await ctx.request.body().value,
    )) as ResponseBody;
  })
  .put("/:key", authMiddleware, async (ctx) => {
    ctx.response.body = (await updateInfo(
      ctx.params.key,
      await ctx.request.body().value,
    )) as ResponseBody;
  })
  .delete("/:key", authMiddleware, async (ctx) => {
    await deleteInfo(ctx.params.key);
    ctx.response.body = "Done";
  });

export default router;
