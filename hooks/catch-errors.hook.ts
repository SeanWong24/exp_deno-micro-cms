import { HookTarget, HttpContext, HttpError } from "../deps/alosaur.ts";
import { Status } from "../deps/std/http.ts";
import { CustomError } from "../utils/errors.ts";

export class CatchErrorsHook implements HookTarget<unknown, unknown> {
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
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof CustomError) {
      throw new HttpError(error.httpCode, error.message);
    }
    if (error instanceof Error && error.message) {
      throw new HttpError(Status.InternalServerError, error.message);
    }
  }
}
