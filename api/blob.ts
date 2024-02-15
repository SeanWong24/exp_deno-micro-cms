import { Router } from "oak";
import authMiddleware from "../middleware/auth.ts";
import {
  createBlob,
  deleteBlob,
  getBlob,
  updateBlob,
} from "../service/blob.ts";

const router = new Router();

/**
 * @openapi
 * tags:
 *  name: Blob
 */

router
  /**
   * @openapi
   * /blob/{key}:
   *  get:
   *    tags:
   *      - Blob
   *    description: Get a blob with a key.
   *    parameters:
   *      - name: key
   *        in: path
   *        required: true
   *        schema:
   *          type: string
   *    responses:
   *      200:
   *        description: The requested blob.
   */
  .get("/:key", async (ctx) => {
    const { content, contentType } = await getBlob(ctx.params.key) ?? {};
    contentType && ctx.response.headers.set("Content-Type", contentType);
    ctx.response.body = content;
  })
  /**
   * @openapi
   * /blob/{key}:
   *  post:
   *    tags:
   *      - Blob
   *    security:
   *      - cookieAuth: []
   *    description: Create a blob with a key.
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
   *      500:
   *        description: Failed.
   */
  .post("/:key", authMiddleware, async (ctx) => {
    await createBlob(
      ctx.params.key,
      ctx.request.body({ type: "stream" }).value,
      ctx.request.headers.get("Content-Type"),
    );
    ctx.response.body = "Done";
  })
  /**
   * @openapi
   * /blob/{key}:
   *  put:
   *    tags:
   *      - Blob
   *    security:
   *      - cookieAuth: []
   *    description: Update a blob with a key.
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
   *      500:
   *        description: Failed.
   */
  .put("/:key", authMiddleware, async (ctx) => {
    await updateBlob(
      ctx.params.key,
      ctx.request.body({ type: "stream" }).value,
      ctx.request.headers.get("Content-Type"),
    );
    ctx.response.body = "Done";
  })
  /**
   * @openapi
   * /blob/{key}:
   *  delete:
   *    tags:
   *      - Blob
   *    security:
   *      - cookieAuth: []
   *    description: Delete a blob with a key.
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
    await deleteBlob(ctx.params.key);
    ctx.response.body = "Done";
  });

export default router;
