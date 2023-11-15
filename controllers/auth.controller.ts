import {
  AlosaurRequest,
  AlosaurResponse,
  Controller,
  Ctx,
  Get,
  HttpContext,
  Post,
  QueryParam,
  Req,
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
  signIn(@QueryParam("passcode") passcode: string, @Res() response: AlosaurResponse, @Req() request: AlosaurRequest) {
    if (APP_CONFIG.passcode !== passcode) {
      throw new NotAuthenticatedError("Invalid passcode.");
    }
    const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('Host');
    const domain = host ? new URL(`http://${host}`).hostname : undefined;
    setCookie(response.headers, {
      name: "authenticated",
      value: "1",
      domain,
      path: "/",
      httpOnly: true,
      sameSite: APP_CONFIG.cors ? 'None' : 'Lax',
      secure: APP_CONFIG.cors ? true : undefined
    });
    return "";
  }

  @Post("/sign-out")
  signOut(@Res() response: AlosaurResponse, @Req() request: AlosaurRequest) {
    const host = request.headers.get('X-Forwarded-Host') ?? request.headers.get('Host');
    const domain = host ? new URL(`http://${host}`).hostname : undefined;
    deleteCookie(response.headers, "authenticated", {
      domain,
      path: "/",
      sameSite: APP_CONFIG.cors ? 'None' : 'Lax',
      secure: APP_CONFIG.cors ? true : undefined
    } as object);
    return "";
  }
}
