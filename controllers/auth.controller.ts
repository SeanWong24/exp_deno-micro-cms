import {
  Controller,
  Get,
  HttpError,
  Post,
  QueryParam,
  Res,
  UseHook,
} from "../deps/alosaur.ts";
import { deleteCookie, setCookie, Status } from "../deps/std/http.ts";
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
