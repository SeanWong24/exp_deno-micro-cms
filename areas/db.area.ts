/// <reference lib="deno.unstable" />

import { Area, Body, Controller, Delete, Get, Post, Req } from "alosaur/mod.ts";
import { STRING_BODY_PARSER } from "../utils/string-body-parser.ts";

const KV = await Deno.openKv();
const DB_CONTROLLER_PATH = "/db";

@Controller(DB_CONTROLLER_PATH)
export class DBController {
  @Get(/.*/)
  async getValue(@Req() request: Request) {
    const path = new URL(request.url).pathname.slice(
      `${DB_CONTROLLER_PATH}/`.length,
    );
    if (!path) return;
    const keyArray = path.split("/");
    return (await KV.get(keyArray)).value;
  }

  @Post(/.*/)
  async setValue(
    @Req() request: Request,
    @Body(STRING_BODY_PARSER) value: string,
  ) {
    const path = new URL(request.url).pathname.slice(
      `${DB_CONTROLLER_PATH}/`.length,
    );
    if (!path) return;
    const keyArray = path.split("/");
    return await KV.set(keyArray, value);
  }

  @Delete(/.*/)
  async deleteValue(@Req() request: Request) {
    const path = new URL(request.url).pathname.slice(
      `${DB_CONTROLLER_PATH}/`.length,
    );
    if (!path) return;
    const keyArray = path.split("/");
    return await KV.delete(keyArray);
  }
}

@Area({
  controllers: [DBController],
})
export class DBArea {}
