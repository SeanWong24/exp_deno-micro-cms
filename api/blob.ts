import { Router } from "oak";
import {
  getBlob,
  createBlob,
  updateBlob,
  deleteBlob,
} from "../service/blob.ts";

const router = new Router();

router
  .get("/:key", async (ctx) => {
    ctx.response.body = await getBlob(ctx.params.key);
  })
  .post("/:key", async (ctx) => {
    await createBlob(
      ctx.params.key,
      ctx.request.body({ type: "stream" }).value
    );
    ctx.response.body = "Done";
  })
  .put("/:key", async (ctx) => {
    await updateBlob(
      ctx.params.key,
      ctx.request.body({ type: "stream" }).value
    );
    ctx.response.body = "Done";
  })
  .delete("/:key", async (ctx) => {
    await deleteBlob(ctx.params.key);
    ctx.response.body = "Done";
  });

export default router;
