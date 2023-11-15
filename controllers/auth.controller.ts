import {
  Controller,
  Get,
  Post,
  QueryParam,
  Res,
  UseHook,
} from "../deps/alosaur.ts";
import { deleteCookie, setCookie } from "../deps/std/http.ts";
import { AuthHook } from "../hooks/auth.hook.ts";
import { APP_CONFIG } from "../utils/app-config.ts";
import { NotAuthenticatedError } from "../utils/errors.ts";

@Controller("/auth")
export class AuthController {
  @UseHook(AuthHook)
  @Get()
  check() {
    return "";
  }

  @Post("/sign-in")
  signIn(@QueryParam("passcode") passcode: string, @Res() response: Response) {
    if (APP_CONFIG.passcode !== passcode) {
      throw new NotAuthenticatedError("Invalid passcode.");
    }
    setCookie(response.headers, {
      name: "authenticated",
      value: "1",
      path: "/",
      httpOnly: true,
      sameSite: APP_CONFIG.cors ? 'None' : 'Lax',
      secure: APP_CONFIG.cors ? true : undefined
    });
    return "";
  }

  @Post("/sign-out")
  signOut(@Res() response: Response) {
    deleteCookie(response.headers, "authenticated", {
      path: "/",
      sameSite: APP_CONFIG.cors ? 'None' : 'Lax',
      secure: APP_CONFIG.cors ? true : undefined
    });
    return "";
  }
}
