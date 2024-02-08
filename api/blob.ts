import { Router } from "oak";
import {
  getBlob,
  createBlob,
  updateBlob,
  deleteBlob,
} from "../service/blob.ts";

const router = new Router();

router
  .get("/:key",async (ctx) => {
    const {content, contentType} = await getBlob(ctx.params.key);
    contentType && ctx.response.headers.set('Content-Type', contentType);
    ctx.response.body = content;
  })
  .post("/:key", async (ctx) => {
    await createBlob(
      ctx.params.key,
      ctx.request.body({ type: "stream" }).value,
      ctx.request.headers.get('Content-Type')
    );
    ctx.response.body = "Done";
  })
  .put("/:key", async (ctx) => {
    await updateBlob(
      ctx.params.key,
      ctx.request.body({ type: "stream" }).value,
      ctx.request.headers.get('Content-Type')
    );
    ctx.response.body = "Done";
  })
  .delete("/:key", async (ctx) => {
    await deleteBlob(ctx.params.key);
    ctx.response.body = "Done";
  });

export default router;
