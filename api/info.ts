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

/**
 * @swagger
 * tags:
 *   name: Info
 */

router
  /**
   * @openapi
   * /info/{key}:
   *  get:
   *    tags:
   *      - Info
   *    description: Get info with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: The requested info.
   *      500:
   *        description: Failed to get.
   */
  .get("/:key", async (ctx) => {
    ctx.response.body = (await getInfo(ctx.params.key)) as ResponseBody;
  })
  /**
   * @openapi
   * /info/{key}:
   *  post:
   *    tags:
   *      - Info
   *    description: Create info with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Done.
   *      500:
   *        description: Failed.
   */
  .post("/:key", authMiddleware, async (ctx) => {
    ctx.response.body = (await createInfo(
      ctx.params.key,
      await ctx.request.body().value,
    )) as ResponseBody;
  })
  /**
   * @openapi
   * /info/{key}:
   *  put:
   *    tags:
   *      - Info
   *    description: Update info with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Done.
   *      500:
   *        description: Failed.
   */
  .put("/:key", authMiddleware, async (ctx) => {
    ctx.response.body = (await updateInfo(
      ctx.params.key,
      await ctx.request.body().value,
    )) as ResponseBody;
  })
  /**
   * @openapi
   * /info/{key}:
   *  delete:
   *    tags:
   *      - Info
   *    description: Delete info with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: Done.
   */
  .delete("/:key", authMiddleware, async (ctx) => {
    await deleteInfo(ctx.params.key);
    ctx.response.body = "Done";
  });

export default router;
