import { HookTarget, HttpContext, HttpError } from "alosaur/mod.ts";
import { Status } from "std/http/http_status.ts";
import { getCookies } from "std/http/cookie.ts";

export class AuthHook implements HookTarget<unknown, unknown> {
  /**
   *  this hook run before controller action
   */
  onPreAction(context: HttpContext<unknown>, _payload: unknown) {
    const headers = context.request.headers;
    const cookies = getCookies(headers);
    if (!cookies["authenticated"]) {
      throw new HttpError(Status.Forbidden);
    }
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
  onCatchAction(_context: HttpContext<unknown>, _payload: unknown) {
  }
}
