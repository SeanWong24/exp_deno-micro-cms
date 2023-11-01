import { HookTarget, HttpContext, HttpError } from "../deps/alosaur.ts";
import { Status } from "../deps/std/http.ts";
import { DBNotInitializedError, InvalidDBKeyError } from "./errors.ts";

export class CatchErrors implements HookTarget<unknown, unknown> {
  /**
   *  this hook run before controller action
   */
  onPreAction(_context: HttpContext<unknown>, _payload: unknown) {
  }

  /**
   * this hook run after successful run action
   */
  onPostAction(_context: HttpContext<unknown>, _payload: unknown) {
    // you can filtered response result here
  }

  /**
   * this hook run only throw exception in controller action
   */
  onCatchAction(context: HttpContext<unknown>, _payload: unknown) {
    const error = context.response.error;
    if (error instanceof InvalidDBKeyError) {
      throw new HttpError(Status.BadRequest, "Invalid DB key.");
    }
    if (error instanceof DBNotInitializedError) {
      throw new HttpError(Status.InternalServerError, "DB not initialized.");
    }
    if (error instanceof Error && error.message) {
      throw new HttpError(Status.InternalServerError, error.message);
    }
  }
}
