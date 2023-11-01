import { HookTarget, HttpContext, HttpError } from "../deps/alosaur.ts";
import { Status } from "../deps/std/http.ts";
import {
  DBEntityAlreadyExisted,
  DBEntityNotAsObject,
  DBEntityNotExisted,
  DBNotInitializedError,
  InvalidDBKeyError,
} from "./errors.ts";

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
    if (error instanceof InvalidDBKeyError) {
      throw new HttpError(
        Status.BadRequest,
        error.message || "The DB key is invalid.",
      );
    }
    if (error instanceof DBNotInitializedError) {
      throw new HttpError(
        Status.InternalServerError,
        error.message || "The DB has not been initialized.",
      );
    }
    if (error instanceof DBEntityAlreadyExisted) {
      throw new HttpError(
        Status.InternalServerError,
        error.message || "The DB entity is already existed.",
      );
    }
    if (error instanceof DBEntityNotExisted) {
      throw new HttpError(
        Status.InternalServerError,
        error.message || "The DB entity is not existed.",
      );
    }
    if (error instanceof DBEntityNotAsObject) {
      throw new HttpError(
        Status.InternalServerError,
        error.message || "DB entity is not as an object.",
      );
    }
    if (error instanceof Error && error.message) {
      throw new HttpError(Status.InternalServerError, error.message);
    }
  }
}
