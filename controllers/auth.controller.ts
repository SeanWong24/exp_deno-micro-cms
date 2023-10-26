import {
  Controller,
  Get,
  HttpError,
  Post,
  QueryParam,
  Res,
  UseHook,
} from "alosaur/mod.ts";
import { Status } from "std/http/http_status.ts";
import { deleteCookie, setCookie } from "std/http/cookie.ts";
import { AuthHook } from "../utils/auth.hook.ts";

@Controller("/auth")
export class AuthController {
  @UseHook(AuthHook)
  @Get()
  check() {
    return "";
  }

  @Post("/sign-in")
  signIn(@QueryParam("passcode") passcode: string, @Res() response: Response) {
    const truthPasscode = Deno.env.get("PASSCODE");
    if (truthPasscode !== passcode) {
      throw new HttpError(Status.Forbidden, "Invalid passcode.");
    }
    setCookie(response.headers, {
      name: "authenticated",
      value: "1",
      path: "/",
      httpOnly: true,
    });
    return "";
  }

  @Post("/sign-out")
  signOut(@Res() response: Response) {
    deleteCookie(response.headers, "authenticated", { path: "/" });
    return "";
  }
}
