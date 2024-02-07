import { Router } from "oak";
import {
  getInfo,
  createInfo,
  updateInfo,
  deleteInfo,
} from "../service/info.ts";
import { ResponseBody } from "https://deno.land/x/oak@v12.6.2/response.ts";

const router = new Router();

router
  .get("/:key", async (ctx) => {
    ctx.response.body = (await getInfo(ctx.params.key)) as ResponseBody;
  })
  .post("/:key", async (ctx) => {
    ctx.response.body = (await createInfo(
      ctx.params.key,
      await ctx.request.body({ type: "json" }).value
    )) as ResponseBody;
  })
  .put("/:key", async (ctx) => {
    ctx.response.body = (await updateInfo(
      ctx.params.key,
      await ctx.request.body({ type: "json" }).value
    )) as ResponseBody;
  })
  .delete("/:key", async (ctx) => {
    await deleteInfo(ctx.params.key);
    ctx.response.body = "Done";
  });

export default router;
