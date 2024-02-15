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
 * @openapi
 * tags:
 *  name: Info
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
   *    security:
   *      - cookieAuth: []
   *    description: Create info with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *    responses:
   *      200:
   *        description: Done.
   */
  .post("/:key", authMiddleware, async (ctx) => {
    await createInfo(
      ctx.params.key,
      await ctx.request.body().value,
    );
    ctx.response.body = "Done";
  })
  /**
   * @openapi
   * /info/{key}:
   *  put:
   *    tags:
   *      - Info
   *    security:
   *      - cookieAuth: []
   *    description: Update info with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    requestBody:
   *      required: true
   *    responses:
   *      200:
   *        description: Done.
   */
  .put("/:key", authMiddleware, async (ctx) => {
    await updateInfo(
      ctx.params.key,
      await ctx.request.body().value,
    );
    ctx.response.body = "Done";
  })
  /**
   * @openapi
   * /info/{key}:
   *  delete:
   *    tags:
   *      - Info
   *    security:
   *      - cookieAuth: []
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
