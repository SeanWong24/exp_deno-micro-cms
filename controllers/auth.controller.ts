import { Controller, HttpError, Post, QueryParam, Res } from "alosaur/mod.ts";
import { Status } from "std/http/http_status.ts";
import { deleteCookie, setCookie } from "std/http/cookie.ts";

@Controller("/auth")
export class AuthController {
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
