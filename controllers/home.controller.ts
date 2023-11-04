import { Content, Controller, Get, QueryParam } from "../deps/alosaur.ts";

@Controller()
export class HomeController {
  @Get("/query-name")
  text(@QueryParam("name") name: string) {
    return Content(`Hey! ${name}`);
  }
}
